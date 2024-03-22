import logger from "../../logger";
import {
  cardInfo,
  cardMoveIf,
  cardPassPlayersDataIf,
  formantUserThrowCardShowIf,
  formatCardDistributionIf,
  formatCardMoveIf,
  formatCardPassIf,
  formatGameTableInfoIf,
  formatJoinTableInfoIf,
  formatPreCardPassIf,
  formatRejoinTableInfoIf,
  formatSingUpInfoIf,
  formatStartUserCardPassTurnIf,
  formatStartUserTurnIf,
  upadedBalanceIf,
} from "../../interface/responseIf";
import Validator from "../../Validator";
import Errors from "../../errors";
import { userIf } from "../../interface/user";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { eventDataIf } from "../../interface/startRoundIf";
import { CARD_PASS, EMPTY, MESSAGES, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import { mainRoundScoreIf, roundScoreIf, roundScoreWinnerIf, scoreRoundWinnerIf, showScoreIf, userDetailInScoreIf, userScoreIf, userScoreRoundIf, userScoreTotalIf } from "../../interface/userScoreIf";

// Formant SingUp Event Document
async function formatSingUpInfo(userData: userIf): Promise<formatSingUpInfoIf> {
  try {
    let data = {
      _id: userData._id,
      userId: userData.userId,
      name: userData.username,
      pp: userData.profilePic,
      balance: Number(userData.balance.toFixed(2)),
    };
    data = await Validator.responseValidator.formatSingUpInfoValidator(data);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatSingUpInfo :: ", userData, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Game Table Info Event Document
const formatGameTableInfo = async (
  roundTablePlay: roundTablePlayIf,
  tableGamePlay: tableGamePlayIf,
  playerGamePlay: playerGamePlayIf,
  userData: userIf
) => {
  try {
    let resObj: formatGameTableInfoIf = {
      isRejoin: false,
      tableId: tableGamePlay.tableId,
      currentRound: tableGamePlay.currentRound,
      totalUserTurnTimer: tableGamePlay.userTurnTimer,
      totalPlayers: tableGamePlay.totalPlayers,
      minimumPlayers: tableGamePlay.minimumPlayers,
      entryFee: tableGamePlay.entryFee,
      winnningAmonut: tableGamePlay.winningAmount,
      seats: roundTablePlay.seats,
      tableState: roundTablePlay.tableState,
      seatIndex: playerGamePlay.seatIndex,
      isFTUE: userData.isFTUE
    };
    resObj = await Validator.responseValidator.formatGameTableInfoValidator(
      resObj
    );
    return resObj;
  } catch (error) {
    logger.error(tableGamePlay.tableId,
      "CATCH_ERROR : formatGameTableInfo :: ",
      tableGamePlay,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
};

// Formant Join Table Event Document
async function formatJoinTableInfo(
  roundTablePlay: roundTablePlayIf,
  playerGamePlay: playerGamePlayIf,
) {
  try {
    let data: formatJoinTableInfoIf = {
      totalPlayers: roundTablePlay.totalPlayers,
      tableId: roundTablePlay.tableId,
      seats: roundTablePlay.seats,
    };

    data = await Validator.responseValidator.formatJoinTableInfoValidator(data);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatJoinTableInfo :: ",
      playerGamePlay.seatIndex,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Collect Boot Value Event Document
async function formatCollectBootValue({ userIds }: any, entryFee: number, bootCollectData: upadedBalanceIf[]) {
  try {
    let resObj = {
      entryFee,
      userIds,
      balanceData: bootCollectData
    };

    resObj = await Validator.responseValidator.formatCollectBootValueValidator(
      resObj
    );
    return resObj;
  } catch (error) {
    logger.error(userIds,
      "CATCH_ERROR : formatCollectBootValue :: ",
      userIds,
      entryFee,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant card Distribution Event Document
async function formatCardDistribution(data: eventDataIf) {
  try {
    const { seatIndex, usersCards, currentRound } = data;

    let resObj: formatCardDistributionIf = {
      cards: usersCards[seatIndex],
      currentRound
    };
    resObj = await Validator.responseValidator.formatCardDistributionValidator(
      resObj
    );
    return resObj;
  } catch (error) {
    logger.error("CATCH_ERROR : formatCardDistribution :: ", data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}


// Formant Card Pass Turn Event Document
async function formatStartUserCardPassTurn(
  cardPassPlayersData: cardPassPlayersDataIf[],
  tableGamePlay: tableGamePlayIf,
  cardMoveSide : string,
  currentRound : number,
) {
  try {
    let data: formatStartUserCardPassTurnIf = {
      cardPassPlayersData: cardPassPlayersData,
      time: tableGamePlay.userTurnTimer,
      cardMoveSide,
      currentRound
    };
    data = await Validator.responseValidator.formatStartUserCardPassTurnValidator(
      data
    );
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatStartUserCardPassTurn :: ",
      cardPassPlayersData,
      tableGamePlay,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Card Pass Event Document
async function formatCardPass(cards: string[], userId: string, si: number): Promise<formatCardPassIf> {
  try {
    let data = {
      cards: cards,
      userId: userId,
      si
    };
    data = await Validator.responseValidator.formatCardPassValidator(data);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatCardPass :: ", cards, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}


// Formant Pre Card Pass Event Document
async function formatPreCardPass(passCards: string[], card : string, forwardCardMove : boolean, userId: string, si: number): Promise<formatPreCardPassIf> {
  try {
    let data = {
      passCards,
      card,
      forwardCardMove,
      userId: userId,
      si
    };
    data = await Validator.responseValidator.formatPreCardPassValidator(data);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatPreCardPass :: ", passCards, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}


// Formant Card Move Event Document
async function formatCardMove(playersCardMove: cardMoveIf[]): Promise<formatCardMoveIf> {
  try {
    let data = {
      playersCards: playersCardMove
    };
    data = await Validator.responseValidator.formatCardMoveValidator(data);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatCardMove :: ", playersCardMove, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Start User Turn Event Document
async function formatStartUserTurn(
  tableId: string,
  currentTurnUserId: string,
  currentTurnSI: number,
  currentRound: number,
  userTurnTimer: number,
  roundTablePlay : roundTablePlayIf
): Promise<formatStartUserTurnIf> {
  try {
    let data: formatStartUserTurnIf = {
      currentTurnUserId,
      currentTurnSI,
      currentRound,
      userTurnTimer,
      isBreakingHearts : roundTablePlay.isBreakingHearts,
      turnCardSequence : roundTablePlay.turnCardSequence,
      turnCurrentCards : roundTablePlay.turnCurrentCards,
      tableId,
    };

    data = await Validator.responseValidator.formatStartUserTurnValidator(data);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatStartUserTurn :: ", currentTurnUserId, tableId, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant User Throw Card Show Document
async function formatUserThrowCardShow(
  data: formantUserThrowCardShowIf
): Promise<formantUserThrowCardShowIf> {
  try {
    data = await Validator.responseValidator.formatUserThrowCardShowValidator(
      data
    );
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatUserThrowCardShow :: ", data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Rejoin Event Document
const formatRejoinTableInfo = async (
  playerGamePlay: playerGamePlayIf,
  tableGamePlay: tableGamePlayIf,
  roundTablePlay: roundTablePlayIf,
  playerGamePlayData: playerGamePlayIf[],
  userProfile: userIf,
) => {
  try {
    let massage : string = EMPTY;
    const { gameStartTimer, userTurnTimer, cardPassTimer } = tableGamePlay;
    logger.info("formatRejoinTableInfo  :: roundTablePlay.updatedAt  :::::===>>>> ", roundTablePlay.updatedAt);

    const cardChangeSide: number = roundTablePlay.currentRound % NUMERICAL.FOUR;
    const cardMoveSide: string = (cardChangeSide === NUMERICAL.ONE) ? CARD_PASS.LEFT : (cardChangeSide === NUMERICAL.TWO) ? CARD_PASS.RIGHT : CARD_PASS.ACROSS;
    logger.info("formatRejoinTableInfo :: cardMoveSide :: >>", cardMoveSide);

    if(roundTablePlay.tableState === TABLE_STATE.SHOOTING_MOON){
      massage = MESSAGES.ERROR.WAITING_FOR_SCORE_BOARD_GENERATED;
    }

    let data: formatRejoinTableInfoIf = {
      isRejoin: true,
      entryFee: tableGamePlay.entryFee,
      userTurnTimer: userTurnTimer,
      currentUserTurnTimer: roundTablePlay.currentUserTurnTimer,
      gameStartTimer: gameStartTimer,
      currentGameStartTimer: roundTablePlay.currentGameStartTimer,
      cardPassTimer: cardPassTimer,
      currentCardPassTimer: roundTablePlay.currentCardPassTimer,
      tableId: tableGamePlay.tableId,
      totalPlayers: tableGamePlay.totalPlayers,
      minimumPlayers: tableGamePlay.minimumPlayers,
      currentRound: tableGamePlay.currentRound,
      currentTurn: roundTablePlay.currentTurn,
      winnningAmonut: tableGamePlay.winningAmount,
      handCount : roundTablePlay.handCount,
      tableState: roundTablePlay.tableState,
      turnCurrentCards : roundTablePlay.turnCurrentCards,
      turnCardSequence : roundTablePlay.turnCardSequence,
      isBreakingHearts : roundTablePlay.isBreakingHearts,
      cardMoveSide,
      seats: roundTablePlay.seats,
      userId: playerGamePlay.userId,
      seatIndex: playerGamePlay.seatIndex,
      isFTUE: userProfile.isFTUE,
      playersDetails: playerGamePlayData,
      massage: massage
    };
    data = await Validator.responseValidator.formatRejoinTableInfoValidator(data);
    return data;
  } catch (error) {
    logger.error(tableGamePlay.tableId,
      "CATCH_ERROR : formatRejoinTableInfo :: ",
      playerGamePlay,
      tableGamePlay,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
};

//format Score Data
async function formatScoreData(
  userScore: userScoreIf[],
  roundScoreHistory: roundScoreIf[]
): Promise<mainRoundScoreIf> {

  logger.info(' formatScoreData :: userScore :--->> ', userScore);
  logger.info(' formatScoreData ::  roundScoreHistory :---->> ', roundScoreHistory);

  const roundScoreWinner: roundScoreWinnerIf[] = [];
  const roundwinner: scoreRoundWinnerIf[] = [];
  const userDetailInScore: userDetailInScoreIf[] = [];
  const userScoreTotal: userScoreTotalIf[] = [];

  userScore.forEach((element) => {
    let userStatus: string = PLAYER_STATE.PLAYING;
    if (element.isAuto === true) userStatus = PLAYER_STATE.DISCONNECTED;
    if (element.isLeft === true) userStatus = PLAYER_STATE.LEFT;

    //user details 
    userDetailInScore.push({
      username: element.username,
      profilePicture: element.profilePic,
      seatIndex: element.seatIndex,
      userStatus
    });

    //total point in all round 
    userScoreTotal.push({
      totalPoint: Number(element.totalPoint),
      seatIndex: element.seatIndex,
    });

  });

  roundScoreHistory.forEach((element) => {
    const userScores: userScoreRoundIf[] = [];
    element.roundScore.forEach((uScore) => {
      userScores.push({
        roundPoint: Number(uScore.penaltyPoint),
        heartPoint: uScore.heartPoint,
        spadePoint: uScore.spadePoint,
        seatIndex: uScore.seatIndex,
      });
    });

    // round score
    roundScoreWinner.push({
      title: element.title,
      score: userScores,
    });

    // round winner
    roundwinner.push({
      title: element.title,
      roundWinners: element.roundWinner
    })


  });

  const sendObject = {
    total: userScoreTotal,
    scores: roundScoreWinner,
    roundwinner: roundwinner,
    users: userDetailInScore,
  };
  return sendObject;
}

//format Score Data For Winner
async function formatScoreDataForWinner(
  roundScoreHistory: roundScoreIf[]
): Promise<mainRoundScoreIf> {

  const roundScoreWinner: roundScoreWinnerIf[] = [];
  const roundwinner: scoreRoundWinnerIf[] = [];
  const userDetailInScore: userDetailInScoreIf[] = [];
  const userScoreTotal: userScoreTotalIf[] = [];

  roundScoreHistory.forEach((element) => {
    const userScores: userScoreRoundIf[] = [];

    element.roundScore.forEach((uScore) => {
      let userStatus: string = PLAYER_STATE.PLAYING;
      if (uScore.isAuto === true) userStatus = PLAYER_STATE.DISCONNECTED;
      if (uScore.isLeft === true) userStatus = PLAYER_STATE.LEFT;

      userScores.push({
        roundPoint: uScore.penaltyPoint,
        heartPoint: uScore.heartPoint,
        spadePoint: uScore.spadePoint,
        seatIndex: uScore.seatIndex,
      });

      //user details 
      userDetailInScore[uScore.seatIndex] = {
        username: uScore.username,
        profilePicture: uScore.profilePic,
        seatIndex: uScore.seatIndex,
        userStatus
      };

      //total point in all round 
      userScoreTotal[uScore.seatIndex] = {
        totalPoint: uScore.totalPoint,
        seatIndex: uScore.seatIndex,
      };

    });

    logger.info('element.roundWinner :==>> ', element.roundWinner);
    // round winner
    roundwinner.push({
      title: element.title,
      roundWinners: element.roundWinner
    })

    logger.info('userScores :====>> ', userScores);
    roundScoreWinner.push({
      title: element.title,
      score: userScores,
    });

  });

  const sendObject = {
    total: userScoreTotal,
    scores: roundScoreWinner,
    roundwinner: roundwinner,
    users: userDetailInScore,
  };

  return sendObject;
}

//format show Score Data
async function formatShowScoreData(
  userScore: userScoreIf[],
  roundScoreHistory: roundScoreIf[]
): Promise<showScoreIf> {

  logger.info(' formatScoreData :: userScore :--->> ', userScore);
  logger.info(' formatScoreData ::  roundScoreHistory :---->> ', roundScoreHistory);

  const userDetailInScore: userDetailInScoreIf[] = [];
  const userScoreTotal: userScoreTotalIf[] = [];

  userScore.forEach((element) => {
    let userStatus: string = PLAYER_STATE.PLAYING;
    if (element.isAuto === true) userStatus = PLAYER_STATE.DISCONNECTED;
    if (element.isLeft === true) userStatus = PLAYER_STATE.LEFT;

    //user details 
    userDetailInScore.push({
      username: element.username,
      profilePicture: element.profilePic,
      seatIndex: element.seatIndex,
      userStatus
    });

    //total point in all round 
    userScoreTotal.push({
      totalPoint: Number(element.totalPoint),
      seatIndex: element.seatIndex,
    });

  });

  const sendObject = {
    total: userScoreTotal,
    users: userDetailInScore,
  };

  return sendObject;
}

const exportObject = {
  formatSingUpInfo,
  formatGameTableInfo,
  formatJoinTableInfo,
  formatCollectBootValue,
  formatCardDistribution,
  formatStartUserCardPassTurn,
  formatCardPass,
  formatPreCardPass,
  formatCardMove,
  formatStartUserTurn,
  formatUserThrowCardShow,
  formatRejoinTableInfo,
  formatScoreData,
  formatScoreDataForWinner,
  formatShowScoreData
};
export = exportObject;
