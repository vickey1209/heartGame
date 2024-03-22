import { redisConnection } from "../../../connections/redis";
import { cardsChangeTimerIf } from "../../interface/schedulerIf";
import logger from "../../logger";
import Errors from "../../errors";
import commonEventEmitter from "../../commonEventEmitter";
import { CARD_SEQUENCE, EMPTY, ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../../../constants";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { throwErrorIF } from "../../interface/throwError";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { findAndMoveCardsInAcrossSide, findAndMoveCardsInLeftSide, findAndMoveCardsInRightSide, formatCardMoveRes } from "../common";
import { cardMoveIf, cardMoveRes, formatCardMoveIf } from "../../interface/responseIf";
import { formatCardMove } from "../helper/formatePlayHelper";
import initialUserTurnTimerQueue from "../../../scheduler/queues/initialUserTurnTimer.queue";
import cancelBattle from "../cancelBattle";
import { setCardSuitWise } from "../helper/distributeCards";

export async function cardChangeHandle(data: cardsChangeTimerIf) {
    const { tableId } = data;
    const { getRedLock } = redisConnection;
    const cardChangeLock = await getRedLock.acquire([`${tableId}`], 2000);
    try {

        logger.info('cardChangeHandle starting... tableId :: ', tableId);
        const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
        if (!tableGamePlay) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }
        const { currentRound } = tableGamePlay;
        logger.info(" cardChangeHandle :: currentRound :: ", currentRound);

        const roundTablePlay = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound);
        if (!roundTablePlay) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }

        const cardChangeSide = currentRound % NUMERICAL.FOUR;
        logger.info(" cardChangeHandle :: cardChangeSide :: ", cardChangeSide);

        /* cardChangeSide 1 to 4
         1 : LEFT SIDE
         2 : RIGHT SIDE
         3 : ACROSS SIDE
         4 : NO CHANGE */

        let playerCards: string[][] = [];
        const playersCurrentCards: string[][] = [];
        const playersPassCards: string[][] = [];
        const newPlayerCards: string[][] = [];
        if (cardChangeSide != NUMERICAL.ZERO) {

            for await (const seat of roundTablePlay.seats) {
                const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf;
                playersCurrentCards.push(playerGamePlay.currentCards);
                playersPassCards.push(playerGamePlay.cardPassDetails.cards);
            }
            logger.info('playersCurrentCards :==>> ', playersCurrentCards);
            logger.info('playersPassCards :==>> ', playersPassCards);

            if (cardChangeSide === NUMERICAL.ONE) {
                playerCards = await findAndMoveCardsInLeftSide(playersCurrentCards, playersPassCards);
            } else if (cardChangeSide === NUMERICAL.TWO) {
                playerCards = await findAndMoveCardsInRightSide(playersCurrentCards, playersPassCards);
            } else if (cardChangeSide === NUMERICAL.THREE) {
                playerCards = await findAndMoveCardsInAcrossSide(playersCurrentCards, playersPassCards);
            }
            logger.info("playerCards :: --->> ", playerCards);


            for (let i = 0; i < playerCards.length; i++) {
                const element = playerCards[i];
                const sortCard = await setCardSuitWise(element);
                newPlayerCards.push(sortCard);
            }
            logger.info("newPlayerCards :: --->> ", newPlayerCards);

            for (let i = 0; i < roundTablePlay.seats.length; i++) {
                const seat = roundTablePlay.seats[i];
                const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf;
                playerGamePlay.currentCards = newPlayerCards[i];
                await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
            }
        }
        const cardMoveRes: cardMoveRes[][] = await formatCardMoveRes(newPlayerCards, playersCurrentCards);
        logger.info(" cardChangeHandle :: cardMoveRes :: ", cardMoveRes);

        const playersCardMove: cardMoveIf[] = [];
        let nextTurn: string = EMPTY;

        for (let i = 0; i < roundTablePlay.seats.length; i++) {
            const seat = roundTablePlay.seats[i];
            const cardMove = <cardMoveIf>{}
            const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf;
            cardMove.cards = cardMoveRes[i];
            cardMove.userId = playerGamePlay.userId;
            cardMove.userSI = playerGamePlay.seatIndex;

            if (playerGamePlay.currentCards.includes(CARD_SEQUENCE.CARD_CLUB_TWO)) {
                nextTurn = playerGamePlay.userId;
                playerGamePlay.isTurn = true;
                playerGamePlay.isFirstTurn = true;
                await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
            }

            let destinationSI: number = NUMERICAL.MINUS_ONE;
            const shiftBy = (direction: number) => {
                destinationSI = (playerGamePlay.seatIndex + direction + tableGamePlay.totalPlayers) % tableGamePlay.totalPlayers;
            };

            if (cardChangeSide === NUMERICAL.ONE) {
                shiftBy(NUMERICAL.ONE);
            } else if (cardChangeSide === NUMERICAL.TWO) {
                shiftBy(NUMERICAL.MINUS_ONE);
            } else if (cardChangeSide === NUMERICAL.THREE) {
                shiftBy(playerGamePlay.seatIndex >= tableGamePlay.totalPlayers - 2 ? -2 : 2);
            }
            cardMove.destinationSI = destinationSI;
            playersCardMove.push(cardMove);
        }

        roundTablePlay.lastInitiater = nextTurn;
        roundTablePlay.tableCurrentTimer = new Date();
        roundTablePlay.updatedAt = new Date();
        roundTablePlay.tableState = TABLE_STATE.CARD_MOVE_ROUND_STARTED;
        roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound);

        //card move formate.
        const eventCardMoveData: formatCardMoveIf = await formatCardMove(playersCardMove);

        // send User card move turn Started Socket Event
        commonEventEmitter.emit(EVENTS.CARD_MOVE_SOCKET_EVENT, {
            tableId: tableId,
            data: eventCardMoveData,
        });

        logger.info("nextTurn :: ==>> ", nextTurn);
        await initialUserTurnTimerQueue({
            timer: NUMERICAL.THREE * NUMERICAL.THOUSAND,
            tableId: tableId,
            tableGamePlay,
            nextTurn,
        })

        return true;


    } catch (error) {
        logger.error(tableId,
            `CATCH_ERROR :: cardChangeHandle :: tableId :: ${tableId}  ::`,
            error
        );
        if (error instanceof Errors.CancelBattle) {
            await cancelBattle({
                tableId,
                errorMessage: error,
            });
        } else {
            commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                tableId: tableId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    message: MESSAGES.ERROR.COMMON_ERROR,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        }
        return false;
    } finally {
        if (cardChangeLock) {
            await getRedLock.release(cardChangeLock);
        }

    }
}




// if (cardChangeSide === NUMERICAL.ONE) {
//     if (playerGamePlay.seatIndex == tableGamePlay.totalPlayers - NUMERICAL.ONE) {
//         destinationSI = NUMERICAL.ZERO
//     } else {
//         destinationSI = playerGamePlay.seatIndex + NUMERICAL.ONE;
//     }
// } else if (cardChangeSide === NUMERICAL.TWO) {
//     if (playerGamePlay.seatIndex == NUMERICAL.ZERO) {
//         destinationSI = tableGamePlay.totalPlayers - NUMERICAL.ONE;
//     } else {
//         destinationSI = playerGamePlay.seatIndex - NUMERICAL.ONE;
//     }
// } else if (cardChangeSide === NUMERICAL.THREE) {
//     if (playerGamePlay.seatIndex >= tableGamePlay.totalPlayers - NUMERICAL.TWO) {
//         destinationSI = playerGamePlay.seatIndex - NUMERICAL.TWO;
//     } else {
//         destinationSI = playerGamePlay.seatIndex + NUMERICAL.TWO;
//     }
// }