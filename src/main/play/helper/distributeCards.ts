import logger from '../../logger';
import { SINGLE_DECK, NUMERICAL } from '../../../constants';
import Validator from '../../Validator';
import { playerGamePlayIf } from '../../interface/playerGamePlay';

function shuffleCards(cards: string[]) {
  const shuffle: string[] = [];
  while (cards.length > NUMERICAL.ZERO) {
    const randomNumber: number = Math.floor(Math.random() * cards.length);
    shuffle.push(cards[randomNumber]);
    cards.splice(randomNumber, NUMERICAL.ONE);
  }
  return shuffle;
}

// formant Card Suit Wise and Rung Wise
export async function setCardSuitWise(card: string[]) {
  logger.info(
    'setCardSuitWise : card type :: ',
    typeof card[NUMERICAL.ZERO].split('-')[NUMERICAL.ONE],
    ' : card setCardSuitWise :: ',
    card,
  );

  card.sort((f: any, e: any) => {
    const a = f.split('-')[NUMERICAL.ONE] === '1' ? '14' : f.split('-')[NUMERICAL.ONE];
    const b = e.split('-')[NUMERICAL.ONE] === '1' ? '14' : e.split('-')[NUMERICAL.ONE];
    return a - b;
  });
  logger.info('setCardSuitWise : card setCardSuitWise : 1 ::', card);

  const hearts: string[] = [];
  const clubs: string[] = [];
  const diamond: string[] = [];
  const spades: string[] = [];
  card.forEach((userCard: string, index: any) => {
    const rang = userCard.split('-')[NUMERICAL.ZERO];
    if (rang === 'H') {
      hearts.push(userCard);
    } else if (rang === 'C') {
      clubs.push(userCard);
    } else if (rang === 'D') {
      diamond.push(userCard);
    } else if (rang === 'S') {
      spades.push(userCard);
    }
  });
  // const uCard = [...hearts, ...clubs, ...diamond, ...spades];
  const uCard = [...clubs, ...diamond, ...spades, ...hearts];

  logger.debug('setCardSuitWise : cardLog :: ', uCard);

  return uCard;
}

// Distribute Cards for all player
export async function distributeCards(
  playerGamePlayData: playerGamePlayIf[],
) {
  try {
    playerGamePlayData = await Validator.methodValidator.distributeCardsValidator(
      playerGamePlayData,
    );

    /** club,diamond,heart,spade */

    let tempUsersCards: Array<string[]> = [];

    const cards = [...SINGLE_DECK];
    logger.info('distributeCards : user Card :: ', JSON.stringify(cards));
    // giving 13 cards to each player

    for (let i = NUMERICAL.ZERO; i < playerGamePlayData.length; ++i) {
      const userCards: string[] = [];
      for (let j = NUMERICAL.ZERO; j < NUMERICAL.THIRTEEN; j++) {
        const ran = Math.floor(Math.random() * cards.length - NUMERICAL.ONE) + NUMERICAL.ONE;
        userCards.push(cards[ran]);
        cards.splice(ran, NUMERICAL.ONE);
      }
      tempUsersCards[i] = userCards;
    }

    logger.info(
      'distributeCards : tempUsersCards :: ',
      JSON.stringify(tempUsersCards),
    );

    //static cards
    // const usersCards: Array<Array<string>> = [
    //   ['H-1', 'S-2', 'S-3', 'H-3', 'H-6', 'H-7', 'H-8', 'H-9', 'H-10', 'H-11', 'H-12', 'H-13', 'C-1'],
    //   ['D-1', 'D-2', 'D-3', 'D-4', 'D-5', 'D-6', 'D-7', 'D-8', 'D-9', 'D-10', 'D-11', 'D-12', 'D-13'],
    //   ['H-2', 'C-2', 'C-3', 'C-4', 'C-5', 'C-6', 'C-7', 'C-8', 'C-9', 'C-10', 'C-11', 'C-12', 'C-13'],
    //   ['H-4', 'H-5', 'S-1', 'S-4', 'S-5', 'S-6', 'S-7', 'S-8', 'S-9', 'S-10', 'S-11', 'S-12', 'S-13'],
    // ];

    const usersCards: Array<Array<string>> = [];
    for await (const userCard of tempUsersCards) {
      const cards: string[] = await setCardSuitWise(userCard);
      usersCards.push(cards);
    }

    logger.info(
      'distributeCards : usersCards with setCardSuitWise :: ',
      JSON.stringify(usersCards),
      {
        usersCards,
      },
      ' :::: card distribution fun response ',
    );

    return usersCards;
  } catch (error) {
    logger.error(`CATCH_ERROR : distributeCards ::  `, playerGamePlayData, error);
    throw error;
  }
}

