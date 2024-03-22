import logger from "../logger";
import UserProfile from "../signUp";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL } from "../../constants";
import socketAck from "../../socketAck";
import CommonEventEmitter from "../commonEventEmitter";
import { signUpHelperRequestIf } from "../interface/requestIf";
import Validator from "../Validator";
import Errors from "../errors";
import { getConfig } from "../../config";
import { getRandomNumber } from "../../common";
const { GAME_TURN_TIMER, GAME_START_TIMER } = getConfig();

async function signUpHandler(
  { data: signUpData }: signUpHelperRequestIf,
  socket: any,
  ack?: Function
) {
  const socketId = socket.id;
  const { userId } = signUpData;
  try {
    logger.info(
      "signUpHandler ::: socket.authToken :::",
      socket.authToken,
      "socketId ::",
      socketId
    );

    signUpData = await Validator.requestValidator.signUpValidator(signUpData);
    socket.userId = signUpData.userId;

    let data;
    data = {
      _id: EMPTY,
      isFTUE: signUpData.isFTUE ? signUpData.isFTUE : false,
      userId: socket.userId,
      profilePic:
        typeof signUpData.profilePic !== "undefined" &&
        signUpData.profilePic !== ""
          ? signUpData.profilePic
          : EMPTY,
      username:
        typeof signUpData.userName !== "undefined"
          ? signUpData.userName
          : EMPTY,
      lobbyId: signUpData.lobbyId
        ? signUpData.lobbyId
        : getRandomNumber(1111, 9999).toString(),
      gameId:
        typeof signUpData.gameId !== "undefined"
          ? signUpData.gameId
          : getRandomNumber(1111, 9999).toString(),
      startTime: NUMERICAL.ZERO,
      balance: 5000 || NUMERICAL.ZERO,
      minPlayer:
        typeof signUpData.minPlayer !== "undefined"
          ? Number(signUpData.minPlayer)
          : NUMERICAL.TWO,
      noOfPlayer:
        typeof signUpData.noOfPlayer !== "undefined"
          ? Number(signUpData.noOfPlayer)
          : NUMERICAL.TWO, //noOfPlayer as maxPlayer
      entryFee: Number(signUpData.entryFee) || NUMERICAL.ZERO,
      winningAmount:
        typeof signUpData.winningAmount !== "undefined"
          ? signUpData.winningAmount
          : EMPTY,
      gameStartTimer: Number(GAME_START_TIMER) || NUMERICAL.TEN,
      userTurnTimer: Number(GAME_TURN_TIMER) || NUMERICAL.TEN,
      authToken: socket.authToken || signUpData.accessToken,
      isUseBot: signUpData.isUseBot,
      isBot: false,
    };

    return UserProfile.userSignUp(data, socket, ack).catch((e: any) =>
      logger.error(userId, e)
    );
  } catch (error: any) {
    logger.error("CATCH_ERROR : signUpHandler ::", signUpData, error);

    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.maintanenceError) {
      let nonProdMsg = "Server under the maintenance!";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else if (error instanceof Errors.InvalidInput) {
      nonProdMsg = "Invalid Input";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
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
    } else if (error instanceof Errors.UnknownError) {
      nonProdMsg = "FAILED";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
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
    } else {
      socketAck.ackMid(
        EVENTS.SIGN_UP_SOCKET_EVENT,
        {
          success: false,
          error: {
            errorCode,
            errorMessage: msg,
          },
        },
        socket.userId,
        "", // signUpData.tableId || '',
        ack
      );
    }
  }
}

export = signUpHandler;
