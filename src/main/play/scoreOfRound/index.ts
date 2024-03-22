const _ = require('underscore');
import logger from '../../logger';
import Errors from '../../errors';
import { redisConnection } from '../../../connections/redis';
import { getConfig } from "../../../config";
import { EVENTS, NUMERICAL, TABLE_STATE } from '../../../constants';
import { tableGamePlayIf } from '../../interface/tableGamePlay';
import { playerGamePlayCache, roundScoreHistoryCache, roundTablePlayCache, tableGamePlayCache, turnHistoryCache } from '../../cache';
import { roundTablePlayIf } from '../../interface/roundTablePlay';
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import { roundWinnerIf, userScoreIf } from '../../interface/userScoreIf';
import Validator from "../../Validator";
import { removeAllPlayingTableAndHistory } from '../leaveTable/helpers';
import updateWinnerId from '../history/updateWinnerId';
import showScoreBoardWinningAmount from './showScoreBordWinningAmount';
import commonEventEmitter from '../../commonEventEmitter';
import { roundDetailsInterface } from '../../interface/turnHistoryIf';
import { formatScoreData } from '../helper/formatePlayHelper';
import { formatWinnerDeclareIf } from '../../interface/responseIf';
import initialNewRoundStartTimerQueue from '../../../scheduler/queues/initialNewRoundStartTimer.queue';
import { cancelAllScheduler } from '../../../scheduler/cancelJob/allScheduler.cancel';

