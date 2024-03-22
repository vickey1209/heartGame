import logger from "../logger";
import { EVENTS, EVENT_EMITTER, PLAYER_STATE } from "../../constants";
import {
  sendEventToRoom,
  addClientInRoom,
  sendEventToClient,
  leaveClientInRoom,
} from "../socket";
import commonEventEmitter from "../commonEventEmitter";
import { initializeGameplayForFirstRound } from "../play/initialiseGame";
import startRound from "../play/startRound";
import { startUserCardPassTurn } from "../play/cardPass/startUserCardPassTurn";
import { autoCardPassHandle } from "../play/cardPass/autoCardPassHandle";
import { cardChangeHandle } from "../play/cardPass/cardChangeHandle";
import { startUserTurn } from "../play/turn/startUserTurn";
import { cardThrowTurnExpire } from "../play/turn/turnExpire";
import winOfRound from "../play/winOfRound";
import { initialNewRoundStartTimerIf, playerTurnTimerIf, winnerDeclareTimerIf } from "../interface/schedulerIf";
import scoreOfRound from "../play/scoreOfRound";
import startNewRound from "../play/startNewRound";


function addPlayInTableRoomEvent(payload: any) {
  const { socket, data } = payload;
  addClientInRoom(socket, data.tableId);
}
commonEventEmitter.on(EVENTS.ADD_PLAYER_IN_TABLE_ROOM, addPlayInTableRoomEvent);


function joinTableEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.JOIN_TABLE_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.JOIN_TABLE_SOCKET_EVENT, joinTableEvent);

commonEventEmitter.on(EVENT_EMITTER.INITIALIZE_GAME_PLAY, initializeGameplayForFirstRound);


function roundTimerStartedEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.ROUND_TIMER_STARTED_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.ROUND_TIMER_STARTED_SOCKET_EVENT, roundTimerStartedEvent);


function lockInPeriodEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.LOCK_IN_PERIOD_POPUP_SCOKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.LOCK_IN_PERIOD_POPUP_SCOKET_EVENT, lockInPeriodEvent);


function collectBootValueEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT, collectBootValueEvent);

commonEventEmitter.on(EVENT_EMITTER.ROUND_STARTED, startRound);


function showCardEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_MY_CARDS_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}
commonEventEmitter.on(EVENTS.SHOW_MY_CARDS_SOCKET_EVENT, showCardEvent);

commonEventEmitter.on(EVENT_EMITTER.INITIAL_CARD_PASS_TURN_TIMER_EXPIRED, startUserCardPassTurn);


function startUserCardPassTurnEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.USER_CARD_PASS_TURN_STARTED_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.USER_CARD_PASS_TURN_STARTED_SOCKET_EVENT, startUserCardPassTurnEvent);

commonEventEmitter.on(EVENT_EMITTER.CARD_PASS_TURN_TIMER_EXPIRED, autoCardPassHandle);

function cardPassEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.CARD_PASS_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.CARD_PASS_SOCKET_EVENT, cardPassEvent);


function preCardPassEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.PRE_CARD_PASS_SELECT_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}
commonEventEmitter.on(EVENTS.PRE_CARD_PASS_SELECT_SOCKET_EVENT, preCardPassEvent);


commonEventEmitter.on(EVENT_EMITTER.CARD_CHANGE_TIMER_EXPIRED, cardChangeHandle);

function cardMoveEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.CARD_MOVE_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.CARD_MOVE_SOCKET_EVENT, cardMoveEvent);

commonEventEmitter.on(EVENT_EMITTER.INITIAL_USER_TURN_TIMER_EXPIRED, startUserTurn);

function userTurnStartEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.USER_TURN_STARTED_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.USER_TURN_STARTED_SOCKET_EVENT, userTurnStartEvent);

commonEventEmitter.on(EVENT_EMITTER.PLAYER_TURN_TIMER_EXPIRED, (res: playerTurnTimerIf) => {
  logger.info('call on :: PLAYER_TURN_TIMER_EXPIRED :: ------>>', res);
  cardThrowTurnExpire(res.tableId, res.tableGamePlay, res.playerGamePlay, res?.isAutoMode || false);
});

function userThrowCardEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT, userThrowCardEvent);


commonEventEmitter.on(EVENT_EMITTER.WIN_OF_ROUND_TIMER, (res: any) => winOfRound(res.tableId));

function winOfRoundEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.WIN_OF_ROUND_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.WIN_OF_ROUND_SOCKET_EVENT, winOfRoundEvent);

commonEventEmitter.on(EVENT_EMITTER.WINNER_DECLARE_TIMER, (res: winnerDeclareTimerIf) => {
  logger.info('call on : WINNER_DECLARE_TIMER :: ', res);
  scoreOfRound(res.tableId);
});

function leaveTableEvent(payload: any) {
  const { socket, tableId, flag, data } = payload;
  if (flag === PLAYER_STATE.DISCONNECT || flag === PLAYER_STATE.LEFT) {
    leaveClientInRoom(socket, tableId);
  }
  const responseData = {
    en: EVENTS.LEAVE_TABLE_SCOKET_EVENT,
    data,
  };

  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.LEAVE_TABLE_SCOKET_EVENT, leaveTableEvent);


function timeOutToLeaveTable(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.TIME_OUT_LEAVE_TABLE_POPUP_SCOKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}
commonEventEmitter.on(EVENTS.TIME_OUT_LEAVE_TABLE_POPUP_SCOKET_EVENT, timeOutToLeaveTable);


function backInGamePlayingEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT, backInGamePlayingEvent);


function showPopUpMessages(payload: any) {
  const { socket, tableId, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_POPUP,
    data,
  };
  if (socket) {
    sendEventToClient(socket, responseData);
  }
  else {
    sendEventToRoom(tableId, responseData);
  }
}
commonEventEmitter.on(EVENTS.SHOW_POPUP, showPopUpMessages);


function winnerDeclareEvent(payload: any) {
  const { socket, tableId, data } = payload;
  const responseData = {
    en: EVENTS.WINNER_DECLARE_SOCKET_EVENT,
    data,
  };
  if (socket) {
    sendEventToClient(socket, responseData);
  }
  else {
    sendEventToRoom(tableId, responseData);
  }
}
commonEventEmitter.on(EVENTS.WINNER_DECLARE_SOCKET_EVENT, winnerDeclareEvent);

commonEventEmitter.on(EVENT_EMITTER.START_NEW_ROUND_TIMER, (res: initialNewRoundStartTimerIf) => {
  logger.info('call on : start New Round :: ', res);
  startNewRound(res.tableId);
});

function scoreBoardEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_SCORE_BOARD,
    data,
  };
  sendEventToClient(socket, responseData);
}
commonEventEmitter.on(EVENTS.SHOW_SCORE_BOARD, scoreBoardEvent);


function shootingMoonEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.SHOOTING_MOON_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
commonEventEmitter.on(EVENTS.SHOOTING_MOON_SOCKET_EVENT, shootingMoonEvent);





























