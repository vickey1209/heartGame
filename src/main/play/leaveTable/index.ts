import logger from "../../logger";
import { redisConnection } from '../../../connections/redis';
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache, userProfileCache } from "../../cache";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { EMPTY, ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import commonEventEmitter from "../../commonEventEmitter";
import { throwErrorIF } from "../../interface/throwError";
import { leaveClientInRoom } from "../../socket";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { userIf } from "../../interface/user";
import { manageLeaveTable, userLeaveOnLock, userLeaveOnWaitingPlayer } from "./helpers";
import { removeRejoinTableHistory } from "../../cache/rejoinData";
import socketAck from "../../../socketAck";
import { cardThrowTurnExpire } from "../turn/turnExpire";
import playerTurnTimerCancel from "../../../scheduler/cancelJob/playerTurnTimerCancel.cancel";

/*
  Manage User Leave Table
*/
export async function leaveTable(
  tableId: string,
  flag: string,
  socket: any,
  ack?: Function,
  isLeaveFromScoreBoard: boolean = false
): Promise<any> {
  logger.info(`leaveTable STARTING .......................................................... `);
  const socketId = socket.id;
  const { getRedLock } = redisConnection;
  logger.info(
    "  leaveTable :: tableId : " + tableId + " :: flag : " + flag,
    " :: socket.eventMetaData : " + JSON.stringify(socket.eventMetaData)
  );
  logger.info(
    " leaveTable :: tableId ::" + tableId,
    " isLeaveFromScoreBoard ::>> ",
    isLeaveFromScoreBoard
  );
  const { userId } = socket.eventMetaData;
  logger.info(`leaveTable :: userId : ${userId} `);

  // set lock;
  let leaveTableLock = await getRedLock.acquire([`locks:${tableId}`], 2000);
  try {
    if (typeof flag === "undefined" || flag === "" || flag === null) flag = "";

    let playerLeave: boolean = false;
    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    logger.info(` leaveTable :: tableGamePlay ::: -->>>  ${tableGamePlay}`);

    const playerGamePlay: playerGamePlayIf = await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf;
    logger.info(` leaveTable :: playerGamePlay :::  --->>> ${playerGamePlay}`);

    if (tableGamePlay === null) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_ERROR,
        message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    if (playerGamePlay === null) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_ERROR,
        message: MESSAGES.ERROR.USER_DETAIL_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const { currentRound } = tableGamePlay;
    logger.info(` leaveTable :: tableGamePlay ::: ${tableGamePlay}`);

    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;
    logger.info(` leaveTable :: roundTablePlay ::: ${roundTablePlay}  roundTablePlay.tableState : ${roundTablePlay.tableState}`);

    if (!tableGamePlay && isLeaveFromScoreBoard) {
      const leaveTableEventRequest: any = {
        seatIndex:
          playerGamePlay && playerGamePlay?.seatIndex
            ? playerGamePlay.seatIndex
            : -1,
        currentPlayerInTable: roundTablePlay.currentPlayerInTable || 0,
        playerLeave,
        msg: PLAYER_STATE.LEFT
      };

      logger.info(" ---------------- leaveTable In scoreboard leaveTableEventRequest ---------------", leaveTableEventRequest);
      commonEventEmitter.emit(EVENTS.LEAVE_TABLE_SCOKET_EVENT, {
        socket: socket.id,
        flag: PLAYER_STATE.LOST,
        tableId,
        data: leaveTableEventRequest,
      });
      return leaveClientInRoom(socket.id, tableId);
    }

    if (typeof userId === "undefined" || userId === "" || userId === null) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_ERROR,
        message: MESSAGES.ERROR.USER_ID_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    let playerCount = NUMERICAL.ZERO;
    const playerGamePlayData: playerGamePlayIf[] = [];

    for await (const seat of roundTablePlay.seats) {
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      playerGamePlayData.push(playerGamePlay);
      if (!playerGamePlay.isLeft) {
        playerCount += NUMERICAL.ONE;
      }
    }

    logger.info(`------- leaveTable :: playerGamePlayData :: -------->>>  `, playerGamePlayData);
    logger.info(`------- leaveTable :: playerCount ::  ------->>>`, playerCount);

    if (playerCount >= NUMERICAL.ONE) {

      // user leave on scoreBoard state
      if (
        !isLeaveFromScoreBoard &&
        roundTablePlay.tableState === TABLE_STATE.SCOREBOARD_DECLARED &&
        tableGamePlay.winner.length !== NUMERICAL.ZERO
      ) {
        return false;
      }

      // user leave on waiting state
      if (roundTablePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS) {
        logger.info(" WAITING_FOR_PLAYERS :: flag ::: >> ", flag);
        await userLeaveOnWaitingPlayer(
          playerGamePlay,
          roundTablePlay,
          tableGamePlay
        );
      }

      // user leave on Round timer Started time and locking state
      else if (
        currentRound === NUMERICAL.ONE &&
        flag === PLAYER_STATE.LEFT &&
        (roundTablePlay.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
          roundTablePlay.tableState === TABLE_STATE.LOCK_IN_PERIOD)
      ) {
        const leaveStatus = await userLeaveOnLock(
          playerGamePlay,
          roundTablePlay,
          tableGamePlay
        );
        logger.info(tableId, "leaveStatus :>>", leaveStatus);
        if (leaveStatus) {
          commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
            socket,
            data: {
              isPopup: true,
              popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
              title: MESSAGES.ALERT_MESSAGE.POPUP_TITLE,
              message: MESSAGES.ALERT_MESSAGE.LOCK_IN_STATE,
            },
          });
          throw new Error("user try to leave in lock in state");
        } else {
          playerLeave = true;
        }
      } else {
        if (flag === PLAYER_STATE.LEFT) {
          playerGamePlay.isLeft = true;
        }
        playerGamePlay.isAuto = true;
        playerGamePlay.userStatus = flag;
        await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
      }

      logger.info(" leaveTable :: roundTablePlay.currentTurn :: ---->> ", roundTablePlay.currentTurn);
      logger.info(" leaveTable :: roundTablePlay.tableState :: ---->> ", roundTablePlay.tableState);

      // turn start and user leave a table
      if (roundTablePlay.currentTurn === userId) {
        if (roundTablePlay.tableState === TABLE_STATE.ROUND_STARTED) {
          await playerTurnTimerCancel(`${userId}:${tableId}:${currentRound}`);

          if (leaveTableLock) {
            await getRedLock.release(leaveTableLock);
            leaveTableLock = null;
          }
          await cardThrowTurnExpire(tableId, tableGamePlay, playerGamePlay);
        }
      }
      logger.info("leaveTable :: calll ::...........");

      if (leaveTableLock) {
        await getRedLock.release(leaveTableLock);
        leaveTableLock = null;
      }

      // manage Leave Table
      await manageLeaveTable(tableId);

      //user remove Rejoin Table History
      if (flag === PLAYER_STATE.LEFT) {
        await removeRejoinTableHistory(
          userId,
          tableGamePlay.gameId,
          tableGamePlay.lobbyId
        );
      }

      const leaveTableEventRequest: any = {
        seatIndex: playerGamePlay.seatIndex,
        currentPlayerInTable: roundTablePlay.currentPlayerInTable || 0,
        playerLeave,
        msg: PLAYER_STATE.DISCONNECTED,
      };
      if (playerGamePlay.userStatus === PLAYER_STATE.LEFT) {
        leaveTableEventRequest.msg = PLAYER_STATE.LEFT;
      }
      if (roundTablePlay.tableState === TABLE_STATE.WAITING_FOR_PLAYERS) {
        leaveTableEventRequest.msg = PLAYER_STATE.LEFT;
      }

      // send Leave Table Socket Event
      commonEventEmitter.emit(EVENTS.LEAVE_TABLE_SCOKET_EVENT, {
        socket: socket.id,
        flag,
        tableId,
        data: leaveTableEventRequest,
      });

      if (flag === PLAYER_STATE.TIMEOUT) {
        // show time out Popup (i am back popup)
        commonEventEmitter.emit(
          EVENTS.TIME_OUT_LEAVE_TABLE_POPUP_SCOKET_EVENT,
          {
            socket: socket.id,
            data: {
              title: MESSAGES.ALERT_MESSAGE.POPUP_TITLE,
              msg: MESSAGES.ERROR.TIME_OUT_POPUP_MESSAGE,
            },
          }
        );
      }

      if (flag === PLAYER_STATE.LEFT) {

        await leaveClientInRoom(socketId, tableId);

        const userData: userIf = await userProfileCache.getUserProfile(userId) as userIf;
        logger.info(' leaveTable :: userData :: ==>>> ', userData);
        if (userData) {
          userData.tableId = EMPTY;
          await userProfileCache.insertUserProfile(userId, userData);
        }

      }

    } else {
      logger.info(`------- leaveTable :: onePlayer not leave... `);
    }

    return true;
  } catch (error: any) {
    logger.error(
      tableId,
      `CATCH_ERROR : leaveTable :: tableId: ${tableId} :: userId: ${userId} :: `,
      error
    );

    if (error && error.type === ERROR_TYPE.LEAVE_TABLE_ERROR) {
      commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
          message: error.message,
        },
      });
    }
    if (ack) {
      socketAck.ackMid(
        EVENTS.LEAVE_TABLE_SCOKET_EVENT,
        {
          success: false,
          error: {
            errorCode: NUMERICAL.FIVE_HUNDRED,
            errorMessage: error && error.message ? error.message : error,
          },
          tableId,
        },
        socket.userId,
        tableId,
        ack
      );
    }
  } finally {
    logger.info("leaveTable :: Lock :: tableId :: ", tableId);
    if (leaveTableLock) {
      await getRedLock.release(leaveTableLock);
    }
  }
}
