import { initialCardPassTurnSetupTimerIf } from "../../interface/schedulerIf";
import logger from "../../logger";
import { redisConnection } from "../../../connections/redis";
import { CARD_PASS, CARD_SEQUENCE, EMPTY, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../../../constants";
import { playerGamePlayCache, roundTablePlayCache } from "../../cache";
import { roundTablePlayIf, seatsInterface } from "../../interface/roundTablePlay";
import commonEventEmitter from "../../commonEventEmitter";
import { cardPassPlayersDataIf, formatStartUserCardPassTurnIf } from "../../interface/responseIf";
import { formatStartUserCardPassTurn } from "../helper/formatePlayHelper";
import playersCardPassTurnTimerQueue from "../../../scheduler/queues/playersCardPassTurnTimer.queue";
import Errors from "../../errors";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import initialUserTurnTimerQueue from "../../../scheduler/queues/initialUserTurnTimer.queue";


export async function startUserCardPassTurn(data: initialCardPassTurnSetupTimerIf) {
    const { tableId, tableGamePlay, playersData } = data;
    logger.info(" startUserCardPassTurn : tableGamePlay :: ", tableGamePlay);
    const { getRedLock } = redisConnection;
    const startUserCardPassTurnLock = await getRedLock.acquire([`${tableId}`], 2000);
    try {

        if (playersData.length <= NUMERICAL.ONE) {
            throw new Errors.UnknownError("Number of players insufficient to game start !");
        }

        const roundTablePlay = await roundTablePlayCache.getRoundTablePlay(tableId, tableGamePlay.currentRound) as roundTablePlayIf;
        if (!roundTablePlay) throw new Errors.UnknownError("can not get round table play");

        roundTablePlay.tableState = TABLE_STATE.CARD_PASS_ROUND_STARTED;
        roundTablePlay.currentPlayerInTable = roundTablePlay.seats.length;
        roundTablePlay.cardPassTurn = true;
        roundTablePlay.tableCurrentTimer = new Date();
        roundTablePlay.updatedAt = new Date();

        await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, tableGamePlay.currentRound);

        const cardChangeSide: number = roundTablePlay.currentRound % NUMERICAL.FOUR;
        logger.info(" startUserCardPassTurn :: cardChangeSide :: ", cardChangeSide);

        if (cardChangeSide === NUMERICAL.ZERO) {
            // currentRound 4,8,12,16... handle
            let nextTurn: string = EMPTY;
            for await (const seat of roundTablePlay.seats) {
                const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf;
                if (playerGamePlay.currentCards.includes(CARD_SEQUENCE.CARD_CLUB_TWO)) {
                    nextTurn = playerGamePlay.userId;
                    playerGamePlay.isTurn = true;
                    playerGamePlay.isFirstTurn = true;
                    await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
                }
            }

            roundTablePlay.lastInitiater = nextTurn;
            await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, tableGamePlay.currentRound);

            // Round 4 : Has no passing tool tip
            commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                tableId,
                data: {
                    isPopup: false,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                    message: MESSAGES.ERROR.NO_PASSING_ERROR_MESSAGES,
                },
            });
            logger.info("nextTurn :: =======>> ", nextTurn);

            await initialUserTurnTimerQueue({
                timer: (NUMERICAL.ONE * NUMERICAL.THOUSAND) + NUMERICAL.FIVE_HUNDRED,
                tableId: tableId,
                tableGamePlay,
                nextTurn,
            })

        } else {

            const cardPassPlayersData: cardPassPlayersDataIf[] = await roundTablePlay.seats.map((ele: seatsInterface) => {
                return {
                    userId: ele.userId,
                    si: ele.si
                }
            })
            logger.info("startUserCardPassTurn :: cardPassPlayersData :: >>", cardPassPlayersData);

            const cardMoveSide: string = (cardChangeSide === NUMERICAL.ONE) ? CARD_PASS.LEFT : (cardChangeSide === NUMERICAL.TWO) ? CARD_PASS.RIGHT : CARD_PASS.ACROSS;
            logger.info("startUserCardPassTurn :: cardMoveSide :: >>", cardMoveSide);

            //card pass turn start.
            const eventCardPassTurnData: formatStartUserCardPassTurnIf = await formatStartUserCardPassTurn(
                cardPassPlayersData,
                tableGamePlay,
                cardMoveSide,
                roundTablePlay.currentRound
            );

            // send User card pass turn Started Socket Event
            commonEventEmitter.emit(EVENTS.USER_CARD_PASS_TURN_STARTED_SOCKET_EVENT, {
                tableId: tableId,
                data: eventCardPassTurnData,
            });

            // Card Pass Turn start
            await playersCardPassTurnTimerQueue({
                timer: (tableGamePlay.cardPassTimer + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
                tableId,
                tableGamePlay,
            });

        }
        logger.info(" startUserCardPassTurn Ending..... ");
        return true;

    } catch (error) {
        logger.error(
            `CATCH_ERROR : startUserCardPassTurn :: tableId: ${tableId}  :`,
            error
        );

        let nonProdMsg = "FAILED";
        commonEventEmitter.emit(EVENTS.SHOW_POPUP, {
            tableId,
            data: {
                isPopup: true,
                popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                title: nonProdMsg,
                message: MESSAGES.ERROR.COMMON_ERROR,
                buttonCounts: NUMERICAL.ONE,
                button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
            },
        });

        return false;
    } finally {
        if (startUserCardPassTurnLock) {
            await getRedLock.release(startUserCardPassTurnLock);
        }
    }
}

