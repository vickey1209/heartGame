export interface defaultPlayerGamePlayIf {
  _id: string;
  username: string;
  fromBack: boolean;
  lobbyId: string;
  gameId: string;
  startTime: number;
  userId: string;
  profilePicture: string;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  authToken: string;
  socketId: string;
  roundTableId: string;
  seatIndex: number;
  isBot: boolean;
}

export interface playerGamePlayIf {
  _id: string;
  userId: string;
  username: string;
  profilePic: string;
  roundTableId: string;
  seatIndex: number;
  userStatus: string;
  isFirstTurn: boolean;
  socketId: string;
  currentCards: Array<string>;
  turnTimeout: number;
  cardPassDetails: cardPassDetailsIf;
  hands: number;
  penaltyPoint: number;
  spadePoint: number;
  heartPoint: number;
  totalPoint: number;
  isLeft: boolean;
  isAuto: boolean;
  isTurn: boolean;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface tempPlayerGamePlayIf {
  userId : string;
  username : string;
  profilePic : string;
  socketId : string;
  isBot : boolean;
}

export interface cardPassDetailsIf {
  status: boolean;
  cards: string[];
}