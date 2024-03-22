import userProfileCache from './userProfile';
import tableGamePlayCache from './tableGamePlay';
import roundTablePlayCache from './roundTablePlay';
import playerGamePlayCache from './playerGamePlay';
import rejoinDataCache from "./rejoinData";
import onlinePlayerCache from "./onlinePlayer";
import turnHistoryCache from "./turnHistory";
import roundScoreHistoryCache from "./roundScoreHistory";


const exportedObject = {
  userProfileCache,
  tableGamePlayCache,
  roundTablePlayCache,
  playerGamePlayCache,
  rejoinDataCache,
  onlinePlayerCache,
  turnHistoryCache,
  roundScoreHistoryCache
};

export = exportedObject;