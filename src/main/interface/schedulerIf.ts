import { playerGamePlayIf } from "./playerGamePlay";
import { roundTablePlayIf } from "./roundTablePlay";
import { tableGamePlayIf } from "./tableGamePlay";


export interface initializeGameplayIf {
  timer: number;
  queueKey: string;
  tableId: string;
  tableGamePlay: tableGamePlayIf;
  roundTablePlay: roundTablePlayIf
}

export interface roundStartTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
  tableGamePlay: tableGamePlayIf;
  roundTablePlay: roundTablePlayIf
}

export interface initialCardPassTurnSetupTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
  tableGamePlay: tableGamePlayIf;
  playersData: playerGamePlayIf[];
}

export interface playersCardPassTurnTimerIf {
  timer: number;
  tableId: string;
  tableGamePlay: tableGamePlayIf;
}

export interface initialUserTurnTimerIf {
  timer: number;
  tableId: string;
  tableGamePlay: tableGamePlayIf;
  nextTurn: string;
}

export interface cardsChangeTimerIf {
  timer: number;
  tableId: string;
}

export interface playerTurnTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
  tableGamePlay: tableGamePlayIf;
  playerGamePlay: playerGamePlayIf;  
  isAutoMode? : boolean;
}  

export interface winOfRoundSetupTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
}

export interface winnerDeclareTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
}

export interface initialNewRoundStartTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
}


//--------------------------------------------
export interface socketDataIf {
  id: string;
  eventMetaData: eventMetaDataIf,
}
export interface eventMetaDataIf {
  userId: string;
  tableId: string;
}
export interface rejoinTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
  userId: string;
  socketId: string;
  flag: string;
  socketData: socketDataIf;
}


