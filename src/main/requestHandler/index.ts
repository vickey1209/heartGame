import logger from "../logger";
import { EVENTS } from "../../constants";
import heartBeatHandle from "./heartBeat";
import signUpHandler from "./signUp";
import cardPassHandler from "./cardPassHandler";
import throwCardHandler from "./throwCardHandler";
import backInGamePlayingHandler from "./backInGamePlayingHandler";
import showScoreBoardHandler from "./showScoreBoard";
import leaveTableHandler from "./leaveTable";
import preCardPassSelectHandler from "./preCardPassSelectHandler";

async function requestHandler(
  this: any,
  [reqEventName, payload, ack]: Array<any>,
  // @ts-ignore
  next
): Promise<boolean> {

  const socket: any = this;
  const body = typeof payload == 'string' ? JSON.parse(payload) : payload;

  if (reqEventName != EVENTS.HEART_BEAT_SOCKET_EVENT) {
    logger.warn("---------------------------------------------------------------------------------------------------------------------------------------------------------------------------")
    logger.warn(" UNITY-SIDE :: REQUEST_HANDLER ::: reqEventName :::: ==>>", reqEventName);
    logger.warn(" UNITY-SIDE :: REQUEST_HANDLER ::: body :::: ==>>", reqEventName, body);
    logger.warn("---------------------------------------------------------------------------------------------------------------------------------------------------------------------------")
  }
  socket.userId = socket.userId;

  if (!socket) {
    logger.error(new Error("socket instance not found"));
  }

  const data = body;
  try {
    if (typeof body.data == "undefined" && typeof body.en == "undefined") {
      throw new Error("Data not valid!");
    }
    if (!socket) {
      throw new Error("socket instance not found");
    }

    switch (reqEventName) {
      case EVENTS.HEART_BEAT_SOCKET_EVENT: // Heart beat
        heartBeatHandle(data, socket, ack);
        break;
      case EVENTS.SIGN_UP_SOCKET_EVENT: // User SignUp
        signUpHandler(data, socket, ack);
        break;
      case EVENTS.CARD_PASS_SOCKET_EVENT: // User CardPass
        cardPassHandler(data, socket, ack);
        break;
      case EVENTS.PRE_CARD_PASS_SELECT_SOCKET_EVENT: // User preCardPass
        preCardPassSelectHandler(data, socket, ack);
        break;
      case EVENTS.USER_THROW_CARD_SOCKET_EVENT: // User user throw card
        throwCardHandler(data, socket, ack);
        break;
      case EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT: // Back in game playing
        backInGamePlayingHandler(data, socket, ack)
        break;
      case EVENTS.SHOW_SCORE_BOARD: // Show Score Board
        showScoreBoardHandler(data, socket, ack)
        break;
      case EVENTS.LEAVE_TABLE_SCOKET_EVENT: // user Leave
        leaveTableHandler(data, socket, ack);
        break;
      default:
        break;
    }
  } catch (error) {
    logger.error(
      "CATCH_ERROR in eventHandler for event: ",
      reqEventName,
      error
    );
  }
  return false;
}

export = requestHandler;
