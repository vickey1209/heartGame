export interface signUpRequestIf {
  accessToken: string;
  userId: string;
  profilePic: string;
  userName: string;
  minPlayer: number;
  noOfPlayer: number;
  entryFee: number;
  winningAmount: string;
  lobbyId: string;
  gameId: string;
  isUseBot: boolean;
  isFTUE: boolean;
}
export interface signUpHelperRequestIf {
  data: signUpRequestIf;
}

export interface cardPassRequestIf {
  userId: string;
  tableId: string;
  cards: string[];
}
export interface cardPassHelperRequestIf {
  data: cardPassRequestIf;
}

export interface leaveTableRequestIf {
  userId: string;
  tableId: string;
  isLeaveFromScoreBoard: boolean;
}
export interface leaveTableHelperRequestIf {
  data: leaveTableRequestIf;
}

export interface cardThrowRequestIf {
  card: string;
}
export interface cardThrowHelperRequestIf {
  data: cardThrowRequestIf;
}
export interface preCardPassSelectRequestIf {
  userId: string;
  tableId: string;
  card: string;
  forwardCardMove: boolean;
}
export interface preCardPassSelectHelperRequestIf {
  data: preCardPassSelectRequestIf;
}
