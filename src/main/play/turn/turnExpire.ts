import { CARD_SEQUENCE, EVENTS, HISTORY, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import commonEventEmitter from "../../commonEventEmitter";
import { playerTurnTimerIf } from "../../interface/schedulerIf";
import logger from "../../logger";
import Errors from "../../errors";
import { redisConnection } from "../../../connections/redis";
import { playerGamePlayCache, roundTablePlayCache } from "../../cache";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { getConfig } from '../../../config';
import playerTurnTimerCancel from "../../../scheduler/cancelJob/playerTurnTimerCancel.cancel";
import { getCardNumber } from "../common";
import updateTurnHistory from "../history/updateTurnHistory";
import { formatUserThrowCardShow } from "../helper/formatePlayHelper";
import { changeThrowCardTurn } from "./changeThrowCardTurn";
import cancelBattle from "../cancelBattle";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { leaveTable } from "../../play/leaveTable";



// mange Player is not tack a turn (Auto Turn)
export async function cardThrowTurnExpire(
  tableId: string,
  tableGamePlay: tableGamePlayIf,
  playerGamePlay: playerGamePlayIf,
  isAutoMode: boolean = false
) {
  const { userId } = playerGamePlay;
  const { getRedLock } = redisConnection;
  const { TIME_OUT_COUNT } = getConfig();
  let cardThrowTurnExpireLock = await getRedLock.acquire([`${tableId}`], 2000);
  try {
    logger.info(
      `cardThrowTurnExpire : tableId :: ${tableId} :: userId: ${userId}, TIME_OUT_COUNT :: ${TIME_OUT_COUNT}`,
    );
    const { currentRound } = tableGamePlay;
    const [playerGamePlay, roundTablePlay] = await Promise.all([
      await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf,
      await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf,
    ]);

    logger.info("------>> cardThrowTurnExpire :: playerGamePlay :: ", playerGamePlay);
    logger.info("------>> cardThrowTurnExpire :: roundTablePlay :: ", roundTablePlay);

    if (!playerGamePlay || !roundTablePlay) {
      throw new Error('Table data can not find !');
    }

    if (roundTablePlay.tableState === TABLE_STATE.SCOREBOARD_DECLARED)
      throw new Error('This Table Declared Winner.');

    logger.info(
      'cardThrowTurnExpire : playerGamePlay.turnTimeout ::: ',
      playerGamePlay.turnTimeout,
      ' :: cardThrowTurnExpire :: NUMERICAL.TWO ::: ',
      NUMERICAL.TWO,
      ' :: cardThrowTurnExpire :: TIME_OUT_COUNT ::: ',
      TIME_OUT_COUNT,
      ' :: cardThrowTurnExpire :: playerGamePlay.isAuto ::: ',
      playerGamePlay.isAuto,
      ' :: cardThrowTurnExpire :: playerGamePlay.turnTimeout :: NUMERICAL.TWO :: ==>>',
      playerGamePlay.turnTimeout >= NUMERICAL.TWO,
    );

    if (
      playerGamePlay.turnTimeout >= (Number(TIME_OUT_COUNT) - NUMERICAL.ONE) &&
      !playerGamePlay.isAuto
    ) {
      const userScoket = {
        id: playerGamePlay.socketId,
        eventMetaData: { userId: userId, tableId },
      };
      const flag = PLAYER_STATE.TIMEOUT;
      // Player miss number of turn then defind in Auto Turn
      // change in to emit
      if (cardThrowTurnExpireLock) {
        await getRedLock.release(cardThrowTurnExpireLock);
        cardThrowTurnExpireLock = null
      }
      await leaveTable(tableId, flag, userScoket);

    } else {
      logger.info(
        'cardThrowTurnExpire : playerGamePlay :: ',
        playerGamePlay,
        ' : cardThrowTurnExpire : roundTablePlay :: ',
        roundTablePlay,
      );

      await playerTurnTimerCancel(
        `${userId}:${tableId}:${currentRound}`,
      );

      if (roundTablePlay.currentTurn !== userId || !playerGamePlay.isTurn)
        throw new Error('current turn is not your turn !');

      const userCards = [...playerGamePlay.currentCards];
      let cardSequence = roundTablePlay.turnCardSequence;
      logger.info("------>> cardThrowTurnExpire :: userCards :: -->", userCards);
      logger.info("------>> cardThrowTurnExpire :: cardSequence :: -->", cardSequence, " playerGamePlay.isFirstTurn :: ==>>", playerGamePlay.isFirstTurn);
      logger.info("------>> cardThrowTurnExpire :: roundTablePlay.handCount :: -->", roundTablePlay.handCount);

      let indexSequence = -NUMERICAL.ONE;
      if (cardSequence === CARD_SEQUENCE.CARD_NONE) {

        if (playerGamePlay.isFirstTurn && roundTablePlay.handCount === NUMERICAL.ZERO) {
          // throw C-2 card.
          indexSequence = userCards.findIndex(
            (scard: string) => scard === CARD_SEQUENCE.CARD_CLUB_TWO,
          );

        } else {

          const getLowest: string[] = userCards.sort(
            (Acard: string, Bcard: string) => {
              const aCard = getCardNumber(Acard);
              const bCard = getCardNumber(Bcard);
              return aCard - bCard;
            },
          );
          logger.info("------>> cardThrowTurnExpire :: getLowest :: ", getLowest)

          const getLowestWithOutHearts: string[] = getLowest
            .map((fcard: string) => {
              if (fcard.split('-')[NUMERICAL.ZERO] !== CARD_SEQUENCE.CARD_HEARTS)
                return fcard;
              else return '';
            })
            .filter((e: string) => e);

          logger.info("------>> cardThrowTurnExpire :: getLowestWithOutHearts :: ", getLowestWithOutHearts)
          logger.info("------>> cardThrowTurnExpire :: roundTablePlay.isBreakingHearts :: ", roundTablePlay.isBreakingHearts)

          if (getLowestWithOutHearts.length === NUMERICAL.ZERO && roundTablePlay.isBreakingHearts) {
            // throw lowest card
            indexSequence = userCards.findIndex(
              (scard: string) => scard === getLowest[NUMERICAL.ZERO],
            );
          } else {
            // throw heart lowest card
            indexSequence = userCards.findIndex(
              (scard: string) => scard === getLowestWithOutHearts[NUMERICAL.ZERO],
            );
          }

        }

      } else {
        const seaquenceCardCheck: string[] = userCards
          .map((fcard: string) => {
            if (fcard.charAt(NUMERICAL.ZERO) === roundTablePlay.turnCardSequence) {
              return fcard;
            }
            return '';
          })
          .filter((e) => e);
        logger.info("------>> cardThrowTurnExpire :: seaquenceCardCheck :: ", seaquenceCardCheck)

        const getHeartsCard: string[] = userCards
          .map((fcard: string) => {
            if (fcard.split('-')[NUMERICAL.ZERO] === CARD_SEQUENCE.CARD_HEARTS)
              return fcard;
            else return '';
          })
          .filter((e: string) => e);
        logger.info("------>> cardThrowTurnExpire :: getHeartsCard :: ", getHeartsCard);
        logger.info("------>> cardThrowTurnExpire :: roundTablePlay.isBreakingHearts :: ", roundTablePlay.isBreakingHearts);

        let hightCardCheck: string[] = [];
        if (seaquenceCardCheck.length > NUMERICAL.ZERO) {

          // throw hight card as same suit
          hightCardCheck = seaquenceCardCheck.sort(
            (Acard: string, Bcard: string) => {
              const aCard = getCardNumber(Acard);
              const bCard = getCardNumber(Bcard);
              return bCard - aCard;
            },
          );

        } else if (roundTablePlay.handCount === NUMERICAL.ZERO && !roundTablePlay.isBreakingHearts) {
          //first hand and is Breaking Hearts check
          hightCardCheck = userCards
            .map((fcard: string) => {
              if (fcard.split('-')[NUMERICAL.ZERO] !== CARD_SEQUENCE.CARD_HEARTS)
                return fcard;
              else return '';
            })
            .filter((e: string) => e);

        } else if (getHeartsCard.length > NUMERICAL.ZERO) {

          // throw hight heart card
          hightCardCheck = getHeartsCard.sort(
            (Acard: string, Bcard: string) => {
              const aCard = getCardNumber(Acard);
              const bCard = getCardNumber(Bcard);
              return bCard - aCard;
            },
          );

        } else {

          // throw hight heart card
          hightCardCheck = userCards.sort((Acard: string, Bcard: string) => {
            const aCard = getCardNumber(Acard);
            const bCard = getCardNumber(Bcard);
            return bCard - aCard;
          });

        }
        logger.info("------>> cardThrowTurnExpire :: hightCardCheck :: --->>", hightCardCheck)

        indexSequence = userCards.findIndex(
          (scard: string) => scard === hightCardCheck[NUMERICAL.ZERO],
        );
      }
      logger.info('cardThrowTurnExpire :: indexSequence :: ===>>', indexSequence);

      let card = '';
      if (indexSequence !== -NUMERICAL.ONE) {
        card = userCards[indexSequence];
      } else {
        card = userCards[NUMERICAL.ZERO];
      }
      logger.info('cardThrowTurnExpire : card :: ', card);
      const cardIndex = playerGamePlay.currentCards.indexOf(card);
      if (cardIndex === -NUMERICAL.ONE) throw new Error('current card is not your !');

      if (cardSequence === CARD_SEQUENCE.CARD_NONE)
        cardSequence = card.split('-')[NUMERICAL.ZERO];

      playerGamePlay.currentCards.splice(cardIndex, NUMERICAL.ONE);
      /*
        update Turn History
        */
      await updateTurnHistory(
        tableId,
        currentRound,
        playerGamePlay,
        HISTORY.TIME_OUT,
        card,
        playerGamePlay.currentCards,
      );
      playerGamePlay.turnTimeout += NUMERICAL.ONE;

      const turnCards = roundTablePlay.turnCurrentCards;
      turnCards.splice(playerGamePlay.seatIndex, NUMERICAL.ONE, card);
      roundTablePlay.turnCurrentCards = turnCards;
      roundTablePlay.turnCardSequence = cardSequence;
      roundTablePlay.tableCurrentTimer = new Date();
      roundTablePlay.updatedAt = new Date();
      playerGamePlay.isTurn = false;

      logger.info(
        'cardThrowTurnExpire : ex :: playerGamePlay :: ',
        playerGamePlay,
        ' : cardThrowTurnExpire : ex :: roundTablePlay :: ',
        roundTablePlay,
      );

      await Promise.all([
        playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
        roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound),
      ]);
      logger.info(` playerGamePlay.isAuto : `, playerGamePlay.isAuto, `playerGamePlay.turnTimeout :`, playerGamePlay.turnTimeout)
      let turnTimeout: boolean = true;
      if (playerGamePlay.isAuto && playerGamePlay.turnTimeout != TIME_OUT_COUNT) {
        turnTimeout = false;
      }
      logger.info("------>> cardThrowTurnExpire :: turnTimeout :: ", turnTimeout)
      turnTimeout = !playerGamePlay.isAuto && isAutoMode ? false : turnTimeout;
      logger.info("------>> cardThrowTurnExpire :: playerGamePlay.isAuto :: ", playerGamePlay.isAuto)

      const eventData = await formatUserThrowCardShow({
        seatIndex: playerGamePlay.seatIndex,
        card,
        turnTimeout,
      });

      // send User Throw Card Show Socket Event in Auto Turn
      commonEventEmitter.emit(EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT, {
        tableId: tableId,
        data: eventData,
      });

      changeThrowCardTurn(tableId);
    }
    return true;
  } catch (e) {
    logger.error(
      `CATCH_ERROR : cardThrowTurnExpire tableId :: ${tableId} :: userId: ${userId} :: `,
      e,
    );

    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info('cardThrowTurnExpire : Lock : ', tableId);
    if (cardThrowTurnExpireLock) {
      await getRedLock.release(cardThrowTurnExpireLock);
    }
  }
}
