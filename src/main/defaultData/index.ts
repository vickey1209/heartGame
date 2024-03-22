const { ObjectId } = require("mongodb")
import { EMPTY, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../constants";
import { tempPlayerGamePlayIf } from "../interface/playerGamePlay";
import { defaultRoundTablePlayIf } from "../interface/roundTablePlay";
import { defaultTableGamePlayIf } from "../interface/tableGamePlay";
import { userIf } from "../interface/user";
import logger from '../logger';


function defaultUserData(signUpData: userIf) {
  // generates the user default fields for the game
  const currentTimestamp = new Date();

  const data = {
    _id: new ObjectId().toString(),
    authToken: signUpData.authToken,
    isFTUE: signUpData.isFTUE,
    username: signUpData.username,
    lobbyId: signUpData.lobbyId.toString(),
    gameId: signUpData.gameId,
    startTime: signUpData.startTime,
    balance: signUpData.balance,
    userId: signUpData.userId,
    tableId: signUpData.tableId,
    profilePic: signUpData.profilePic,
    minPlayer: signUpData.minPlayer,
    noOfPlayer: signUpData.noOfPlayer,
    winningAmount: signUpData.winningAmount,
    gameStartTimer: signUpData.gameStartTimer,
    userTurnTimer: signUpData.userTurnTimer,
    entryFee: signUpData.entryFee,
    isUseBot: signUpData.isUseBot,
    isBot: signUpData.isBot,
    socketId: signUpData.socketId,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };
  return data;
}

// generates the Table game play default fields for the game Play
async function defaultTableGamePlayData(data: defaultTableGamePlayIf) {
  const currentTimestamp = new Date();
  const tableId = new ObjectId().toString();

  return {
    _id: tableId,
    tableId: tableId,
    gameType: data.gameType,
    lobbyId: data.lobbyId,
    gameId: data.gameId,
    minimumPlayers: data.minPlayer,
    totalPlayers: data.noOfPlayer,
    currentRound: NUMERICAL.ONE,
    gameStartTimer: data.gameStartTimer,
    userTurnTimer: data.userTurnTimer,
    cardPassTimer: data.userTurnTimer,
    isTieGame: false,
    entryFee: data.entryFee,
    winningAmount: data.winningAmount,
    winningScores: NUMERICAL.HUNDRED,
    winner: [],
    isUseBot: data.isUseBot,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };
};

// generates the round Table play default fields for the game Play
const defaultRoundTablePlayData = async (data: defaultRoundTablePlayIf) => {
  const currentTimestamp = new Date();

  return {
    _id: new ObjectId().toString(),
    tableId: data.tableId,
    tableState: TABLE_STATE.WAITING_FOR_PLAYERS,
    currentPlayerInTable: NUMERICAL.ZERO,
    totalPlayers: data.noOfPlayer,
    currentRound: data.currantRound || NUMERICAL.ONE,
    totalHands: NUMERICAL.THIRTEEN,
    seats: [],
    currentTurn: null,
    tableCurrentTimer: null,
    cardPassTurn: false,
    turnCurrentCards: ["U-0", "U-0", "U-0", "U-0"],
    turnCardSequence: "N",
    isBreakingHearts: false,
    lastInitiater: null,
    hands: [],
    turnCount: NUMERICAL.ZERO,
    handCount: NUMERICAL.ZERO,
    isShootingMoon: false,
    isTieRound: false,
    currentTieRound: NUMERICAL.ZERO,
    isWinFlag: false,
    currentUserTurnTimer: NUMERICAL.ZERO,
    currentGameStartTimer: NUMERICAL.ZERO,
    currentCardPassTimer: NUMERICAL.ZERO,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };
};

// generates the Player game play default fields for the game Play
const defaultPlayerGamePlayData = async (
  data: userIf | tempPlayerGamePlayIf,
  seatIndex: number,
  roundTableId: string,
) => {
  const currentTimestamp = new Date();
  return {
    _id: new ObjectId().toString(),
    userId: data.userId,
    username: data.username,
    profilePic: data.profilePic,
    seatIndex: seatIndex,
    roundTableId: roundTableId,
    userStatus: PLAYER_STATE.PLAYING,
    isFirstTurn: false,
    socketId: data.socketId,
    currentCards: [],
    turnTimeout: NUMERICAL.ZERO,
    cardPassDetails: {
      status: false,
      cards: []
    },
    hands: NUMERICAL.ZERO,
    penaltyPoint: NUMERICAL.ZERO,
    spadePoint: NUMERICAL.ZERO,
    heartPoint: NUMERICAL.ZERO,
    totalPoint: NUMERICAL.ZERO,
    isLeft: false,
    isAuto: false,
    isTurn: false,
    isBot: data.isBot,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };
};


const exportObject = {
  defaultUserData,
  defaultTableGamePlayData,
  defaultRoundTablePlayData,
  defaultPlayerGamePlayData
};
export = exportObject;
