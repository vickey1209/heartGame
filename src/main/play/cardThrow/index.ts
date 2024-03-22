import { redisConnection } from "../../../connections/redis";
import { CARD_SEQUENCE, ERROR_TYPE, EVENTS, HISTORY, MESSAGES, NUMERICAL, TABLE_STATE } from "../../../constants";
import { cardThrowRequestIf } from "../../interface/requestIf";
import logger from "../../logger";
import Errors from "../../errors";
import cancelBattle from "../cancelBattle";
import socketAck from "../../../socketAck";
import commonEventEmitter from "../../commonEventEmitter";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { throwErrorIF } from "../../interface/throwError";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { getCardNumber } from "../common";
import { changeThrowCardTurn } from "../turn/changeThrowCardTurn";
import updateTurnHistory from "../history/updateTurnHistory";
import playerTurnTimerCancel from "../../../scheduler/cancelJob/playerTurnTimerCancel.cancel";
import { formantUserThrowCardShowIf } from "../../interface/responseIf";
import { formatUserThrowCardShow } from "../helper/formatePlayHelper";

// User Card Throw on Board
async function cardThrow(
  data: cardThrowRequestIf,
  socket: any,
  ack?: Function,
) {
  logger.info(' cardThrow :: info ::==>> ', data);
  const { card } = data;
  const { tableId, userId } = socket.eventMetaData;
  const { getRedLock } = redisConnection;
  const cardThrowLock = await getRedLock.acquire([`${tableId}`], 2000);
  try {
    const playingTable: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
    if (!playingTable) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }
    const { currentRound } = playingTable;

    const [playerGamePlay, roundTablePlay] = await Promise.all([
      await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf,
      await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf,
    ]);

    if (!playerGamePlay || !roundTablePlay) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    if (roundTablePlay.tableState === TABLE_STATE.SCOREBOARD_DECLARED) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.DECLARED_WINNER_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    logger.info('cardThrow :: playerGamePlay :: ===>> ', playerGamePlay);
    logger.info("cardThrow :: roundTablePlay :: ===>> ", roundTablePlay)
    logger.info("cardThrow :: roundTablePlay.isBreakingHearts :: ===>> ", roundTablePlay.isBreakingHearts)

    if (roundTablePlay.currentTurn !== userId || !playerGamePlay.isTurn) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.CURRENT_TURN_IS_NOT_YOUR_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const userCards: Array<string> = [...playerGamePlay.currentCards];
    logger.info("userCards :: ====================>>> ", userCards);
    const cardIndex = userCards.indexOf(card);

    if (cardIndex === -NUMERICAL.ONE) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.CURRENT_CARD_IS_NOT_YOUR_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    logger.info("cardThrow :: playerGamePlay.isFirstTurn  :: ", playerGamePlay.isFirstTurn, " roundTablePlay.handCount :: ", roundTablePlay.handCount, " card :: ", card);
    if (playerGamePlay.isFirstTurn && roundTablePlay.handCount === NUMERICAL.ZERO && card != CARD_SEQUENCE.CARD_CLUB_TWO) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.FIRST_CARD_THROW_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    // if first hand and heart breaking false, but user try to throw hesrts card.
    if (roundTablePlay.handCount === NUMERICAL.ZERO &&
      roundTablePlay.turnCardSequence != CARD_SEQUENCE.CARD_HEARTS
      && card.split('-')[0] === CARD_SEQUENCE.CARD_HEARTS
      && !roundTablePlay.isBreakingHearts
    ) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.FIRST_CARD_HEART_CARD_THROW_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const roundCurrentCards = [...roundTablePlay.turnCurrentCards];
    roundCurrentCards.sort((a, b) => {
      const cardA =
        Number(a.split('-')[NUMERICAL.ONE]) === NUMERICAL.ONE &&
          a.split('-')[NUMERICAL.ZERO] === roundTablePlay.turnCardSequence
          ? NUMERICAL.FOURTEEN
          : a.split('-')[NUMERICAL.ZERO] === roundTablePlay.turnCardSequence
            ? Number(a.split('-')[NUMERICAL.ONE])
            : NUMERICAL.ZERO;
      const cardB =
        Number(b.split('-')[NUMERICAL.ONE]) === NUMERICAL.ONE &&
          b.split('-')[NUMERICAL.ZERO] === roundTablePlay.turnCardSequence
          ? NUMERICAL.FOURTEEN
          : b.split('-')[NUMERICAL.ZERO] === roundTablePlay.turnCardSequence
            ? Number(b.split('-')[NUMERICAL.ONE])
            : NUMERICAL.ZERO;
      return cardB - cardA;
    });
    logger.info("roundCurrentCards :: ====================>>> ", roundCurrentCards);

    const currentHightCard = roundCurrentCards[NUMERICAL.ZERO];
    logger.info(`currentHightCard ::: ${currentHightCard}`);

    const cardSequence = card.split('-')[NUMERICAL.ZERO];
    let SeaquebceCard: number = NUMERICAL.ZERO;

    // check in my card have a same sequence card or not
    const SeaquebceCardCheck: string | undefined = userCards.find(
      (fcard: string) => {
        return fcard.charAt(NUMERICAL.ZERO) === roundTablePlay.turnCardSequence;
      },
    );
    if (typeof SeaquebceCardCheck === 'undefined') SeaquebceCard = NUMERICAL.ZERO;
    else SeaquebceCard = NUMERICAL.ONE;

    logger.info(`SeaquebceCardCheck ::: ${SeaquebceCardCheck} ::: SeaquebceCard :: ${SeaquebceCard}`);

    let isHighCard: number = NUMERICAL.ZERO;
    // check hight card are avalible or not in card
    const hightCardCheck: string[] = userCards
      .map((fcard: string) => {
        const my = getCardNumber(fcard);
        // logger.info(`my ::: ${my}`);
        const cmy = getCardNumber(currentHightCard);
        // logger.info(`cmy ::: ${cmy}`);
        if (fcard.split('-')[NUMERICAL.ZERO] === roundTablePlay.turnCardSequence && my > cmy)
          return fcard;
        else return '';
      })
      .filter((e: string) => e);

    if (hightCardCheck.length === NUMERICAL.ZERO) isHighCard = NUMERICAL.ZERO;
    else isHighCard = NUMERICAL.ONE;

    logger.info(`hightCardCheck ::: ${hightCardCheck} ::: isHighCard :: ${isHighCard}`);

    // check Hearts Card have or not
    const hartsCardCheck: string | undefined = userCards.find(
      (fcard: string) => {
        return fcard.charAt(NUMERICAL.ZERO) === CARD_SEQUENCE.CARD_HEARTS;
      },
    );
    logger.info(`hartsCardCheck ::: ${hartsCardCheck} `);

    // same sequence
    if (
      roundTablePlay.turnCardSequence !== CARD_SEQUENCE.CARD_NONE &&
      cardSequence !== roundTablePlay.turnCardSequence &&
      SeaquebceCard
    ) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.DONT_THROW_OTHER_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    // Cancel Turn Timer Scheduler
    await playerTurnTimerCancel(
      `${userId}:${tableId}:${currentRound}`,
    );

    logger.info(
      ' cardThrow : roundTablePlay.turnCardSequence :: ',
      roundTablePlay.turnCardSequence,
    );
    if (roundTablePlay.turnCardSequence === CARD_SEQUENCE.CARD_NONE) {

      logger.info("roundTablePlay.isBreakingHearts ::: ====>> ", roundTablePlay.isBreakingHearts);

      //isBreakingHearts then is user can thorw cards
      if (card.split('-')[0] === CARD_SEQUENCE.CARD_HEARTS && !roundTablePlay.isBreakingHearts) {
        const errorObj: throwErrorIF = {
          type: ERROR_TYPE.USER_THROW_CARD_ERROR,
          message: MESSAGES.ERROR.HEART_CARD_THROW_ERROR_MESSAGES,
          isToastPopup: true,
        };
        throw errorObj;
      }
      roundTablePlay.turnCardSequence = cardSequence;
    }


    logger.info(
      'cardThrow : (cardSequence === roundTablePlay.turnCardSequence || SeaquebceCard === NUMERICAL.ZERO) ::: ',
      cardSequence === roundTablePlay.turnCardSequence || SeaquebceCard === NUMERICAL.ZERO,
      'cardThrow : cardSequence :: ',
      cardSequence,
      'cardThrow : roundTablePlay.turnCardSequence :: ',
      roundTablePlay.turnCardSequence,
      'cardThrow : SeaquebceCard :: ',
      SeaquebceCard,
    );

    if (cardSequence === roundTablePlay.turnCardSequence || SeaquebceCard === NUMERICAL.ZERO) {
      playerGamePlay.currentCards.splice(cardIndex, NUMERICAL.ONE);
      /*
      update Turn History
     */
      await updateTurnHistory(
        tableId,
        currentRound,
        playerGamePlay,
        HISTORY.CARD_THROW_TURN,
        card,
        playerGamePlay.currentCards,
      );

      playerGamePlay.currentCards = playerGamePlay.currentCards;

      const turnCards = roundTablePlay.turnCurrentCards;
      turnCards.splice(playerGamePlay.seatIndex, NUMERICAL.ONE, card);
      roundTablePlay.turnCurrentCards = turnCards;
    }
    playerGamePlay.isTurn = false;
    playerGamePlay.turnTimeout = NUMERICAL.ZERO;
    roundTablePlay.tableCurrentTimer = new Date();
    roundTablePlay.updatedAt = new Date();

    await Promise.all([
      playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
      roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound),
    ]);

    const eventData: formantUserThrowCardShowIf = await formatUserThrowCardShow(
      {
        seatIndex: playerGamePlay.seatIndex,
        card,
        turnTimeout: false,
      },
    );

    // send User Throw Card Show Socket Event
    commonEventEmitter.emit(EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT, {
      tableId: tableId,
      data: eventData,
    });

    changeThrowCardTurn(tableId);

  } catch (error: any) {
    logger.error(
      `CATCH_ERROR : cardThrow Turn : tableId: ${tableId} :: userId: ${userId} :: card: ${card} :: `,
      error,
    );

    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    } else if (error && error.type === ERROR_TYPE.USER_THROW_CARD_ERROR) {
      commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
          message: error.message,
        },
      });
    }

    if (ack) {
      socketAck.ackMid(
        EVENTS.USER_THROW_CARD_SOCKET_EVENT,
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
  } finally {
    if (cardThrowLock) {
      await getRedLock.release(cardThrowLock);
    }
  }
}

export = cardThrow;
