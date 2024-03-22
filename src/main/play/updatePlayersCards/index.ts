import { playerGamePlayCache } from '../../cache';
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import { seatsInterface } from '../../interface/roundTablePlay';

// All User Card Add In Player Data
async function updateCardsByRoundId(
  seats: seatsInterface[],
  usersCards: string[][],
  tableId: string,
) {

  const playersGamePromise: playerGamePlayIf[] = [];
  for await (const seat of seats) {
    const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
    playersGamePromise.push(playerGamePlay);
  }

  const playersGameData = await Promise.all(playersGamePromise);
  const cachePromiseList = playersGameData.map((playerGameData, i) => {
    const updatedObj = {
      ...playerGameData,
      currentCards: usersCards[i],
    };
    playerGamePlayCache.insertPlayerGamePlay(updatedObj, tableId);
    return updatedObj;
  });

  return Promise.all(cachePromiseList);
}

const exportObject = {
  updateCardsByRoundId,
};
export = exportObject;
