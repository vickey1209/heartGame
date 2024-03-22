import logger from "../../logger";
import { TABLE_STATE, NUMERICAL } from "../../../constants";
import cancelBattle from "../cancelBattle";
import Errors from "../../errors";
import { redisConnection } from "../../../connections";
import roundStartTimerQueue from "../../../scheduler/queues/roundStartTimer.queue";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache, userProfileCache } from "../../cache";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { defaultPlayerGamePlayData, defaultRoundTablePlayData } from "../../defaultData";
import { playerGamePlayIf, tempPlayerGamePlayIf } from "../../interface/playerGamePlay";
import { userIf } from "../../interface/user";

// management All User and Round Data for next Round
const startNewRound = async (tableId: string) => {
  logger.info(" startNewRound ....: tableId :: ", tableId);
  const { getRedLock } = redisConnection;
  const startNewRoundLock = await getRedLock.acquire([`${tableId}`], 2000);
  try {
    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const { currentRound } = tableGamePlay;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId,currentRound) as roundTablePlayIf;
    logger.info(" startNewRound : roundTablePlay :: ", roundTablePlay);
    // re-set up playing data for next round
    let tempRoundTablePlay : roundTablePlayIf = await defaultRoundTablePlayData({ tableId, noOfPlayer: roundTablePlay.totalPlayers, currantRound : roundTablePlay.currentRound });
    logger.info(" startNewRound : tempRoundTablePlay :: ", tempRoundTablePlay );

    tableGamePlay.currentRound += NUMERICAL.ONE;
    const seats = roundTablePlay.seats;
    tempRoundTablePlay.seats = seats;
    tempRoundTablePlay.tableState = TABLE_STATE.ROUND_TIMER_STARTED;
    tempRoundTablePlay.totalPlayers = roundTablePlay.totalPlayers;
    tempRoundTablePlay.currentTieRound = roundTablePlay.currentTieRound;
    tempRoundTablePlay.tableCurrentTimer = new Date();
    tempRoundTablePlay.updatedAt = new Date();
    logger.info(' startNewRound :: tempRoundTablePlay :: >> ', tempRoundTablePlay);

    await roundTablePlayCache.insertRoundTablePlay(tempRoundTablePlay, tableId, tableGamePlay.currentRound);
    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    // re-set up user data for next round
    for await (const seat of roundTablePlay.seats) {

      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      logger.info(' startNewRound :: playerGamePlay :: >> ', playerGamePlay);

      const userProfile = await userProfileCache.getUserProfile(seat.userId) as userIf;
      logger.info(' startNewRound :: userProfile :: >> ', userProfile);

      const data : tempPlayerGamePlayIf = {
        userId : playerGamePlay.userId,
        username : playerGamePlay.username,
        profilePic : playerGamePlay.profilePic,
        socketId : playerGamePlay.socketId,
        isBot : playerGamePlay.isBot
      }

      const tempPlayerGameData = await defaultPlayerGamePlayData(data, playerGamePlay.seatIndex, tableId );
      tempPlayerGameData.userId = playerGamePlay.userId;
      tempPlayerGameData.totalPoint = JSON.parse(JSON.stringify(playerGamePlay.totalPoint));
      tempPlayerGameData.isAuto = playerGamePlay.isAuto;
      tempPlayerGameData.isLeft = playerGamePlay.isLeft;
      tempPlayerGameData.isBot = playerGamePlay.isBot;
      await playerGamePlayCache.insertPlayerGamePlay(tempPlayerGameData, tableId);
    }

    // set Scheduler for start Next Round
    await roundStartTimerQueue({
      timer: (NUMERICAL.ONE) * NUMERICAL.FIVE_HUNDRED, // in milliseconds
      jobId: tableId,
      tableId,
      tableGamePlay: tableGamePlay,
      roundTablePlay: tempRoundTablePlay,
    });
    logger.info(" startNewRound :::: new Round Start ::::: ");
  } catch (e) {
    logger.error(tableId, 
      `CATCH_ERROR :: startNewRound :: tableId :: ${tableId} `,
      e
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    if(startNewRoundLock){
      await getRedLock.release(startNewRoundLock);
    }
  }
};

export = startNewRound;
