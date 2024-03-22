export interface userSignUpIf {
  _id: string;
  isFTUE: boolean;
  username: string;
  lobbyId: string;
  gameId: string;
  startTime: number;
  balance: number;
  userId: string;
  profilePic: string;
  minPlayer: number;
  noOfPlayer: number;
  winningAmount: string;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  authToken: string;
  isUseBot: boolean;
  isBot: boolean;
}

export interface userIf {
  _id: string;
  isFTUE: boolean;
  username: string;
  lobbyId: string;
  gameId: string;
  startTime: number;
  balance: number;
  userId: string;
  tableId : string;
  profilePic: string;
  minPlayer: number;
  noOfPlayer: number;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  winningAmount: string;
  authToken: string;
  isUseBot: boolean;
  isBot: boolean;
  socketId: string;
}

export interface successRes {
  success: boolean;
  error: any;
  tableId?: string;
}

export interface blockUserCheckI {
  tableId : string
  isNewTableCreated : boolean
}
