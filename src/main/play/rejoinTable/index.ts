import logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import socketAck from "../../../socketAck";
import { EVENTS, TABLE_STATE, NUMERICAL, EMPTY } from "../../../constants";
import { redisConnection } from "../../../connections";
import { playerGamePlayCache, roundScoreHistoryCache, roundTablePlayCache, tableGamePlayCache, turnHistoryCache, userProfileCache } from "../../cache";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { getConfig } from '../../../config';
import { userIf } from "../../interface/user";
import { getTimeDifference } from "../../../common";
import { formatRejoinTableInfo, formatScoreDataForWinner, formatSingUpInfo } from "../helper/formatePlayHelper";
import { formatWinnerDeclareIf } from "../../interface/responseIf";

// user back in game play
const rejoinPlayingTable = async (
  userId: string,
  tableId: string,
  roomFlag: boolean,
  socket: any,
  flag: boolean,
  ack?: Function
) => {
  const socketId = socket.id;
  const { getRedLock } = redisConnection;
  const { TIME_OUT_COUNT } = getConfig();
  const rejoinPlayingTableLock = await getRedLock.acquire([`${userId}`, `${tableId}`], 2000);
  try {
    logger.info(`rejoinPlayingTable :: >> :: TIME_OUT_COUNT :: -->> `, TIME_OUT_COUNT);

    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const { currentRound } = tableGamePlay;
    let userTurnTimer = tableGamePlay.userTurnTimer;
    let gameStartTimer = tableGamePlay.gameStartTimer;
    let cardPassTimer = tableGamePlay.cardPassTimer;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;
    const playerGamePlay: playerGamePlayIf = await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf;
    logger.info(`rejoinPlayingTable :: >> :: tableGamePlay :: ------>> `, tableGamePlay);
    logger.info(`rejoinPlayingTable :: >> :: roundTablePlay :: ----->> `, roundTablePlay);
    logger.info(`rejoinPlayingTable :: >> :: playerGamePlay :: ----->> `, playerGamePlay);
    const { seatIndex } = playerGamePlay;
    const playerSeats = roundTablePlay.seats;
    playerGamePlay.socketId = socket.id;

    if (
      playerGamePlay.turnTimeout >= TIME_OUT_COUNT ||
      playerGamePlay.isAuto
    ) {
      playerGamePlay.turnTimeout = NUMERICAL.ZERO;
      playerGamePlay.isAuto = false; // change
    }
    logger.info(`rejoinPlayingTable :: set : playerGamePlay :: >>`, playerGamePlay);
    await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

    logger.info(
      tableId,
      "rejoinPlayingTable : tableGamePlay :: --->>",
      tableGamePlay,
      " : rejoinPlayingTable : roundTablePlay :: --->>",
      roundTablePlay,
      " : rejoinPlayingTable : playerSeats :: --->>",
      playerSeats,
      " : rejoinPlayingTable : playerGamePlay :: --->> ",
      playerGamePlay,
      " : rejoinPlayingTable : userId :: --->>",
      userId
    );

    const playerGamePlayData: playerGamePlayIf[] = [];
    for await (const seat of roundTablePlay.seats) {
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      playerGamePlayData.push(playerGamePlay);
    }

    if (roundTablePlay.currentTurn === null) {
      roundTablePlay.currentTurn = EMPTY;
    }
    logger.info(" rejoinPlayingTable : playersPlayingData : leave table : playerGamePlayData :: ", playerGamePlayData);

    const difftime = await getTimeDifference(roundTablePlay.updatedAt, new Date());
    logger.info(" rejoinPlayingTable :: >> :: difftime ::", difftime);

    /* user turn Timer handle */
    const time = userTurnTimer - difftime;
    let currentTurnTimer: number = NUMERICAL.ZERO;
    if (roundTablePlay.tableState === TABLE_STATE.ROUND_STARTED) {
      if (time > NUMERICAL.ZERO && time <= userTurnTimer) {
        currentTurnTimer = time;
      }
    }
    roundTablePlay.currentUserTurnTimer = currentTurnTimer;
    logger.info(
      "rejoinPlayingTable ::: time ::",
      time,
      "rejoinPlayingTable ::: currentTurnTimer ::",
      currentTurnTimer
    );

    /*game start Timer handle */
    let currentGameStartTimer: number = NUMERICAL.ZERO;
    const gameStartTime = gameStartTimer - difftime;
    if (
      roundTablePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD ||
      roundTablePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
      roundTablePlay.tableState === TABLE_STATE.SCOREBOARD_DECLARED
    ) {
      if (gameStartTime > NUMERICAL.ZERO && gameStartTime <= gameStartTimer) {
        currentGameStartTimer = gameStartTime;
      }
    }
    roundTablePlay.currentGameStartTimer = currentGameStartTimer;
    logger.info(
      "rejoinPlayingTable : gameStartTime ::",
      gameStartTime,
      "rejoinPlayingTable : currentGameStartTimer ::",
      currentGameStartTimer
    );

    /*card pass Timer handle */
    let currentCardPassTimer: number = NUMERICAL.ZERO;
    const cardPassTime = cardPassTimer - difftime;
    if (roundTablePlay.tableState === TABLE_STATE.CARD_PASS_ROUND_STARTED) {
      if (cardPassTime > NUMERICAL.ZERO && cardPassTime <= cardPassTimer) {
        currentCardPassTimer = cardPassTime;
      }
    }
    roundTablePlay.currentCardPassTimer = currentCardPassTimer;
    logger.info(
      "rejoinPlayingTable :: cardPassTime ::",
      cardPassTime,
      "rejoinPlayingTable :: currentCardPassTimer ::",
      currentCardPassTimer
    );

    logger.info("rejoinPlayingTable :: tableGamePlay ::: -------------->>>", tableGamePlay);
    logger.info("rejoinPlayingTable :: roundTablePlay ::: ------------->>> ", roundTablePlay);

    socket.eventMetaData = {
      userId: roundTablePlay.seats[seatIndex].userId,
      tableId
    };

    const userData: userIf = await userProfileCache.getUserProfile(userId) as userIf;
    logger.info(" userData :: =======>>", userData);
    userData.tableId = tableId;
    await userProfileCache.insertUserProfile(userId, userData);


    const sendEventData = await formatRejoinTableInfo(
      playerGamePlay,
      tableGamePlay,
      roundTablePlay,
      playerGamePlayData,
      userData
    );
    const eventSignUpData = await formatSingUpInfo(userData);

    logger.info(" sendEventData  ::===>>", JSON.stringify(sendEventData));
    logger.info(" eventSignUpData ::===>>", eventSignUpData);
    logger.info(" flag ::===>>", flag);

    socketAck.ackMid(
      EVENTS.SIGN_UP_SOCKET_EVENT,
      {
        SIGNUP: eventSignUpData,
        GAME_TABLE_INFO: sendEventData,
      },
      socket.userId,
      tableId,
      ack
    );

    if (roomFlag) {
      // add user in playing Room
      commonEventEmitter.emit(EVENTS.ADD_PLAYER_IN_TABLE_ROOM, {
        socket,
        data: { tableId },
      });
    }

    // send back_in_game_playing Socket Event
    // replace with join table
    commonEventEmitter.emit(EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT, {
      tableId: tableId,
      data: { seatIndex },
    });
    logger.info("roundPlayingTable.tableState :==>> ", roundTablePlay.tableState, JSON.stringify(roundTablePlay)
    );

    if (roundTablePlay.tableState === TABLE_STATE.SCOREBOARD_DECLARED) {
      logger.info(' <<-------------------:  SCOREBOARD_DECLARED :----------------->> ', tableId);

      let roundScoreHistory = await roundScoreHistoryCache.getRoundScoreHistory(tableId);
      logger.info(' roundScoreHistory ::==>> ', JSON.stringify(roundScoreHistory));
      roundScoreHistory = roundScoreHistory || { history: [] };

      const roundScore = await formatScoreDataForWinner(roundScoreHistory.history);
      logger.info('roundScore ::===>> ', JSON.stringify(roundScore));

      let winnerSI: any[] = [];
      for (let i = NUMERICAL.ONE; i <= roundTablePlay.totalPlayers; i++) {
        const turnHistory = await turnHistoryCache.getTurnHistory(tableId, i);
        logger.info(tableId, 'turnHistory ::==>> ', JSON.stringify(turnHistory));
        if (turnHistory && turnHistory.winnerSI.length !== NUMERICAL.ZERO) {
          winnerSI = turnHistory.winnerSI;
          break;
        }
      }
      logger.info(' SCOREBOARD_DECLARED :: currentTurnTimer :---->> ', currentGameStartTimer, "winnerSI :: ---->>", winnerSI);

      let sendEventData: formatWinnerDeclareIf = {
        timer: currentGameStartTimer,
        winner: winnerSI,
        roundScoreHistory: roundScore,
        roundTableId: tableId,
        nextRound: roundTablePlay.currentRound
      };

      // send Winner_Declare Socket Event
      commonEventEmitter.emit(EVENTS.WINNER_DECLARE_SOCKET_EVENT, {
        socket: socketId,
        data: sendEventData,
      });

    }

    return true;

  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : rejoinPlayingTable :: userId: ${userId} : tableId: ${tableId}`,
      e
    );
  } finally {
    if (rejoinPlayingTableLock) {
      await getRedLock.release(rejoinPlayingTableLock);
    }
  }
};

export = rejoinPlayingTable;