// Declare a Score Of Current Round after Complete round
const scoreOfRound = async (tableId: string) => {
  const { PENLETY_POINT } = getConfig();
  const { getRedLock } = redisConnection;
  const key = `${NUMERICAL.TEN}: ${tableId}`;
  const scoreOfRoundLock = await getRedLock.acquire([key], 2000);
  try {
    const penletyPoint: number = PENLETY_POINT;
    logger.info("penletyPoint :: ---->> ", penletyPoint);

    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const { currentRound, gameStartTimer, winningScores } = tableGamePlay;

    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;

    // Get last Round Score History
    let roundScoreHistory = await roundScoreHistoryCache.getRoundScoreHistory(tableId);
    roundScoreHistory = roundScoreHistory || { history: [] };

    const playerGamePlayData: playerGamePlayIf[] = [];
    for await (const seat of roundTablePlay.seats) {
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
      playerGamePlayData.push(playerGamePlay);
    }

    const userScore: userScoreIf[] = [];
    let isUserLeft: boolean = false;
    let isUserLeftCount: number = NUMERICAL.ZERO;
    let totalPlayers: number = Number(tableGamePlay.totalPlayers);

    // Calculation Of Point, Hand
    playerGamePlayData.forEach(async (player) => {
      if (player.isLeft) {
        isUserLeftCount += NUMERICAL.ONE;
      }
      if (totalPlayers == NUMERICAL.FOUR && isUserLeftCount >= NUMERICAL.THREE) {
        isUserLeft = true;
      }
    });

    playerGamePlayData.forEach(async (player) => {
      const score: userScoreIf = <userScoreIf>{};
      const hands = player.hands;
      score.username = player.username;
      score.profilePic = player.profilePic;
      score.userId = player.userId;
      score.seatIndex = player.seatIndex;
      score.hands = hands;
      score.isLeft = player.isLeft;
      score.isAuto = player.isAuto;
      score.penaltyPoint = player.penaltyPoint;
      score.spadePoint = player.spadePoint;
      score.heartPoint = player.heartPoint;
      score.totalPoint = player.totalPoint + score.penaltyPoint;
      player.totalPoint = score.totalPoint;

      logger.info(`username :: ${player.username} :: hands : ${hands}`);
      logger.info(" isUserLeft ::--->", isUserLeft, "player.point ::--->", player.penaltyPoint);
      userScore.push(score);

      await playerGamePlayCache.insertPlayerGamePlay(player, tableId);
    });

    const deepUserScore: userScoreIf[] = JSON.parse(JSON.stringify(userScore));
    const allUserScore = deepUserScore.sort((a, b) => a.penaltyPoint - b.penaltyPoint);
    const winnerPoint = allUserScore[NUMERICAL.ZERO].penaltyPoint;
    logger.info(' scoreOfRound :: winnerPoint :: ------->> ', winnerPoint);

    const roundWinnerData: roundWinnerIf[] = [];
    allUserScore.forEach(async (userScore: userScoreIf) => {
      if (winnerPoint == userScore.penaltyPoint) {
        roundWinnerData.push({
          userId: userScore.userId,
          seatIndex: userScore.seatIndex,
          profilePic: userScore.profilePic
        })
      }
    })

    logger.info(' scoreOfRound :: roundWinnerData :: ------->> ', roundWinnerData);
    logger.info(' scoreOfRound :: userScore :: --->> ', userScore);
    logger.info(' isUserLeft :==>> ', isUserLeft, ' currentRound : ==>> ', currentRound);

    // start new Round
    let winner: number[] = [];
    winner = await checkWinner(userScore, winningScores, isUserLeft, tableId);
    logger.info(' scoreOfRound : winner :: ------------------------------------->> ', winner);

    await updateWinnerId(tableId, currentRound, playerGamePlayData, winner);

    let title: string = `${TABLE_STATE.ROUND_TITLE}-${currentRound}`;
    logger.info("title  :: --->>", title);
    const eventData = {
      title,
      roundScore: userScore,
      roundWinner: roundWinnerData
    };
    logger.info(" eventData :: ", eventData);
    logger.info(" roundScoreHistory.history :::::::", roundScoreHistory.history, "roundPlayingTable.currentRound :: ", roundTablePlay.currentRound, "roundScoreHistory.history.length :: ", roundScoreHistory.history.length);
    logger.info(" isUserLeft :: ", isUserLeft, " roundTablePlay.tableState :: =>", roundTablePlay.tableState);

    if (roundScoreHistory.history.length != NUMERICAL.ZERO) {

      let lastHistoryIndex: number = roundScoreHistory.history.length - NUMERICAL.ONE;
      let findLastRoundNumber = Number(roundScoreHistory.history[lastHistoryIndex].title.split('-')[1]);
      logger.info(tableId, "lastHistoryIndex ::-->>", lastHistoryIndex, " findLastRoundNumber  ::-->> ", findLastRoundNumber);
      if (findLastRoundNumber != roundTablePlay.currentRound && isUserLeft === false) {
        logger.info(tableId, " <<< <<< <<< in condtion >>> >>> >>> :: ");
        roundScoreHistory.history.push(eventData);
      }
      else if (findLastRoundNumber != roundTablePlay.currentRound && roundTablePlay.tableState != TABLE_STATE.SCOREBOARD_DECLARED) {
        logger.info(tableId, "  << <<< << else :: >> >>> >>  :: ");
        roundScoreHistory.history.push(eventData);
      }
    }
    else {
      roundScoreHistory.history.push(eventData);
    }
    await roundScoreHistoryCache.insertRoundScoreHistory(roundScoreHistory, tableId);

    roundTablePlay.tableCurrentTimer = new Date();
    roundTablePlay.updatedAt = new Date();
    roundTablePlay.tableState = TABLE_STATE.SCOREBOARD_DECLARED;

    const roundScore = await formatScoreData(
      userScore,
      roundScoreHistory.history,
    );
    logger.info('roundScore :------->> ', roundScore);
    logger.info('winner :>> ', winner);

    let nextRound: number = currentRound;
    if (winner.length === NUMERICAL.ZERO) {
      nextRound += NUMERICAL.ONE;
      roundTablePlay.currentRound = nextRound;
    }
    logger.info(" roundTablePlay :: >>> ", roundTablePlay);
    await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound);
    tableGamePlay.winner = winner;
    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    let winningAmount: any = [];
    let startTimer: number = gameStartTimer;

    winningAmount = await showScoreBoardWinningAmount(userScore, winner, tableId);
    startTimer = gameStartTimer;

    let sendEventData: formatWinnerDeclareIf = {
      timer: Number(startTimer),
      winner,
      roundScoreHistory: roundScore,
      winningAmount: winningAmount,
      roundTableId: tableId,
      nextRound
    };

    logger.info(` scoreOfRound :: score boarde data --------->>>: ${JSON.stringify(sendEventData)}`);
    sendEventData = await Validator.responseValidator.formatWinnerDeclareValidator(sendEventData);

    // Send WINNER_DECLARE Event in Socket
    commonEventEmitter.emit(EVENTS.WINNER_DECLARE_SOCKET_EVENT, {
      tableId: tableId,
      data: sendEventData,
    });

    const turnHistory = await turnHistoryCache.getTurnHistory(tableId, currentRound) as roundDetailsInterface;

    logger.info(
      `scoreOfRound :: turnHistory ::: 
      ${JSON.stringify(turnHistory)}
       :: playerGamePlayData ::: 
      ${JSON.stringify(playerGamePlayData)}`,
    );


    if (winner.length === NUMERICAL.ZERO) {
      // Set Timer For New Round Start
      await initialNewRoundStartTimerQueue({
        timer: (gameStartTimer + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId: tableId,
      });

    } else {

      // The Winner is Declare then Remove All Redis Data Related to this Game
      logger.info(tableId, 'scoreOfRound : Playing End........');
      await cancelAllScheduler(tableId);
      await removeAllPlayingTableAndHistory(tableGamePlay, roundTablePlay, currentRound);
      logger.info(tableId, 'scoreOfRound : Playing End........');
    }
  } catch (e) {
    logger.error(tableId, `CATCH_ERROR : scoreOfRound : tableId: ${tableId} ::`, e);

    if (e instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(e);
    }
  } finally {
    logger.info(tableId, 'scoreOfRound : Lock : ', key);
    if (scoreOfRoundLock) {
      await getRedLock.release(scoreOfRoundLock);
    }
  }
};

