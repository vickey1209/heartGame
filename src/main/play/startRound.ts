/* eslint-disable prefer-destructuring */
const _ = require("underscore");
import logger from "../logger";
import {
  EVENTS,
  NUMERICAL,
  TABLE_STATE,
} from "../../constants";
import CommonEventEmitter from "../commonEventEmitter";
import { roundStartTimerIf } from "../interface/schedulerIf";
import Errors from "../errors";
import { redisConnection } from "../../connections/redis";
import { playerGamePlayCache, roundTablePlayCache } from "../cache";
import { distributeCards } from "./helper/distributeCards";
import { playerGamePlayIf } from "../interface/playerGamePlay";
import { updateCardsByRoundId } from "./updatePlayersCards";
import { eventDataIf } from "../interface/startRoundIf";
import { formatCardDistribution } from "./helper/formatePlayHelper";
import initialCardPassTurnSetupTimerQueue from "../../scheduler/queues/initialCardPassTurnSetupTimer.queue";
import { addTurnHistory } from "./history/addTurnHistory";
import cancelBattle from "./cancelBattle";

/**
 * start round for players
 */
async function startRound(data: roundStartTimerIf) {
  logger.debug("startRound :: data :: >>", data);
  const { roundTablePlay, tableGamePlay, tableId } = data;
  const { getRedLock } = redisConnection;
  const startRoundLock = await getRedLock.acquire([`${tableId}`], 2000);

  try {
    const { seats } = roundTablePlay;
    const { currentRound } = roundTablePlay;

    logger.info(" startRound :: roundTablePlay :: -->> ", roundTablePlay);
    logger.info(" startRound :: tableGamePlay :: -->> ", tableGamePlay);
    logger.info("currentRound :: -->>", currentRound);

    const playerGamePlayData: playerGamePlayIf[] = [];
    for await (const seat of roundTablePlay.seats) {
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      playerGamePlayData.push(playerGamePlay);
    }

    const usersCards = await distributeCards(playerGamePlayData);
    logger.info('usersCards : =>> ', usersCards);

    roundTablePlay.tableState = TABLE_STATE.START_DEALING_CARD;
    roundTablePlay.tableCurrentTimer = new Date();
    roundTablePlay.updatedAt = new Date();

    await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, tableGamePlay.currentRound);

    // RETURNS ARRAY containing playerGamePlay data and update PGP
    const playersData = await updateCardsByRoundId(
      seats,
      usersCards,
      tableId
    );

    /**
     * this function moves the dealer to index 0 in array while keeping the order
     */

    const eventData: eventDataIf = {
      usersCards,
      playerGamePlayData,
      seatIndex: -NUMERICAL.ONE,
      currentRound,
    };

    for (let i = NUMERICAL.ZERO; i < playersData.length; ++i) {
      const player = playersData[i];
      eventData.seatIndex = i;
      // Send Show My Card Event
      logger.info(tableId, "startRound : player :: ==>> ", player);
      const formattedData = await formatCardDistribution(eventData);

      CommonEventEmitter.emit(EVENTS.SHOW_MY_CARDS_SOCKET_EVENT, {
        socket: player.socketId,
        data: formattedData,
      });

    }

    logger.info(tableId,
      " startRound :: tableData :: >>",
      tableGamePlay,
      " playersData :: >>",
      playersData,
    );

    /*
      add Turn History forment
    */
    await addTurnHistory(tableId, roundTablePlay);


    /* 
      scheduling 4 sec timer for card distribute animation
    */
    await initialCardPassTurnSetupTimerQueue({
      timer: NUMERICAL.EIGHT * NUMERICAL.THOUSAND,
      jobId: `${tableId}:${roundTablePlay.currentRound}`,
      tableId,
      tableGamePlay,
      playersData,
    });

  } catch (e) {
    logger.error(tableId,
      `CATCH_ERROR : startRound :: tableId: ${tableId}  :`,
      e
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    if(startRoundLock){
      await getRedLock.release(startRoundLock);
    }
  }
}

export = startRound;
