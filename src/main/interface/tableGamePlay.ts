export interface defaultTableGamePlayIf {
  userId : string;
  gameType: string;
  lobbyId: string;
  gameId: string;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  winningAmount : string;
  minPlayer : number;
  noOfPlayer : number;
  isUseBot : boolean;
}

export interface tableGamePlayIf {
  _id: string;
  tableId: string;
  gameType: string;
  lobbyId: string;
  gameId: string;
  minimumPlayers: number;
  totalPlayers: number;
  currentRound: number;
  entryFee: number;
  winningAmount: string;
  winningScores : number;
  gameStartTimer: number;
  userTurnTimer: number;
  cardPassTimer:number;
  isTieGame: boolean;
  winner: any[];
  isUseBot: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RejoinTableHistoryIf {
  userId: string;
  tableId: string;
  isEndGame: boolean;
}

export interface RejoinTableHistoryIf {
  userId: string;
  tableId: string;
  isEndGame: boolean;
}
