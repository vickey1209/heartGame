import { playerGamePlayIf } from "./playerGamePlay";
import { seatsInterface } from "./roundTablePlay";
import { mainRoundScoreIf, showScoreIf, winningAmountIf } from "./userScoreIf";

export interface formatSingUpInfoIf {
  _id: string;
  userId: string;
  name: string;
  pp: string;
  balance: number;
}

export interface formatGameTableInfoIf {
  isRejoin: boolean;
  tableId: string;
  currentRound: number;
  totalUserTurnTimer: number;
  totalPlayers: number;
  minimumPlayers: number;
  entryFee: number;
  winnningAmonut: string;
  seats: Array<seatsInterface>;
  tableState: string;
  seatIndex: number;
  isFTUE: boolean;
}

export interface formatJoinTableInfoIf {
  totalPlayers: number;
  tableId: string;
  seats: seatsInterface[];
}

export interface formatCollectBootValueIf {
  entryFee: number;
  userIds: Array<string>;
  balanceData: upadedBalanceIf[];
}

export interface upadedBalanceIf {
  userId: string;
  balance: number;
}

export interface formatCardDistributionIf {
  cards: Array<string>;
  currentRound: number;
}

export interface cardPassPlayersDataIf {
  userId: string;
  si: number;
}
export interface formatStartUserCardPassTurnIf {
  cardPassPlayersData: cardPassPlayersDataIf[];
  time: number;
  cardMoveSide: string;
  currentRound: number;
}

export interface formatCardPassIf {
  cards: Array<string>;
  userId: string;
  si: number;
}

export interface formatPreCardPassIf {
  passCards: string[];
  card: string;
  forwardCardMove: boolean;
  userId: string;
  si: number;
}

export interface cardInfo {
  card: string;
  index: number;
}

export interface cardMoveRes {
  card: string;
  isAlready: boolean;
}
export interface cardMoveIf {
  cards: cardMoveRes[];
  userId: string;
  userSI: number;
  destinationSI: number;
}

export interface formatCardMoveIf {
  playersCards: cardMoveIf[];
}
export interface formatStartUserTurnIf {
  tableId: string;
  currentRound: number;
  currentTurnUserId: string;
  currentTurnSI: number;
  userTurnTimer: number;
  isBreakingHearts: boolean;
  turnCardSequence: string;
  turnCurrentCards: string[];
}

export interface formantUserThrowCardShowIf {
  seatIndex: number;
  card: string;
  turnTimeout: boolean;
}

export interface formatRejoinTableInfoIf {
  isRejoin: boolean;
  entryFee: number;
  userTurnTimer: number;
  currentUserTurnTimer: number;
  gameStartTimer: number;
  currentGameStartTimer: number;
  cardPassTimer: number;
  currentCardPassTimer: number;
  tableId: string;
  totalPlayers: number;
  minimumPlayers: number;
  currentRound: number;
  currentTurn: string;
  winnningAmonut: string;
  handCount: number;
  tableState: string;
  turnCurrentCards: string[];
  turnCardSequence: string;
  isBreakingHearts: boolean;
  cardMoveSide: string;
  seats: Array<seatsInterface>;
  userId: string;
  seatIndex: number;
  isFTUE: boolean;
  playersDetails: Array<playerGamePlayIf>;
  massage: string;
}

export interface formatWinnerDeclareIf {
  timer?: number;
  roundScoreHistory: mainRoundScoreIf;
  roundTableId: string;
  winningAmount?: winningAmountIf;
  winner: Array<number | null>;
  nextRound: number;
}

export interface formatShowScoreBoardIf {
  timer?: number;
  scoreHistory: showScoreIf;
  roundTableId: string;
  winningAmount?: winningAmountIf;
  winner: Array<number | null>;
  currentRound: number;
}
