import logger from '../../logger';
import rejoinPlayingTable from './index';
import { EVENTS, MESSAGES, NUMERICAL } from '../../../constants';
import CommonEventEmitter from "../../commonEventEmitter";
import { userIf } from '../../interface/user';
import { playerGamePlayCache, rejoinDataCache, tableGamePlayCache, userProfileCache } from '../../cache';
import { tableGamePlayIf } from '../../interface/tableGamePlay';
import { playerGamePlayIf } from '../../interface/playerGamePlay';

// check Player Avalible in Playing for Re-join
const rejoinTable = async (
  userData: userIf,
  roomFlag: boolean,
  socket: any,
  ack?: Function,
) => {
  const { gameId, lobbyId, userId, isFTUE } = userData;

  try {
    logger.debug("rejoinTable :: call...");
    logger.info(' rejoinTable : call else rejoinTable fromBack is false');

    const rejoinPlayerData = await rejoinDataCache.getRejoinTableHistory(
      userId,
      gameId,
      lobbyId,
    );
    logger.info(' rejoinTable : rejoinPlayerData ::', rejoinPlayerData);
    if (!rejoinPlayerData) {
      return true;
    } else {
      const { tableId, isEndGame } = rejoinPlayerData;
      if (!isEndGame) {
        const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
        if (!tableGamePlay) {
          await rejoinDataCache.removeRejoinTableHistory(userId, gameId, lobbyId);
          return true;
        } else {
          const playerGamePlay: playerGamePlayIf = await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf;;
          logger.info(' rejoinTable : playerGamePlay ::', playerGamePlay);

          if (!playerGamePlay) {
            await rejoinDataCache.removeRejoinTableHistory(userId, gameId, lobbyId);
            return true;
          } else {
            if (playerGamePlay.isLeft) {
              await rejoinDataCache.removeRejoinTableHistory(userId, gameId, lobbyId);
              return true;
            } else {
              logger.info(' rejoinTable ::: rejoinTableOnKillApp ::: rejoin success fulliy ::: -->>:');
              rejoinPlayingTable(
                userId,
                tableId,
                roomFlag,
                socket,
                true,
                ack,
              );
              return false;
            }
          }
        }
      } else {
        logger.info(userId, " rejoinPlayingTablePopUp : send End Game Message.", rejoinPlayerData);
        await rejoinDataCache.removeRejoinTableHistory(userId, gameId, lobbyId);

        const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
        logger.info(userId, " rejoinPlayingTablePopUp : send End Game Message. :: tableGamePlay ===>>", tableGamePlay);
        if (!tableGamePlay) {
          const userProfile = await userProfileCache.getUserProfile(userId) as userIf;
          logger.info(userId, " rejoinPlayingTablePopUp :: userProfile.tableId ==>>", userProfile.tableId);
          if (userProfile.tableId === tableId) {
            const sendEventData = {
              statusFlag: true,
              message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
              reason: MESSAGES.ERROR.REJOIN_END_GAME_REASON,
              type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
              title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
              buttonCount: NUMERICAL.ONE,
              button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
              button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
              button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
              showLoader: false,
            };
            throw sendEventData;
          } else {
            return true;
          }
        } else {
          const sendEventData = {
            statusFlag: true,
            message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
            reason: MESSAGES.ERROR.REJOIN_END_GAME_REASON,
            type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
            title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
            buttonCount: NUMERICAL.ONE,
            button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
            button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
            button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
            showLoader: false,
          };
          throw sendEventData;
        }

      }
    }
  } catch (error: any) {
    logger.error(userId,
      `CATCH_ERROR : rejoinTableOnKillApp ::: userId: ${userId} :: gameId: ${gameId} :: lobbyId: ${lobbyId} :: `,
      error,
    );

    if (error && error.type === MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE) {
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: error.title,
          message: error.reason,
          buttonCounts: error.buttonCount,
          button_text: error.button_text,
          button_color: error.button_color,
          button_methods: error.button_methods,
          showLoader: error.showLoader,
        },
      });
    }
    return false;

  }
};

export = rejoinTable;
