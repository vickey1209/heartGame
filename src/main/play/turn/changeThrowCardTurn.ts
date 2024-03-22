import logger from "../../logger";
import Errors from "../../errors";
import { redisConnection } from "../../../connections/redis";
import { NUMERICAL } from "../../../constants";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { roundTablePlayIf, seatsInterface } from "../../interface/roundTablePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import getNextPlayer from "../common/getNextPlayer";
import { getConfig } from "../../../config";
import getPreviousPlayer from "../common/getPreviousPlayer";
import initialUserTurnTimerQueue from "../../../scheduler/queues/initialUserTurnTimer.queue";
import winOfRoundSetupTimerQueue from "../../../scheduler/queues/winOfRoundSetupTimer.queue";
import cancelBattle from "../cancelBattle";

// change User Throw Card Turn
export async function changeThrowCardTurn(tableId: string) {
  const { IS_CLOCKWISE_TURN } = getConfig();
  logger.debug(" changeThrowCardTurn : started with tableId :: ", tableId, " IS_CLOCKWISE_TURN :: ==>>", IS_CLOCKWISE_TURN);
  const { getRedLock } = redisConnection;
  const changeThrowCardTurnLock = await getRedLock.acquire([`${tableId}`], 2000);
  try {
    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const { currentRound } = tableGamePlay;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;
    const lastTurnPlayerData: playerGamePlayIf = await playerGamePlayCache.getPlayerGamePlay(roundTablePlay.currentTurn, tableId) as playerGamePlayIf;
    lastTurnPlayerData.isTurn = false;
    await playerGamePlayCache.insertPlayerGamePlay(lastTurnPlayerData, tableId);

    const playersGameData: playerGamePlayIf[] = await Promise.all(
      roundTablePlay.seats.map(async (ele) => await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId) as playerGamePlayIf)
    );

    logger.info(" changeThrowCardTurn : playersGameData :: ", playersGameData);
    logger.info(" changeThrowCardTurn : tableGamePlay :: ", tableGamePlay);

    let nextPlayer: seatsInterface = {} as seatsInterface;
    if (IS_CLOCKWISE_TURN) {
      nextPlayer = await getNextPlayer(
        roundTablePlay.seats,
        roundTablePlay.currentTurn
      );
    } else {
      nextPlayer = await getPreviousPlayer(
        roundTablePlay.seats,
        roundTablePlay.currentTurn,
      )
    }

    logger.info(" changeTurn ::: roundTablePlay.lastInitiater ::==>> ", roundTablePlay.lastInitiater);
    logger.info(" changeTurn ::: nextPlayer ::==>> ", nextPlayer);

    // match fist Initiater and Last Initiater are Not equal then declare winnwer of turn and change User Turn
    if (roundTablePlay.lastInitiater !== nextPlayer.userId) {

      const playerGamePlay: playerGamePlayIf = await playerGamePlayCache.getPlayerGamePlay(nextPlayer.userId, tableId) as playerGamePlayIf;
      playerGamePlay.isTurn = true;
      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      logger.info(tableId,
        "changeThrowCardTurn : userId :: ",
        playerGamePlay.userId,
        "playerGamePlay :: ",
        playerGamePlay,
        " : nextPlayer :1: ",
        nextPlayer,
        " : nextPlayer :2: ",
        roundTablePlay.lastInitiater
      );

      // Schedule Turn Setup Timer
      await initialUserTurnTimerQueue({
        timer: NUMERICAL.ONE * NUMERICAL.FIVE_HUNDRED,
        tableId: tableId,
        tableGamePlay,
        nextTurn : nextPlayer.userId,
      })

    } else{
      /*
       * Initiater Match to Call Winner Declare of Round
       */
      await winOfRoundSetupTimerQueue({
        timer: NUMERICAL.ONE * NUMERICAL.THOUSAND, // change 2 to 1
        jobId: `${tableId}:${tableGamePlay.currentRound}`,
        tableId,
      });

    }
    return true;
  } catch (e) {
    logger.error(tableId,
      `CATCH_ERROR : changeThrowCardTurn : tableId: ${tableId} :: `,
      e
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    if (changeThrowCardTurnLock) {
      await getRedLock.release(changeThrowCardTurnLock);
    }
  }
};


