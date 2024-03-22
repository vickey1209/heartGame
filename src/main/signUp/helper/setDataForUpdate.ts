import { EMPTY } from "../../../constants";
import { userIf } from "../../interface/user";
import logger from "../../logger";

const setDataForUpdate = (signUpData: userIf) => {
  
    const currentTimestamp = new Date();
    const updateData = {
      _id: signUpData._id,
      isFTUE: signUpData.isFTUE,
      username: signUpData.username,
      socketId: signUpData.socketId,
      lobbyId: signUpData.lobbyId,
      gameId: signUpData.gameId,
      startTime: signUpData.startTime,
      balance: signUpData.balance,
      userId:  signUpData.userId,
      tableId : signUpData.tableId,
      profilePic: signUpData.profilePic,
      minPlayer: signUpData.minPlayer,
      noOfPlayer: signUpData.noOfPlayer,
      winningAmount: signUpData.winningAmount,
      gameStartTimer: signUpData.gameStartTimer,
      userTurnTimer: signUpData.userTurnTimer,
      entryFee: signUpData.entryFee,
      authToken: signUpData.authToken,
      isUseBot: signUpData.isUseBot,
      isBot: signUpData.isBot,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };
  
    return updateData;
  };

export = setDataForUpdate