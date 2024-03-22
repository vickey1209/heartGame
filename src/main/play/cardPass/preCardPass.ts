import { ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL } from "../../../constants";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { preCardPassSelectRequestIf } from "../../interface/requestIf";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { throwErrorIF } from "../../interface/throwError";
import { redisConnection } from "../../../connections/redis";
import logger from "../../logger";
import Errors from "../../errors";
import commonEventEmitter from "../../commonEventEmitter";
import cancelBattle from "../cancelBattle";
import { formatPreCardPassIf } from "../../interface/responseIf";
import { formatPreCardPass } from "../helper/formatePlayHelper";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { roundTablePlayIf } from "../../interface/roundTablePlay";

export async function preCardPass(socket: any, preCardPassData: preCardPassSelectRequestIf) {
    logger.info(" preCardPass :: preCardPassData ::--->> ", preCardPassData);
    const socketId = socket.id;
    const tableId = socket.eventMetaData.tableId || preCardPassData.tableId;
    const userId = socket.eventMetaData.userId || preCardPassData.userId;
    logger.info(" preCardPass :: tableId :: ", tableId, " userId :: ", userId);

    const { getRedLock } = redisConnection;
    const preCardPassLock = await getRedLock.acquire([`${userId}`], 2000);
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
        logger.info(" preCardPass : currentRound :: ", currentRound);

        const [playerGamePlay, roundTablePlay] = await Promise.all([
            await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf,
            await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf,
        ])
        logger.info(" preCardPass :: playerGamePlay :: ==>> ", playerGamePlay);
        logger.info(" preCardPass :: roundTablePlay :: ==>> ", roundTablePlay);

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
        const { forwardCardMove } = preCardPassData;
        let isCheckcard = playerGamePlay.currentCards.includes(preCardPassData.card);
        logger.info(" preCardPass :: isCheckcard :: ==>> ", isCheckcard, " forwardCardMove :: ", forwardCardMove);

        if (!isCheckcard && forwardCardMove) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.SELECTED_CARD_IS_NOT_YOUR_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }

        const { cardPassDetails, currentCards } = playerGamePlay;
        logger.info(" preCardPass :: cardPassDetails :: ==>> ", cardPassDetails);
        logger.info(" preCardPass :: currentCards :: ==>> ", currentCards);
        logger.info(" preCardPass :: forwardCardMove :: ==>> ", forwardCardMove);

        if (cardPassDetails.cards.length < NUMERICAL.THREE && forwardCardMove) {
            const index = currentCards.findIndex(ele => ele == preCardPassData.card);
            console.log('forwardCardMove :: index :--->> ', index);
            if (index != NUMERICAL.MINUS_ONE) {
                currentCards.splice(index, NUMERICAL.ONE);
                cardPassDetails.cards.push(preCardPassData.card);
            }
        }
        if (cardPassDetails.cards.length > NUMERICAL.ZERO && !forwardCardMove) {
            const index = cardPassDetails.cards.findIndex(ele => ele == preCardPassData.card);
            console.log('forwardCardMove :: index :==>> ', index);
            if (index != NUMERICAL.MINUS_ONE) {
                cardPassDetails.cards.splice(index, NUMERICAL.ONE);
                currentCards.push(preCardPassData.card);
            }
        }
        const passCards = cardPassDetails.cards;
        logger.info(" preCardPass :: AFTER :: passCards :: ==>> ", passCards);
        logger.info(" preCardPass :: AFTER :: currentCards :: ====>> ", currentCards);

        await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

        //pre card pass formate.
        const eventPreCardPassData: formatPreCardPassIf = await formatPreCardPass(
            passCards,
            preCardPassData.card,
            forwardCardMove,
            userId,
            playerGamePlay.seatIndex
        );
        logger.info("preCardPass :: eventPreCardPassData :: ====>>", eventPreCardPassData)

        // send User pre card pass turn Started Socket Event
        commonEventEmitter.emit(EVENTS.PRE_CARD_PASS_SELECT_SOCKET_EVENT, {
            socket: socketId,
            data: eventPreCardPassData,
        });

        return true;

    } catch (error: any) {
        logger.error(`CATCH_ERROR :: preCardPass ::: tableId ::: ${tableId}  ::: `, error);
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
        if (preCardPassLock) {
            await getRedLock.release(preCardPassLock);
        }
    }
}