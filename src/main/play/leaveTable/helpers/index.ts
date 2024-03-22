import logger from '../../../logger';
import Errors from '../../../errors';
import { EMPTY, NUMERICAL, TABLE_STATE } from '../../../../constants';
import { redisConnection } from '../../../../connections/redis';
import { playerGamePlayIf } from '../../../interface/playerGamePlay';
import { roundTablePlayIf, seatsInterface } from '../../../interface/roundTablePlay';
import { tableGamePlayIf } from '../../../interface/tableGamePlay';
import { playerGamePlayCache, rejoinDataCache, roundScoreHistoryCache, roundTablePlayCache, tableGamePlayCache, turnHistoryCache, userProfileCache } from '../../../cache';
import redis from '../../../redis';
import cancelBattle from '../../cancelBattle';
import winnerDeclareTimerQueue from '../../../../scheduler/queues/winnerDeclareTimer.queue';
import roundStartTimerCancel from '../../../../scheduler/cancelJob/roundStartTimerCancel.cancel';
import { initializeGameTimerCancel } from '../../../../scheduler/cancelJob/initializeGameTimer.cancel';
import { userIf } from '../../../interface/user';
import { socketConnection } from '../../../../connections/socket';

// player leave on Waiting Mode
const userLeaveOnWaitingPlayer = async (
  playerGamePlay: playerGamePlayIf,
  roundTablePlay: roundTablePlayIf,
  tableGamePlay: tableGamePlayIf,
) => {
  const { gameId, lobbyId, gameType, currentRound } = tableGamePlay;
  const { getRedLock } = redisConnection;
  const Key = `${gameType}:${gameId}:${lobbyId}`;
  const userLeaveOnWaitingPlayerLock = await getRedLock.acquire([Key], 2000);
  try {

    const seats: seatsInterface[] = roundTablePlay.seats.filter(
      (seat: seatsInterface) => seat.userId !== playerGamePlay.userId
    );
    roundTablePlay.seats = seats;

    roundTablePlay.currentPlayerInTable -= NUMERICAL.ONE;
    roundTablePlay.tableState = TABLE_STATE.WAITING_FOR_PLAYERS;
    roundTablePlay.tableCurrentTimer = new Date();
    roundTablePlay.updatedAt = new Date();

    logger.info("  userLeaveOnWaitingPlayer :: roundTablePlay :: >> ", roundTablePlay);
    await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, roundTablePlay.tableId, currentRound)

    await playerGamePlayCache.deletePlayerGamePlay(playerGamePlay.userId, tableGamePlay._id);
    logger.info(" remove user from playing --------------------->>>> ", playerGamePlay.userId);

    await userProfileCache.deleteUserProfile(playerGamePlay.userId);
    await rejoinDataCache.removeRejoinTableHistory(playerGamePlay.userId, gameId, lobbyId);

  } catch (e) {
    logger.error(
      `CATCH_ERROR : userLeaveOnWaitingPlayer : lobbyId: ${lobbyId} : gameType: ${gameType} : gameId: ${gameId} : tableId: ${roundTablePlay.tableId}:: `,
      e,
    );
    throw e;
  } finally {
    if (userLeaveOnWaitingPlayerLock) {
      await getRedLock.release(userLeaveOnWaitingPlayerLock);
    }
  }
};

// remove playing table Document after All User Leave
const manageLeaveTable = async (tableId: string) => {
  const { getRedLock } = redisConnection;
  const key = `${NUMERICAL.ONE}:${tableId}`;
  const manageLeaveTableLock = await getRedLock.acquire([key], 2000);
  try {

    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const currentRound = tableGamePlay.currentRound;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;

    logger.info('manageLeaveTable : call : roundTablePlay :: ', roundTablePlay);

    let ucount: number = roundTablePlay.seats.length;
    let totalPlayers: number = Number(roundTablePlay.totalPlayers);
    logger.info('manageLeaveTable :: ucount :: ==>>>', ucount, "  totalPlayers :: ", totalPlayers);

    if (ucount === NUMERICAL.ZERO) {
      logger.info('manageLeaveTable : delete :---');
      // Remove Playing Document and History
      removeAllPlayingTableAndHistory(tableGamePlay, roundTablePlay, currentRound);
    } else if (ucount === NUMERICAL.FOUR && totalPlayers === NUMERICAL.FOUR) {
      // delear Winner
      declareWinner(tableId);
    }
  } catch (e) {
    logger.error(`CATCH_ERROR : manageLeaveTable : tableId: ${tableId} :: `, e);
    throw e;
  } finally {
    logger.info(' manageLeaveTable : Lock :: ', key);
    if (manageLeaveTableLock) {
      await getRedLock.release(manageLeaveTableLock);
    }
  }
};

