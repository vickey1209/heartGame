import logger from "../../logger";
import {
  EVENTS,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
} from "../../../constants";
import CommonEventEmitter from "../../commonEventEmitter";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { socketDataIf } from "../../interface/schedulerIf";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { roundTablePlayIf, seatsInterface } from "../../interface/roundTablePlay";
import { leaveTable } from "../../play/leaveTable";


async function cancelBattleAckToClient(
  errMsg: string,
  tableGamePlay: tableGamePlayIf,
  playerGamePlay: playerGamePlayIf[],
) {
  for (let i = 0; i < playerGamePlay.length; i++) {
    const userPGP = playerGamePlay[i];

    if (userPGP && userPGP.socketId && userPGP.userId) {
      const socketObj : socketDataIf = {
        id: userPGP.socketId,
        eventMetaData: {
          tableId: tableGamePlay._id,
          userId: userPGP.userId,
        },
      };
      await leaveTable(tableGamePlay._id, PLAYER_STATE.LEFT, socketObj, undefined);

      let nonProdMsg = errMsg;
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: userPGP.socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.COMMON_ERROR,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    }
  }
}

async function cancelBattle(cancelBattleInput: any) {
  const { tableId, errorMessage } = cancelBattleInput;
  try {

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const { currentRound } = tableGamePlay;
    const roundTablePlay = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;
    logger.info(" ----: tableGamePlay data for table to cancelBattle :---- ",tableId);
    logger.info('===============================================================');
    logger.info('======================= cancelBattle ==========================');
    logger.info('===============================================================');

    const playerGamePlayData: any = await Promise.all(
        roundTablePlay.seats.map(async (userSeat: seatsInterface) => {
          return await playerGamePlayCache.getPlayerGamePlay(userSeat.userId, tableId) as playerGamePlayIf;
        })
      );
    logger.debug("playersPlayingData  :: ", playerGamePlayData, "  playersPlayingData for tableId ::: ", tableId);

    // send event to client
    await cancelBattleAckToClient(
      "Cancel Battle",
      tableGamePlay,
      playerGamePlayData
    );

    return true;
  } catch (error) {
    logger.error(tableId,
      `CATCH_ERROR : Found error at cancelBattle : table - ${cancelBattleInput && cancelBattleInput.tableId
        ? cancelBattleInput.tableId
        : ""
      }`,
      error
    );
    return false;
  }
}

export = cancelBattle;
