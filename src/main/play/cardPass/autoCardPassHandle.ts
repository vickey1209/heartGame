import { redisConnection } from "../../../connections/redis";
import { playersCardPassTurnTimerIf } from "../../interface/schedulerIf";
import logger from "../../logger";
import Errors from "../../errors";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { throwErrorIF } from "../../interface/throwError";
import { ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../../../constants";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { getRandomIndicesArray } from "../../../common";
import { formateCardsWithIndex } from "../common";
import { formatCardPass } from "../helper/formatePlayHelper";
import { formatCardPassIf } from "../../interface/responseIf";
import commonEventEmitter from "../../commonEventEmitter";
import cardsChangeTimerQueue from "../../../scheduler/queues/cardsChangeTimer.queue";
import cancelBattle from "../cancelBattle";

export async function autoCardPassHandle(data: playersCardPassTurnTimerIf) {
    const { tableId } = data;
    const { getRedLock } = redisConnection;
    const autoCardPassLock = await getRedLock.acquire([`${tableId}`], 2000);
    try {
        logger.info('autoCardPassHandle starting... tableId :: ', tableId);
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
        logger.info(" autoCardPassHandle : currentRound :: ", currentRound);

        const roundTablePlay = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound);
        if (!roundTablePlay) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }

        for await (const seat of roundTablePlay.seats) {

            const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf;

            const hardCopyCards = JSON.parse(JSON.stringify(playerGamePlay.currentCards));
            const { cardPassDetails, currentCards } = playerGamePlay;
            logger.info(" autoCardPassHandle :: cardPassDetails :: --->>", cardPassDetails);
            logger.info(" autoCardPassHandle :: currentCards :: --->>", currentCards);

            if (!cardPassDetails.status) {

                //auto select card
                const indexToGenerate = NUMERICAL.THREE - cardPassDetails.cards.length;
                logger.info("autoCardPassHandle :: indexToGenerate :: ====>>", indexToGenerate);

                const randomIndexArray = await getRandomIndicesArray(NUMERICAL.ZERO, currentCards.length - NUMERICAL.ONE, indexToGenerate);
                logger.info("autoCardPassHandle :: randomIndexArray :: ====>>", randomIndexArray);

                cardPassDetails.status = true;

                for (let i = 0; i < randomIndexArray.length; i++) {
                    const element = randomIndexArray[i];
                    cardPassDetails.cards.push(currentCards[element]);
                }
                logger.info(" autoCardPassHandle :: AFTER :: cardPassDetails :: --->>", cardPassDetails);

                for (let i = 0; i < cardPassDetails.cards.length; i++) {
                    const element = cardPassDetails.cards[i];
                    const index = currentCards.findIndex(ele => ele == element);
                    logger.info("autoCardPassHandle :: index :: --->>", index);
                    if(index != NUMERICAL.MINUS_ONE){
                        currentCards.splice(index, NUMERICAL.ONE);
                    }
                }
                // const autoCardPass = [playerGamePlay.currentCards[randomThreeIndex[0]], playerGamePlay.currentCards[randomThreeIndex[1]], playerGamePlay.currentCards[randomThreeIndex[2]]];
                // cardPassDetails.cards = autoCardPass
                logger.info(" autoCardPassHandle :: AFTER :: cardPassDetails :: --->>", cardPassDetails);
                logger.info(" autoCardPassHandle :: AFTER :: currentCards :: --->>", currentCards);

                await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

                // const cards = await formateCardsWithIndex(hardCopyCards, cardPassDetails.cards);
                // logger.info("autoCardPassHandle :: cards :: ====>>", cards);

                //card pass formate.
                const eventCardPassData: formatCardPassIf = await formatCardPass(
                    cardPassDetails.cards,
                    playerGamePlay.userId,
                    playerGamePlay.seatIndex
                );

                // send User card pass turn Started Socket Event
                commonEventEmitter.emit(EVENTS.CARD_PASS_SOCKET_EVENT, {
                    tableId: tableId,
                    data: eventCardPassData,
                });

            }
        }

        roundTablePlay.tableCurrentTimer = new Date();
        roundTablePlay.updatedAt = new Date();
        roundTablePlay.tableState = TABLE_STATE.CARD_MOVE_ROUND_STARTED;
        roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound);

        await cardsChangeTimerQueue({
            timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
            tableId: tableId,
        })

        return true;

    } catch (error: any) {
        logger.error(`CATCH_ERROR :: autoCardPassHandle :: tableId :: ${tableId}  ::`, error);
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
    }
    finally {
        if (autoCardPassLock) {
            await getRedLock.release(autoCardPassLock);
        }

    }
}