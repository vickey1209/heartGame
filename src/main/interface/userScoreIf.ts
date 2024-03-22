export interface userDetailInScoreIf {
  username: string;
  profilePicture: string;
  seatIndex: number;
  userStatus: string;
}

export interface userScoreRoundIf {
  roundPoint: number;
  heartPoint: number;
  spadePoint: number;
  seatIndex: number;
}
export interface userScoreTotalIf {
  totalPoint: number;
  seatIndex: number;
}

export interface roundScoreWinnerIf {
  title: string;
  score: userScoreRoundIf[];
}

export interface winnLossAmountIf {
  seatIndex: number;
  userId: string;
  winningAmount: string;
}

export interface winningAmountIf {
  winnLossAmount: winnLossAmountIf[];
}

export interface mainRoundScoreIf {
  total: userScoreTotalIf[];
  scores: roundScoreWinnerIf[];
  roundwinner: scoreRoundWinnerIf[];
  users: userDetailInScoreIf[];
}

export interface showScoreIf {
  total: userScoreTotalIf[];
  users: userDetailInScoreIf[];
}

export interface userScoreIf {
  username: string;
  profilePic: string;
  seatIndex: number;
  userId: string;
  hands: number;
  isLeft: boolean;
  isAuto: boolean;
  spadePoint: number;
  heartPoint: number;
  penaltyPoint: number;
  totalPoint: number;
}
export interface roundScoreIf {
  title: string;
  winner: Array<number | null>;
  roundScore: userScoreIf[];
  roundWinner: roundWinnerIf[]
}
export interface allRoundScoreIf {
  history: roundScoreIf[];
}
export interface roundWinnerIf {
  userId: string;
  seatIndex: number;
  profilePic: string;
}
export interface scoreRoundWinnerIf {
  title: string;
  roundWinners: roundWinnerIf[]
}
export interface showUserScoreIf {
  tableId: string;
}
export interface showUserScoreHelperIf {
  data: showUserScoreIf;
}

export interface shootingMoonIf {
  seatIndex : number;
  userId :string;
  roundPoint : number;
  heartPoint : number;
  spadePoint : number;
  isShootingMoon : boolean;
}
