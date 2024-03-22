import { turnHistoryCache } from "../../cache";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { roundDetailsInterface } from "../../interface/turnHistoryIf";

export async function addTurnHistory(tableId: string, roundTablePlay: roundTablePlayIf) {
  try {
    const currentTime = new Date();
    const defaultRoundHistory: roundDetailsInterface = {
      roundNo: roundTablePlay.currentRound,
      roundId: roundTablePlay._id,
      winnerId: [],
      winnerSI : [],
      createdOn: currentTime.toString(),
      modifiedOn: currentTime.toString(),
      extra_info: '',
      userDetails: {},
      turnsDetails: [],
    };

    const turnHistory = await turnHistoryCache.insertTurnHistory(
      defaultRoundHistory,
      tableId,
      roundTablePlay.currentRound,
    );
    return turnHistory;
  } catch (e) {}
}
