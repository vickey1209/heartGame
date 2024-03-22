import logger from '../../logger';
import Errors from '../../errors';
import {
  NUMERICAL,
  EVENTS,
  CARD_SEQUENCE,
  TABLE_STATE,
  EMPTY,
} from '../../../constants';
import commonEventEmitter from '../../commonEventEmitter';
import { redisConnection } from '../../../connections/redis';
import { tableGamePlayIf } from '../../interface/tableGamePlay';
import { playerGamePlayCache, rejoinDataCache, roundTablePlayCache, tableGamePlayCache } from '../../cache';
import { roundTablePlayIf, seatsInterface } from '../../interface/roundTablePlay';
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import initialUserTurnTimerQueue from '../../../scheduler/queues/initialUserTurnTimer.queue';
import winnerDeclareTimerQueue from '../../../scheduler/queues/winnerDeclareTimer.queue';
import cancelBattle from '../cancelBattle';
import { getPenaltyPoint } from '../common';
import { shootingMoonHandler } from '../shootingMoonHandler';

const winOfRound = async (tableId: string) => {
  logger.info('winOfRound : started with tableId : ', tableId);
  const { getRedLock } = redisConnection;
  const winOfRoundLock = await getRedLock.acquire([`${tableId}`], 2000);
  try {

    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const { currentRound } = tableGamePlay;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;

    logger.info(tableId,
      ' winOfRound : changeThrowCardTurn : roundTablePlay :: ',
      roundTablePlay,
      ' :: winOfRound : tableGamePlaytableGamePlay :: ',
      tableGamePlay,
    );

    const { winSeatIndex }: any = await checkWinnerOfRound(roundTablePlay);
    logger.info(' winOfRound : started with winSeatIndex : ', winSeatIndex);

    const { penaltyPoint, spadePoint, heartPoint } = await getPenaltyPoint(roundTablePlay.turnCurrentCards);
    logger.info(' WIN_OF_ROUND :: penaltyPoint  ==================>> ', penaltyPoint);
    
    let heartFlag : boolean = false;
    for (let i = 0; i < roundTablePlay.turnCurrentCards.length; i++) {
      const ele = roundTablePlay.turnCurrentCards[i];
      let temp = ele.split('-')[0];
      if(temp == CARD_SEQUENCE.CARD_HEARTS){
        heartFlag = true;
      }
    }
    
    logger.info(' WIN_OF_ROUND :: heartFlag  ==================>> ', heartFlag);

    if (penaltyPoint > NUMERICAL.ZERO && heartFlag) {
      roundTablePlay.isBreakingHearts = true;
    }

    roundTablePlay.turnCurrentCards = ['U-0', 'U-0', 'U-0', 'U-0'];
    const seat = roundTablePlay.seats;
    roundTablePlay.turnCardSequence = CARD_SEQUENCE.CARD_NONE;
    const winUser: seatsInterface = seat.find((key: seatsInterface) => key.si === winSeatIndex) as seatsInterface;
    logger.info(' winOfRound : started with index : ', winUser);

    const winId = winUser.userId;
    roundTablePlay.lastInitiater = winId;
    roundTablePlay.handCount += NUMERICAL.ONE;
    roundTablePlay.isWinFlag = true;
    roundTablePlay.tableCurrentTimer = new Date();
    roundTablePlay.updatedAt = new Date();

    const playerGamePlay: playerGamePlayIf = await playerGamePlayCache.getPlayerGamePlay(winId, tableId) as playerGamePlayIf;
    playerGamePlay.hands += NUMERICAL.ONE;
    playerGamePlay.penaltyPoint = playerGamePlay.penaltyPoint + penaltyPoint;
    playerGamePlay.spadePoint = playerGamePlay.spadePoint + spadePoint;
    playerGamePlay.heartPoint = playerGamePlay.heartPoint + heartPoint;

    await Promise.all([
      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
      await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound)
    ])

    const eventData = {
      seatIndex: winSeatIndex,
      handCount: playerGamePlay.hands,
      penaltyPoint: playerGamePlay.penaltyPoint,
      spadePoint: playerGamePlay.spadePoint,
      heartPoint: playerGamePlay.heartPoint,
      currentSpadePoint: spadePoint,
      currentHeartPoint: heartPoint,
      isBreakingHearts: roundTablePlay.isBreakingHearts
    };

    commonEventEmitter.emit(EVENTS.WIN_OF_ROUND_SOCKET_EVENT, {
      tableId: tableId,
      data: eventData,
    });

    logger.info(' WIN_OF_ROUND :: penaltyPoint  ===================>> ', penaltyPoint);
    logger.info(' WIN_OF_ROUND :: hand :: handCount  ==============>> ', roundTablePlay.handCount);
    logger.info(' WIN_OF_ROUND :: turn complete... :: turnCount ==>>', roundTablePlay.turnCount);

    let totalPointSum: number = NUMERICAL.ZERO;
    for await (const seat of roundTablePlay.seats) {

      if (roundTablePlay.seats.length != NUMERICAL.ZERO) {
        logger.info(tableId, " user from playing set rejoin flag :::: --------------->>>", seat.userId);

        if (roundTablePlay.handCount === NUMERICAL.THIRTEEN) {
          const userRejoinInfo = await rejoinDataCache.getRejoinTableHistory(
            seat.userId,
            tableGamePlay.gameId,
            tableGamePlay.lobbyId,
          );
          if (userRejoinInfo) {
            const storeInRedis = {
              userId: seat.userId,
              tableId,
              isEndGame: true,
            };
            await rejoinDataCache.insertRejoinTableHistory(
              seat.userId,
              tableGamePlay.gameId,
              tableGamePlay.lobbyId,
              storeInRedis,
            );
          }
        }
      }

      //total round point count
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      totalPointSum = totalPointSum + playerGamePlay.penaltyPoint;
    }
    logger.info(' WIN_OF_ROUND :: turn complete... :: totalPointSum ==================>>>', totalPointSum);

    // winner check
    if (roundTablePlay.handCount == NUMERICAL.THIRTEEN || totalPointSum == NUMERICAL.TWENTY_SIX) {

      //check shooting moon cases;
      const { isShootingMoon, shootingMoonData } = await shootingMoonHandler(tableId);
      logger.info(" isShootingMoon :: ---->> ", isShootingMoon);
      let timer: number = NUMERICAL.ONE;
      if (isShootingMoon) {
        logger.info(" isShootingMoon :: IN ---->> ");
        timer = NUMERICAL.THIRTEEN;
        roundTablePlay.tableState = TABLE_STATE.SHOOTING_MOON;
        commonEventEmitter.emit(EVENTS.SHOOTING_MOON_SOCKET_EVENT, {
          tableId: tableId,
          data: shootingMoonData,
        });

      }else{
        roundTablePlay.tableState = TABLE_STATE.SCOREBOARD_DECLARED;
      }
      roundTablePlay.isShootingMoon = isShootingMoon;
      roundTablePlay.tableCurrentTimer = new Date();
      roundTablePlay.updatedAt = new Date();
      await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound);

      logger.info(" winnerDeclareTimerQueue :: timer :: ------>> ", timer);

      await winnerDeclareTimerQueue({
        timer: timer * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId: tableId,
      });


    } else {

      // set THIRTEEN
      playerGamePlay.isTurn = true;
      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
      logger.info('WIN_OF_ROUND  ::  turn complete.', roundTablePlay.turnCount);

      // Schedule Turn Setup Timer
      await initialUserTurnTimerQueue({
        timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
        tableId: tableId,
        tableGamePlay,
        nextTurn: winId,
      })
      
    }

    return true;
  } catch (e) {
    logger.error(`CATCH_ERROR : winOfRound : tableId: ${tableId} error ::`, e);
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info('winOfRound : Lock : ', tableId);
    if (winOfRoundLock) {
      await getRedLock.release(winOfRoundLock);
    }
  }
};

