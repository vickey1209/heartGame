import { NUMERICAL } from '../../../constants';
import { turnHistoryCache } from '../../cache';
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import { roundDetailsInterface, turnDetailsInterface } from '../../interface/turnHistoryIf';

async function updateTurnHistory(
  tableId: string,
  roundNumber: number,
  playerGamePlay: playerGamePlayIf,
  turnStatus: string,
  card: string,
  userCards: Array<string>,
) {
  const turnHistory = await turnHistoryCache.getTurnHistory(tableId, roundNumber) as roundDetailsInterface;

  const defaultTurnHistoryObj: turnDetailsInterface = {
    turnNo: turnHistory.turnsDetails.length + NUMERICAL.ONE,
    userId: playerGamePlay.userId,
    turnStatus: turnStatus,
    startState: playerGamePlay.currentCards.join(','),
    cardPicked: '',
    cardPickSource: '',
    cardDiscarded: card,
    endState: userCards.join(','),
    createdOn: new Date().toString(),
  };

  turnHistory.modifiedOn = new Date().toString();
  turnHistory.turnsDetails.push(defaultTurnHistoryObj);

  const history = await turnHistoryCache.insertTurnHistory(turnHistory, tableId, roundNumber);
  return history;
}

export = updateTurnHistory;
