import { initialUserTurnTimerIf } from "../../interface/schedulerIf";
import logger from "../../logger";
import Errors from "../../errors";
import { redisConnection } from "../../../connections/redis";
import { EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from "../../../constants";
import commonEventEmitter from "../../commonEventEmitter";
import { playerGamePlayCache, roundTablePlayCache, turnHistoryCache } from "../../cache";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { roundDetailsInterface } from "../../interface/turnHistoryIf";
import { formatStartUserTurn } from "../helper/formatePlayHelper";
import playerTurnTimerQueue from "../../../scheduler/queues/playerTurnTimer.queue";
import cancelBattle from "../cancelBattle";

export async function startUserTurn(data: initialUserTurnTimerIf) {
    const { tableId, nextTurn, tableGamePlay } = data;
    const { getRedLock } = redisConnection;
    const startUserTurnLock = await getRedLock.acquire([`${tableId}`], 2000);
    try {

        const { currentRound } = tableGamePlay;
        logger.info("startUserTurn : tableId :: >> ", tableId, "currentRound :: >> ", currentRound);

        const [roundTablePlay, playerGamePlay, turnHistory] = await Promise.all([
            await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf,
            await playerGamePlayCache.getPlayerGamePlay(nextTurn, tableId) as playerGamePlayIf,
            await turnHistoryCache.getTurnHistory(tableId, currentRound) as roundDetailsInterface,
        ])

        if (!roundTablePlay) new Errors.UnknownError("can not get round table play data!");
        if (!playerGamePlay) new Errors.UnknownError("can not get player game play data!");
        if (!turnHistory) new Errors.UnknownError("can not get player game play data!");

        roundTablePlay.isWinFlag = false;
        roundTablePlay.currentTurn = playerGamePlay.userId;
        roundTablePlay.currentPlayerInTable = roundTablePlay.seats.length;
        roundTablePlay.turnCount = turnHistory.turnsDetails.length + NUMERICAL.ONE;
        roundTablePlay.tableCurrentTimer = new Date();
        roundTablePlay.updatedAt = new Date();
        roundTablePlay.tableState = TABLE_STATE.ROUND_STARTED;

        await Promise.all([
            roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound)
        ]);

        const eventUserTurnData = await formatStartUserTurn(
            tableId,
            playerGamePlay.userId,
            playerGamePlay.seatIndex,
            currentRound,
            tableGamePlay.userTurnTimer,
            roundTablePlay
        );

        // send User Turn Started Socket Event
        commonEventEmitter.emit(EVENTS.USER_TURN_STARTED_SOCKET_EVENT, {
            tableId: tableId,
            data: eventUserTurnData,
        });

        //user auto turn handle
        if (playerGamePlay.isAuto) {
            logger.info(" startUserTurn : Auto Turn...");
            await playerTurnTimerQueue({
                timer: NUMERICAL.TWO * NUMERICAL.THOUSAND, //2 sec
                jobId: `${playerGamePlay.userId}:${tableId}:${currentRound}`,
                tableId,
                tableGamePlay,
                playerGamePlay,
                isAutoMode : true
            });

        } else {
            //user AUTO DISCARD last Card handle
            if (roundTablePlay.handCount == NUMERICAL.TWELVE) {
                logger.info("startUserTurn : AUTO DISCARD Last card Turn ");

                playerGamePlay.turnTimeout -= 1;
                playerGamePlay.isTurn = true;
                await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId)

                await playerTurnTimerQueue({
                    timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
                    jobId: `${playerGamePlay.userId}:${tableId}:${currentRound}`,
                    tableId,
                    tableGamePlay,
                    playerGamePlay
                });

            } else {
                //user Manual Turn handle
                logger.info(" startUserTurn : Manual Turn... ");
                await playerTurnTimerQueue({
                    timer: (tableGamePlay.userTurnTimer * NUMERICAL.THOUSAND ) + NUMERICAL.FIVE_HUNDRED,
                    jobId: `${playerGamePlay.userId}:${tableId}:${currentRound}`,
                    tableId,
                    tableGamePlay,
                    playerGamePlay
                });
            }

        }

        return true;

    } catch (error) {
        logger.error(tableId,
            `CATCH_ERROR :: startUserTurn :: tableId :: ${tableId}  ::`,
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
    }
    finally {
        if (startUserTurnLock) {
            await getRedLock.release(startUserTurnLock);
        }
    }
}