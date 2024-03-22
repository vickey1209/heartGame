const _ = require("underscore");
import logger from "../../logger";
import {
  EVENTS,
  TABLE_STATE,
  NUMERICAL,
  MESSAGES,
  PLAYER_STATE,
} from "../../../constants";
import CommonEventEmitter from "../../commonEventEmitter";
import Errors from "../../errors";
import { initializeGameplayIf } from "../../interface/schedulerIf";
import { upadedBalanceIf } from "../../interface/responseIf";
import { redisConnection } from "../../../connections/redis";
import {
  rejoinDataCache,
  roundTablePlayCache,
  userProfileCache,
} from "../../cache";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { userIf } from "../../interface/user";
import { formatCollectBootValue } from "../helper/formatePlayHelper";
import roundStartTimerQueue from "../../../scheduler/queues/roundStartTimer.queue";
import cancelBattle from "../cancelBattle";

async function initializeGameplayForFirstRound(data: initializeGameplayIf) {
  const { tableId, roundTablePlay, tableGamePlay } = data;
  logger.info("initializeGameplayForFirstRound ===>> ", data);
  const { getRedLock } = redisConnection;
  const { lobbyId, gameId } = tableGamePlay;
  const initializeGameplayForFirstRoundLock = await getRedLock.acquire(
    [`${tableId}`],
    2000
  );
  try {
    const roundTableDataTemp = (await roundTablePlayCache.getRoundTablePlay(
      tableId,
      roundTablePlay.currentRound
    )) as roundTablePlayIf;
    if (!roundTableDataTemp) throw new Error("can't get round table data");

    const { currentPlayerInTable } = roundTableDataTemp;

    logger.info(
      "initializeGameplayForFirstRound : roundTableDataTemp :: ==>>",
      roundTableDataTemp
    );

    logger.info(
      "initializeGameplayForFirstRound : total Player in table --->> ",
      currentPlayerInTable
    );

    if (currentPlayerInTable === Number(roundTablePlay.totalPlayers)) {
      const playingUsers = roundTablePlay.seats;

      roundTablePlay.tableState = TABLE_STATE.LOCK_IN_PERIOD;
      // roundTablePlay.updatedAt = new Date();
      // roundTablePlay.tableCurrentTimer = new Date();

      await roundTablePlayCache.insertRoundTablePlay(
        roundTablePlay,
        tableId,
        roundTablePlay.currentRound
      );

      // display popUp to user are you lock in table
      CommonEventEmitter.emit(EVENTS.LOCK_IN_PERIOD_POPUP_SCOKET_EVENT, {
        tableId: roundTablePlay.tableId,
        data: {
          msg: MESSAGES.ERROR.LOCK_IN_PERIOD_MESSAGES,
        },
      });

      for await (const seat of roundTablePlay.seats) {
        if (seat.userState == PLAYER_STATE.PLAYING) {
          await rejoinDataCache.insertRejoinTableHistory(
            seat.userId,
            gameId,
            lobbyId,
            {
              userId: seat.userId,
              tableId,
              isEndGame: false,
            }
          );
        }
      }

      let bootCollectData: upadedBalanceIf[] = [];
      logger.info("----->> bootCollect :: playingUsers :: ", playingUsers);

      const userIds: string[] = _.compact(_.pluck(playingUsers, "userId"));
      logger.info(tableId, "userIds :==>> ", userIds);

      for await (const userID of userIds) {
        const userData = (await userProfileCache.getUserProfile(
          userID
        )) as userIf;
        userData.balance -= tableGamePlay.entryFee;
        await userProfileCache.insertUserProfile(userID, userData);

        const bootCollectInfo = {
          balance: userData.balance,
          userId: userID,
        };

        bootCollectData.push(bootCollectInfo);
      }

      const eventData = await formatCollectBootValue(
        { userIds },
        tableGamePlay.entryFee,
        bootCollectData
      );

      CommonEventEmitter.emit(EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT, {
        tableId: roundTablePlay.tableId,
        data: eventData,
      });

      //New low for Debit all users entry fees
      // let isEntryFeeDeductManage = await entryFeeDeductManage(tableId, roundTableData.currentRound, userIds);
      // logger.info(tableId, 'isEntryFeeDeductManage :>> ', isEntryFeeDeductManage);

      await roundStartTimerQueue({
        timer: NUMERICAL.FIVE * NUMERICAL.THOUSAND, // in milliseconds
        jobId: tableId,
        tableId,
        roundTablePlay,
        tableGamePlay,
      });
    } else {
      logger.error(
        "initializeGameplayForFirstRound : initializeGame table can't start : wait for user"
      );
    }
  } catch (error) {
    logger.error(
      `CATCH_ERROR : initializeGameplayForFirstRound :: tableId: ${tableId} :: lobbyId: ${lobbyId} :: gameId: ${gameId} `,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    } else if (error instanceof Errors.createCardGameTableError) {
      let nonProdMsg = "Insufficient Balance!";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        tableId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
      // await removeAllPlayingTableAndHistory(tableData, roundTableData, roundTableData.currentRound);
    }
  } finally {
    await getRedLock.release(initializeGameplayForFirstRoundLock);
  }
}

const exportObject = {
  initializeGameplayForFirstRound,
};
export = exportObject;
