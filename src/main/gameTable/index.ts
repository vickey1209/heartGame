import logger from "../logger";
import CommonEventEmitter from "../commonEventEmitter";
import {
  NUMERICAL,
  EVENTS,
  GAME_TYPE,
  MESSAGES,
} from "../../constants";
import socketAck from "../../socketAck";
import Errors from "../errors";
import { createTable, findAvaiableTable, insertPlayerInTable, setupRound } from "./comman";
import joinTable from "./joinTable";
import { redisConnection } from "../../connections/redis";
import { userIf } from "../interface/user";
import { formatGameTableInfo, formatSingUpInfo } from "../play/helper/formatePlayHelper";
import cancelBattle from "../play/cancelBattle";
import rejoinTable from "../play/rejoinTable/rejoinTable";


// for insert new signed up player in table
const insertNewPlayer = async (
  userData: userIf,
  socket: any,
  ack?: Function
) => {
  const socketId = socket.id;
  const {
    userId,
    lobbyId,
    gameId,
    _id,
    entryFee,
    winningAmount,
    minPlayer,
    noOfPlayer,
    isUseBot
  } = userData;
  const { getRedLock } = redisConnection;
  const gameType = GAME_TYPE;
  const queueKey = `${gameType}:${lobbyId}`;
  // set lock;
  const findTableLock = await getRedLock.acquire([queueKey], 2000);
  try {
    const createOrJoinTable: boolean = await rejoinTable(
      userData,
      true,
      socket,
      ack
    );
    logger.info(userId, `createOrJoinTable :::>> `, createOrJoinTable);
    if (createOrJoinTable) {
      let tableId = await findAvaiableTable(queueKey);
      logger.info(userId, "insertNewPlayer ::: before tableId ::: ", tableId);
      if (!ack) {
        tableId = socket.tableId;
      }
      logger.info(userId, "insertNewPlayer ::: after tableId ::: ", tableId);
      if (!tableId) {
        // create new table
        tableId = await createTable({
          userId,
          gameType,
          lobbyId,
          gameId,
          gameStartTimer: userData.gameStartTimer,
          userTurnTimer: userData.userTurnTimer,
          entryFee,
          winningAmount,
          minPlayer,
          noOfPlayer,
          isUseBot
        });
        await setupRound({ tableId, noOfPlayer, roundNo: NUMERICAL.ONE })
      }
      logger.info("tableId :: >>> ", tableId);

      
      // inserting player in table
      const insertPlayerRes = await insertPlayerInTable(userData, tableId);
      if (!insertPlayerRes) throw Error('Unable to insert player in table');

      const playerGamePlay = insertPlayerRes?.playerGamePlay;
      const roundTablePlay = insertPlayerRes?.roundTablePlay;
      const tableGamePlay = insertPlayerRes?.tableGamePlay;

      logger.info(userId,
        "insertNewPlayer : playerGamePlay ---->> ", playerGamePlay,
        "insertNewPlayer : roundTablePlay ---->> ", roundTablePlay,
        "insertNewPlayer : tableGamePlay ---->> ", tableGamePlay,
      );

      if (ack) {

        const eventSignUpData = await formatSingUpInfo(userData);
        const eventGTIdata = await formatGameTableInfo(roundTablePlay, tableGamePlay, playerGamePlay, userData);

        // send (signUp And Get Table Info)both event data in signUp
        socketAck.ackMid(
          EVENTS.SIGN_UP_SOCKET_EVENT,
          {
            SIGNUP: eventSignUpData,
            GAME_TABLE_INFO: eventGTIdata,
          },
          socket.userId,
          tableId,
          ack
        );
      }
      await joinTable(socket, queueKey, userId, tableId, roundTablePlay, playerGamePlay, tableGamePlay);

    } else {
      logger.info(userId, "insertNewPlayer : rejoinTableOnKillApp :: get false :");
    }
    return true;
  } catch (error) {
    logger.error(userId,
      "CATCH_ERROR : insertNewPlayer :: ",
      userId,
      _id,
      queueKey,
      error
    );

    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        // @ts-ignore
        tableId,
        errorMessage: error,
      });
    } else if (error instanceof Errors.InsufficientFundError) {
      let nonProdMsg = "Insufficient Balance!";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      socketAck.ackMid(
        EVENTS.SIGN_UP_SOCKET_EVENT,
        {
          success: false,
          error: {
            errorCode: 500,
            errorMessage: MESSAGES.ERROR.COMMON_ERROR,
          },
        },
        // socket.metrics,
        socket.userId,
        _id,
        ack
      );
    }

  } finally {
    logger.info('insertNewPlayer : release findTableLock ...');
    try {
      if (findTableLock) await getRedLock.release(findTableLock);
    } catch (error) {
      logger.error(error, ' insertNewPlayer ');
    }
  }
};

const exportObject = {
  insertNewPlayer,
};
export = exportObject;
