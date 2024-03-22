import { playerGamePlayIf } from "./playerGamePlay";
import { tableGamePlayIf } from "./tableGamePlay";

export interface defaultRoundTablePlayIf {
  tableId: string;
  noOfPlayer: number;
  currantRound: number;
}

export interface roundTablePlayIf {
  _id: string;
  tableId: string;
  tableState: string;
  currentPlayerInTable: number;
  totalPlayers: number;
  currentRound: number;
  totalHands: number;
  seats: seatsInterface[];
  currentTurn: any;
  tableCurrentTimer: any;
  cardPassTurn: boolean;
  turnCurrentCards: string[];
  turnCardSequence: string;
  isBreakingHearts: boolean;
  lastInitiater: string | null;
  hands: Array<any>;
  turnCount: number;
  handCount: number;
  isShootingMoon: boolean;
  isTieRound: boolean;
  currentTieRound: number;
  isWinFlag: boolean;
  currentUserTurnTimer: number;
  currentGameStartTimer: number;
  currentCardPassTimer : number;
  createdAt: Date;
  updatedAt: Date;
}

export interface seatsInterface {
  userId: string;
  si: number;
  name: string;
  pp: string;
  userState: string;
}

export interface setupRoundIf {
  tableId: string;
  noOfPlayer: number;
  roundNo: number;
}

export interface InsertPlayerInTableInterface {
  roundTablePlay: roundTablePlayIf;
  tableGamePlay: tableGamePlayIf
  playerGamePlay: playerGamePlayIf;
}