async function checkWinnerOfRound(roundTablePlay: roundTablePlayIf) {
  try {

    logger.info(" checkWinnerOfRound :: roundTablePlay :: ", roundTablePlay);
    const seat = roundTablePlay.seats;
    const userId = roundTablePlay.lastInitiater;
    const userSeat: any = seat.find((key: seatsInterface) => key.userId === userId);
    let lastInitiater: number = -NUMERICAL.ONE;
    if (typeof userSeat !== 'undefined')
      lastInitiater = userSeat.si;

    const round_Card = roundTablePlay.turnCurrentCards;
    let copy_Round_Card = roundTablePlay.turnCurrentCards;
    const turnCardSequence = roundTablePlay.turnCardSequence;
    let temp_Card: string[] = [];
    let win = -NUMERICAL.ONE;

    logger.info(
      ' ---------------------------------->>  checkWinnerOfRound : userId :: ',
      userId,
      ' : checkWinnerOfRound : userSeat :: ',
      userSeat,
      ' : checkWinnerOfRound : lastInitiater :: ',
      lastInitiater,
      ' : checkWinnerOfRound : lastInitiater : typeof :: ',
      typeof lastInitiater,
      ' : checkWinnerOfRound : turnCardSequence :: ---->>>',
      turnCardSequence,
      ' : checkWinnerOfRound : round_Card :: ------>>',
      round_Card,
      ' : checkWinnerOfRound : copy_Round_Card :: ',
      copy_Round_Card,
    );

    temp_Card.push(copy_Round_Card[lastInitiater]);
    for (let i = NUMERICAL.ZERO; i < NUMERICAL.THREE; i++) {
      if (lastInitiater == NUMERICAL.THREE) {
        lastInitiater = NUMERICAL.ZERO;
        temp_Card.unshift(copy_Round_Card[lastInitiater]);
      } else {
        lastInitiater += NUMERICAL.ONE;
        temp_Card.unshift(copy_Round_Card[lastInitiater]);
      }
    }
    logger.info('checkWinnerOfRound : temp_Card :: ', temp_Card);
    copy_Round_Card = [...temp_Card];
    logger.info('checkWinnerOfRound : copy_Round_Card :: ', copy_Round_Card);
    for (let ci = NUMERICAL.ZERO; ci <= NUMERICAL.THREE; ci++) {
      if (copy_Round_Card[ci].split('-')[NUMERICAL.ONE] === '1') {
        copy_Round_Card[ci] = copy_Round_Card[ci].split('-')[NUMERICAL.ZERO] + '-' + '14';
      }
    }
    if (
      copy_Round_Card.length != NUMERICAL.FOUR ||
      turnCardSequence === CARD_SEQUENCE.CARD_NONE
    ) {
      logger.error('checkWinnerOfRound : Winner of turn :: ', roundTablePlay);
    } else {
      win = -NUMERICAL.ONE;

      for (let index = NUMERICAL.ZERO; index <= NUMERICAL.THREE; index++) {
        let currentCardSequence = copy_Round_Card[index].charAt(NUMERICAL.ZERO);
        if (currentCardSequence === turnCardSequence) {
          let winflag: number = -NUMERICAL.ONE;
          if (index === Number(NUMERICAL.THREE)) {
            winflag = index;
          } else {
            for (
              let index2 = NUMERICAL.ZERO;
              index2 <= NUMERICAL.THREE;
              index2++
            ) {
              if (copy_Round_Card[index2].charAt(NUMERICAL.ZERO) != EMPTY) {
                if (copy_Round_Card[index2].charAt(NUMERICAL.ZERO) === turnCardSequence) {
                  logger.info(
                    "checkWinnerOfRound : parseInt(copy_Round_Card[index].split('-')[1]) :: ",
                    parseInt(copy_Round_Card[index].split('-')[NUMERICAL.ONE]),
                    " : checkWinnerOfRound : parseInt(copy_Round_Card[index2].split('-')[1]) :: ",
                    parseInt(copy_Round_Card[index2].split('-')[NUMERICAL.ONE]),
                  );

                  if (
                    parseInt(copy_Round_Card[index].split('-')[NUMERICAL.ONE]) <
                    parseInt(copy_Round_Card[index2].split('-')[NUMERICAL.ONE])
                  ) {
                    winflag = -NUMERICAL.ONE;
                    break;
                  } else {
                    winflag = index;
                  }
                } else {
                  winflag = index;
                }
              } else {
                winflag = -NUMERICAL.ONE;
                break;
              }
            }
          }
          logger.info(
            'checkWinnerOfRound :: temp_Card : temp_Card :: ',
            temp_Card,
            ' :: checkWinnerOfRound :: winflag :: --->> :: ',
            winflag,
          );

          if (winflag != -NUMERICAL.ONE) {
            logger.info(
              'checkWinnerOfRound : round_Card : 11 :: ',
              round_Card,
              ' :: checkWinnerOfRound :: copy_Round_Card  : 22 :: ',
              copy_Round_Card,
              ' :: checkWinnerOfRound :: winflag :: --->>',
              winflag,
            );

            win = round_Card.indexOf(temp_Card[winflag]);
            logger.info('checkWinnerOfRound : win ::', win);
            const sendData = {
              winSeatIndex: win,
            };
            return sendData;
          }
        }
      }
    }
    return {
      winSeatIndex: [],
    };
  } catch (error) {
    logger.error(
      `CATCH_ERROR : checkWinnerOfRound : tableId: ${roundTablePlay.tableId} ::`,
      error,
    );
    throw error;
  }
}

export = winOfRound;
