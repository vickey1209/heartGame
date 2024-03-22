import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import { EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from '../../../constants';
import { showUserScoreIf, userScoreIf } from '../../interface/userScoreIf';
import socketAck from '../../../socketAck';
import cancelBattle from '../cancelBattle';
import Errors from '../../errors';
import Validator from '../../Validator';
import { playerGamePlayCache, roundScoreHistoryCache, roundTablePlayCache, tableGamePlayCache } from '../../cache';
import { tableGamePlayIf } from '../../interface/tableGamePlay';
import { roundTablePlayIf } from '../../interface/roundTablePlay';
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import { formatShowScoreBoardIf } from '../../interface/responseIf';
import { formatShowScoreData } from '../helper/formatePlayHelper';

//User Show Score Board in running Game
const showScoreBoard = async (
  data: showUserScoreIf,
  socket: any,
  ack?: Function,
) => {
  const { tableId } = data;
  try {
    logger.info(" showScoreBoard :: tableId :: --->> ", tableId);
    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const { currentRound } = tableGamePlay;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;
    logger.info(" showScoreBoard :: roundTablePlay :: ===>> ", roundTablePlay);

    const playerGamePlayData: playerGamePlayIf[] = [];
    for await (const seat of roundTablePlay.seats) {
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      playerGamePlayData.push(playerGamePlay);
    }

    const userScore: userScoreIf[] = [];
    // set Default Data Of Currant Round Score

    playerGamePlayData.forEach(async (player) => {
      const score: userScoreIf = <userScoreIf>{};
      score.username = player.username;
      score.profilePic = player.profilePic;
      score.userId = player.userId;
      score.seatIndex = player.seatIndex;
      score.hands = player.hands;
      score.isLeft = player.isLeft;
      score.isAuto = player.isAuto;
      score.penaltyPoint = player.penaltyPoint;
      score.spadePoint = player.spadePoint;
      score.heartPoint = player.heartPoint;
      score.totalPoint = player.totalPoint + score.penaltyPoint;
      player.totalPoint = score.totalPoint;
      logger.info(`username :: ${player.username} :: penaltyPoint :: ${player.penaltyPoint}`);
      userScore.push(score);

    });

    logger.info("showScoreBoard :: userScore :: ", userScore)
    //get Old Table Score History
    let scoureHistory = await roundScoreHistoryCache.getRoundScoreHistory(tableId);
    logger.info(' showScoreBoard :: scoreHistory :: ---->> ', scoureHistory);
    if (scoureHistory != null) scoureHistory = scoureHistory.history;
    logger.info(' showScoreBoard :: scoreHistory ::->>', scoureHistory);
    if (scoureHistory === null) {

      //send show scoreBoard event in socket
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.SCOREBOARD_POPUP,
          message: MESSAGES.ERROR.SCORE_BOARD_NOT_FOUND,
        },
      });

    } else {

      const roundScore = await formatShowScoreData(userScore, scoureHistory);

      let sendEventData: formatShowScoreBoardIf = {
        winner: [],
        scoreHistory: roundScore,
        roundTableId: tableId,
        currentRound: roundTablePlay.currentRound
      };

      sendEventData =
        await Validator.responseValidator.formatShowScoreBoardValidator(
          sendEventData,
        );
      //send show scoreBoard event in socket
      CommonEventEmitter.emit(EVENTS.SHOW_SCORE_BOARD, {
        socket,
        data: sendEventData,
      });

    }

    return true;
  } catch (error: any) {
    logger.error(tableId,
      `CATCH_ERROR : showScoreBoard :userId: ${socket.userId} :: tableId: ${tableId} Error :: `,
      error,
    );

    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    }
    if (ack) {
      socketAck.ackMid(
        EVENTS.SHOW_SCORE_BOARD,
        {
          success: false,
          error: {
            errorCode: NUMERICAL.FIVE_HUNDRED,
            errorMessage: error && error.message ? error.message : error,
          },
          tableId,
        },
        socket.userId,
        tableId,
        ack,
      );
    }
  }
};
export = showScoreBoard;
