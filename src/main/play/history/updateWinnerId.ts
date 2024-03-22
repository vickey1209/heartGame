import logger  from '../../logger';
import { NUMERICAL } from '../../../constants';
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import { turnHistoryCache } from '../../cache';
import { roundDetailsInterface } from '../../interface/turnHistoryIf';

async function updateWinnerId(
  tableId: string,
  roundNumber: number,
  playerGamePlay: playerGamePlayIf[],
  winner: number[],
) {
  const turnHistory = await turnHistoryCache.getTurnHistory(tableId, roundNumber) as roundDetailsInterface;

  const [winnerData] = playerGamePlay
    .map((uData) => {
      logger.info(tableId, '===> uData L seatIndex<====', uData.seatIndex);
      logger.info(tableId, '===> uData L winner.indexOf(uData.seatIndex) <====', winner.indexOf(uData.seatIndex));
      if (winner.indexOf(uData.seatIndex) !== -NUMERICAL.ONE) {
        return {winnerId : [uData.userId], winnerSI : [uData.seatIndex]};
      }
      return {winnerId : [], winnerSI : []};
    })
    .filter((e) => e);

   logger.info(" winnerData ::>> ", winnerData);
    
  turnHistory.modifiedOn = new Date().toString();
  turnHistory.winnerId = winnerData.winnerId;
  turnHistory.winnerSI = winnerData.winnerSI;

  const history = await turnHistoryCache.insertTurnHistory(turnHistory, tableId, roundNumber);
  return history;
}

export = updateWinnerId;