// Remove Playing Document and History
const removeAllPlayingTableAndHistory = async (
  tableGamePlay: tableGamePlayIf,
  roundTablePlay: roundTablePlayIf,
  updatedCurrentRound: number,
  ) => {
  const { socketClient }: any = socketConnection;
  
  logger.info('removeAllPlayingTableAndHistory : call : tableId :: -->> ', tableGamePlay._id);
  logger.info('removeAllPlayingTableAndHistory : call : updatedCurrentRound :: -->>', updatedCurrentRound);

  const {
    _id: tableId,
    currentRound,
    gameId,
    lobbyId,
    gameType,
  } = tableGamePlay;
  const { getRedLock } = redisConnection;
  const key = `${lobbyId}:${tableId}`;
  const removeAllPlayingTableAndHistoryLock = await getRedLock.acquire(
    [key],
    2000,
  );
  try {
    const { seats: playerSeats, tableState } = roundTablePlay;
    logger.info(' removeAllPlayingTableAndHistory..... :: tableId ::', tableId);
    const queueKey = `${gameType}:${lobbyId}`;

    if (tableState === TABLE_STATE.WAITING_FOR_PLAYERS) {
      //remove table on Queue
      logger.info('removeAllPlayingTableAndHistory : popTableFromQueue :: popTableFromQueue.');

      // await popTableFromQueue(queueKey);
      logger.info(tableId, ' remTableFromQueue :>> queueKey :: ', queueKey);
      await redis.commands.remFromQueue(queueKey, tableId);
    }
    //Remove Playing Table in redis
    await tableGamePlayCache.deleteTableGamePlay(tableId);

    // Remove All User Deatil in Redis
    playerSeats.filter(async (player: seatsInterface) => {

      const userData: userIf = await userProfileCache.getUserProfile(player.userId) as userIf;

      const socketInstance = await socketClient.sockets.sockets.get(userData.socketId);
      logger.info('socketInstance :====>> ', socketInstance?.connected);
      
      if(socketInstance && socketInstance.connected){
        userData.tableId = EMPTY;
        await userProfileCache.insertUserProfile(player.userId, userData);
      }
      
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(player.userId, tableId) as playerGamePlayIf;
      if (playerGamePlay.isLeft == false) {
        userProfileCache.deleteUserProfile(player.userId);
      }
      logger.info(tableId, "remove user from playing ----------->>> player.userId :: ", player.userId);

      playerGamePlayCache.deletePlayerGamePlay(player.userId, tableId);

      const userRejoinInfo = await rejoinDataCache.getRejoinTableHistory(
        player.userId,
        gameId,
        lobbyId,
      );
      if (userRejoinInfo) {
        const storeInRedis = {
          userId: player.userId,
          tableId,
          isEndGame: true,
        };
        await rejoinDataCache.insertRejoinTableHistory(
          player.userId,
          gameId,
          lobbyId,
          storeInRedis,
        );
      }
    })


    for (let i = NUMERICAL.ONE; i <= currentRound; i++) {
      logger.info(logger.info, 'removeAllPlayingTableAndHistory :: remove roundTablePlay :: i :: ', i);
      // Remove All Round Detail in Redis
      roundTablePlayCache.deleteRoundTablePlay(tableId, i);
      // Remove All Round Turn History Detail in Redis
      turnHistoryCache.deleteTurnHistory(tableId, i);
    }

    //Remove Scour History in redis
    await roundScoreHistoryCache.deleteRoundScoreHistory(tableId);

    return true;
  } catch (e) {
    logger.error(
      `CATCH_ERROR : removeAllPlayingTableAndHistory : tableId:${tableId} :: currentRound:${currentRound} :: gameId: ${gameId} :: lobbyId: ${lobbyId} :: gameType: ${gameType} : `,
      e,
    );
  } finally {
    logger.info('removeAllPlayingTableAndHistory : Lock : ', key);
    if (removeAllPlayingTableAndHistoryLock) {
      await getRedLock.release(removeAllPlayingTableAndHistoryLock);
    }
  }
};

// delear Winner
const declareWinner = async (tableId: string) => {
  logger.info(`declareWinner ::: call ... `);
  const { getRedLock } = redisConnection;
  const declareWinnerLock = await getRedLock.acquire([tableId], 2000);
  try {
    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const currentRound = tableGamePlay.currentRound;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;

    const playerSeats = roundTablePlay.seats;
    const { totalPlayers } = roundTablePlay;
    logger.info(`declareWinner ::: call next One :: playerSeats : ${JSON.stringify(playerSeats)}`);

    const playerGamePlayData: playerGamePlayIf[] = [];
    for await (const seat of roundTablePlay.seats) {
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      playerGamePlayData.push(playerGamePlay);
    }

    let isUserLeftCount = NUMERICAL.ZERO;
    for (let i = NUMERICAL.ZERO; i < playerGamePlayData.length; i++) {
      const player = playerGamePlayData[i];
      if (player.isLeft) {
        isUserLeftCount += NUMERICAL.ONE;
      }
    }

    logger.info('declareWinner Timer in Leave User ::  totalPlayers :: ', totalPlayers, " isUserLeftCount :: ", isUserLeftCount);
    if (isUserLeftCount >= NUMERICAL.THREE && totalPlayers == NUMERICAL.FOUR) {
      logger.info('roundTablePlay :------------------->> ', roundTablePlay);
      await winnerDeclareTimerQueue({
        timer: NUMERICAL.ZERO * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId: tableId,
      });
    }
    return true;

  } catch (e) {
    logger.error(`CATCH_ERROR : declareWinner : tableId: ${tableId} :: `, e);
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info('declareWinner :: Lock ::---');
    if (declareWinnerLock) {
      await getRedLock.release(declareWinnerLock);
    }
  }
};

const userLeaveOnLock = async (
  playerGamePlay: playerGamePlayIf,
  roundTablePlay: roundTablePlayIf,
  tableGamePlay: tableGamePlayIf,
) => {
  const { _id: tableId } = tableGamePlay;

  let sendStatus = false;
  if (roundTablePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED ) {
    await initializeGameTimerCancel(`initializeGameplay:${tableId}`);
    await roundStartTimerCancel(`roundStartTimer:${tableId}`);
    await userLeaveOnWaitingPlayer(playerGamePlay, roundTablePlay, tableGamePlay);

  } else if (roundTablePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD) {
    sendStatus = true;
  }
  return sendStatus;
};
const exportObject = {
  userLeaveOnWaitingPlayer,
  manageLeaveTable,
  removeAllPlayingTableAndHistory,
  declareWinner,
  userLeaveOnLock,
};
export = exportObject;
;