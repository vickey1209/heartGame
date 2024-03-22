import logger from "../logger";
import { EMPTY, EVENTS, MESSAGES, NUMERICAL } from "../../constants";
import { userSignUpIf, userIf } from "../interface/user";
import socketAck from "../../socketAck";
import findOrCreateUser from "./helper/findOrCreateUser";
import { insertNewPlayer } from "../gameTable";
import { userProfileCache } from "../cache";
import { redisConnection } from "../../connections/redis";

async function userSignUp(data: userSignUpIf, socket: any, ack?: Function) {
  const { getRedLock } = redisConnection;
  const signUpLock = await getRedLock.acquire([data.userId], 2000);
  const { userId } = data;
  try {
    const signUpData = { ...data, tableId : EMPTY, socketId: socket.id };
    logger.info(userId, 'signUpData  =:>> ', signUpData);
    const userData = await findOrCreateUser(signUpData) as userIf;

    let userDetail = <userIf>{};
    if (userData) {

      userDetail = await userProfileCache.getUserProfile(userData.userId) as userIf;
      logger.info(userId, "userDetail :: ==>> ", userDetail);

      await insertNewPlayer(userDetail, socket, ack);
    }
    return true;
  } catch (error) {
    logger.error(userId, "CATCH_ERROR :userSignUp :: ", data, error);

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
      "",
      ack
    );
  } finally {
    if (signUpLock) {
      await getRedLock.release(signUpLock);
    }
  }
}

const exportObject = {
  userSignUp,
};
export = exportObject;
