import { cardPassRequestIf } from "../../interface/requestIf";
import { redisConnection } from "../../../connections/redis";
import logger from "../../logger";
import Errors from "../../errors";
import { ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL } from "../../../constants";
import commonEventEmitter from "../../commonEventEmitter";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { throwErrorIF } from "../../interface/throwError";
import { formatCardPass } from "../helper/formatePlayHelper";
import { formatCardPassIf } from "../../interface/responseIf";
import { formateCardsWithIndex } from "../common";
import cancelBattle from "../cancelBattle";
import cardsChangeTimerQueue from "../../../scheduler/queues/cardsChangeTimer.queue";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import playersCardPassTurnTimerCancel from "../../../scheduler/cancelJob/playersCardPassTurnTimerCancel.cancel";


export async function cardPass(socket: any, cardPassData: cardPassRequestIf) {
    logger.info(" cardPass : cardPassData :: ", cardPassData);
    const socketId = socket.id;
    const tableId = socket.eventMetaData.tableId || cardPassData.tableId;
    const userId = socket.eventMetaData.userId || cardPassData.userId;
    logger.info(" cardPass : tableId :: ", tableId, "userId :: ", userId);

    const { getRedLock } = redisConnection;
    const cardPassLock = await getRedLock.acquire([`${tableId}`], 2000);
    try {

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
        logger.info(" cardPass : currentRound :: ", currentRound);


        const [playerGamePlay, roundTablePlay] = await Promise.all([
            playerGamePlayCache.getPlayerGamePlay(userId, tableId),
            roundTablePlayCache.getRoundTablePlay(tableId, currentRound),
        ])
        if (!playerGamePlay || !roundTablePlay) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }

        if (playerGamePlay.cardPassDetails.status) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.CARD_PASS_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }
        let isCheckcard = cardPassData.cards.every(element => playerGamePlay.currentCards.includes(element));
        logger.info(" cardPass :: isCheckcard :: ==>> ", isCheckcard);

        if (!isCheckcard) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.SELECTED_CARD_IS_NOT_YOUR_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }

        for (let i = 0; i < cardPassData.cards.length; i++) {
            const card = cardPassData.cards[i];
            const index = playerGamePlay.currentCards.findIndex(ele => ele == card);
            if(index != NUMERICAL.MINUS_ONE){
                playerGamePlay.currentCards.splice(index, NUMERICAL.ONE);
            }
        }

        playerGamePlay.cardPassDetails.cards = cardPassData.cards;
        playerGamePlay.cardPassDetails.status = true;

        logger.info("cardPass :: playerGamePlay.cardPassDetails :: ====>>", playerGamePlay.cardPassDetails);
        logger.info("cardPass :: playerGamePlay.currentCards :: ====>>", playerGamePlay.currentCards);

        await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

        // const cards = await formateCardsWithIndex(playerGamePlay.currentCards, cardPassData.cards);
        // logger.info("cardPass :: cards :: ====>>", cards);

        //card pass formate.
        const eventCardPassData: formatCardPassIf = await formatCardPass(
            cardPassData.cards,
            userId,
            playerGamePlay.seatIndex
        );

        // send User card pass turn Started Socket Event
        commonEventEmitter.emit(EVENTS.CARD_PASS_SOCKET_EVENT, {
            tableId: tableId,
            data: eventCardPassData,
        });

        //check all user card pass done or not.
        let cardPassStatus: boolean[] = [];
        for await (const seat of roundTablePlay.seats) {
            const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
            cardPassStatus.push(playerGamePlay.cardPassDetails.status);
        }

        const isAllUserCardPass = cardPassStatus.every((ele) => ele == true);
        logger.info("cardPass :: isAllUserCardPass :: ", isAllUserCardPass);

        if (isAllUserCardPass) {
            await playersCardPassTurnTimerCancel(`playersCardPassTurnTimer:${tableId}`)
            await cardsChangeTimerQueue({
                timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
                tableId: tableId,
            })
        }

        return true;

    } catch (error: any) {
        logger.error(`CATCH_ERROR :: cardPass :: tableId :: ${tableId}  :: `, error);
        if (error instanceof Errors.CancelBattle) {
            await cancelBattle({
                tableId,
                errorMessage: error,
            });
        } else if (error && error.type === ERROR_TYPE.USER_CARD_PASS_ERROR) {
            commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                socket: socketId,
                data: {
                    isPopup: false,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                    message: error.message,
                },
            });
        } else {
            commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                socket: socketId,
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
    }
    finally {
        if (cardPassLock) {
            await getRedLock.release(cardPassLock);
        }
    }
}