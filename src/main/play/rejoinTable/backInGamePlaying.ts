import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import { ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE } from '../../../constants';
import socketAck from '../../../socketAck';
import { redisConnection } from '../../../connections/redis';
import { playerGamePlayCache } from '../../cache';
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import { throwErrorIF } from '../../interface/throwError';
import commonEventEmitter from '../../commonEventEmitter';


// handle Re-join User in Game for Inform All Player this Player is Back in game
const backInGamePlaying = async (socket: any, ack?: Function) => {
  const { tableId, userId } = socket.eventMetaData;
  logger.info(
    ' tableId : backInGamePlaying :: ',
    tableId,
    ':: socket.id : backInGamePlaying :: ',
    socket.id,
  );
  const socketId = socket.id;
  const { getRedLock } = redisConnection;
  const backInGamePlayingLock = await getRedLock.acquire([`${tableId}`], 2000);

  try {
    const playerGamePlay: playerGamePlayIf = await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf;

    if (!playerGamePlay) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_CARD_PASS_ERROR,
        message: MESSAGES.ERROR.USER_DETAIL_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const seatIndex = playerGamePlay.seatIndex;
    playerGamePlay.isAuto = false;
    playerGamePlay.turnTimeout = NUMERICAL.ZERO;
    playerGamePlay.userStatus = PLAYER_STATE.PLAYING;
    await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

    // send Back_in_Game_Playing Socket Event
    CommonEventEmitter.emit(EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT, {
      tableId: tableId,
      data: { seatIndex },
    });

    if (ack) {
      socketAck.ackMid(
        EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT,
        {
          success: true,
          error: null,
          tableId,
        },
        socket.userId,
        tableId,
        ack,
      );
    }
    return true;
  } catch (error: any) {
    logger.error(tableId,
      `CATCH_ERROR : backInGamePlaying :: tableId: ${tableId} :: userId: ${userId}`,
      error,
    );

    if (error && error.type === ERROR_TYPE.USER_CARD_PASS_ERROR) {
      commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: socketId,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
          message: error.message,
        },
      });
    } else {
      commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          message: MESSAGES.ERROR.COMMON_ERROR,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    }

    return false;
  } finally {
    if (backInGamePlayingLock) {
      await getRedLock.release(backInGamePlayingLock);
    }
  }
};
export = backInGamePlaying;