// Calculation of check Winner Of Round
const checkWinner = async (
  scoreData: userScoreIf[],
  winningScores: number,
  isUserLeft: boolean,
  tableId: string,
) => {
  try {

    const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    const currentRound: number = tableGamePlay.currentRound;
    const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;

    scoreData = await Validator.methodValidator.checkWinnerValidator(scoreData);
    logger.info(
      'checkWinner :: call scoreData :: ',
      scoreData,
      ' :: winningScores :: ',
      winningScores,
    );

    const winIndex: number[] = [];
    //all user left handle
    if (isUserLeft) {

      const playerGamePlayData: playerGamePlayIf[] = [];
      for await (const seat of roundTablePlay.seats) {
        const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
        playerGamePlayData.push(playerGamePlay);
        if (playerGamePlay.isLeft == false) {
          winIndex.push(playerGamePlay.seatIndex);
        }
      }

      logger.info("winIndex.length :: ---->>> ", winIndex.length)
      if (winIndex.length == NUMERICAL.ONE) {
        return winIndex;
      }
      if (winIndex.length == NUMERICAL.ZERO) {
        await removeAllPlayingTableAndHistory(tableGamePlay, roundTablePlay, currentRound);
      }
      return winIndex;
    }

    // totalPoint;
    const allUserTotalScore: number[] = [];
    scoreData.forEach((element) => {
      if (!element.isLeft) allUserTotalScore.push(element.totalPoint);
    });
    allUserTotalScore.sort((a, b) => a - b);
    logger.info(' allUserTotalScore :: >> ', allUserTotalScore);

    const winnerPoint = allUserTotalScore[NUMERICAL.ZERO];
    logger.info(' winnerPoint :: >> ', winnerPoint);
    logger.info(' winningScores :: >> ', winningScores);
    logger.info(' allUserTotalScore[allUserTotalScore.length - NUMERICAL.ONE] :: >> ', allUserTotalScore[allUserTotalScore.length - NUMERICAL.ONE]);

    if (allUserTotalScore[allUserTotalScore.length - NUMERICAL.ONE] > winningScores) {
      scoreData.forEach((element) => {
        if (!element.isLeft && winnerPoint === element.totalPoint)
          winIndex.push(element.seatIndex);
      });
    }
    logger.info(' checkWinner :: win :: ---------------->>', winIndex);
    return winIndex;
  } catch (error) {
    logger.error(`CATCH_ERROR :: checkWinner :: ===>>`, scoreData, error);
    throw error;
  }
};

export = scoreOfRound;
