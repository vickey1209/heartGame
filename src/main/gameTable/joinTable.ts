import { EVENTS, NUMERICAL, TABLE_STATE } from "../../constants";
import { rejoinDataCache, roundTablePlayCache } from "../cache";
import logger from "../logger";
import Errors from "../errors";
import redis from "../redis";
import { tableGamePlayIf } from "../interface/tableGamePlay";
import { playerGamePlayIf } from "../interface/playerGamePlay";
import { roundTablePlayIf } from "../interface/roundTablePlay";
import { formatJoinTableInfo } from "../play/helper/formatePlayHelper";
import commonEventEmitter from "../commonEventEmitter";
import initializeGameplayQueue from "../../scheduler/queues/initializeGameplay.queue";


async function joinTable(socket: any, queueKey: string, userId: string, tableId: string, roundTablePlay: roundTablePlayIf, playerGamePlay: playerGamePlayIf, tableGamePlay: tableGamePlayIf) {
    try {
        logger.info(" Join table starting......  ::>> tableId :: ", tableId, "userId ::>> ", userId, "socket :: ", typeof socket);
        const eventJoinTableData = await formatJoinTableInfo(roundTablePlay, playerGamePlay);

        // join socket in socket room
        commonEventEmitter.emit(EVENTS.ADD_PLAYER_IN_TABLE_ROOM, {
            socket,
            data: { tableId },
        });

        // send JOIN_TABLE event
        commonEventEmitter.emit(EVENTS.JOIN_TABLE_SOCKET_EVENT, {
            tableId,
            data: eventJoinTableData,
        });

        socket.eventMetaData = {
            userId: playerGamePlay.userId,
            tableId,
        };
        logger.info("joinTable :: socket.eventMetaData :: >> ", socket.eventMetaData);

        //set Rejoin Table History
        await rejoinDataCache.insertRejoinTableHistory(
            userId,
            tableGamePlay.gameId,
            tableGamePlay.lobbyId,
            {
                userId: userId,
                tableId,
                isEndGame: false,
            }
        );

        logger.info(" joinTable :: roundTablePlay.totalPlayers :::: >> ", roundTablePlay.totalPlayers);
        logger.info(" joinTable :: roundTablePlay.currentPlayerInTable  :::: >> ", roundTablePlay.currentPlayerInTable);
        //if min player is available for game start
        if (Number(roundTablePlay.totalPlayers) > NUMERICAL.ONE) {
            if (roundTablePlay.currentPlayerInTable !== Number(tableGamePlay.totalPlayers)) {
                // push table in the Queue if FTUE is true to add bot
                logger.info(userId, " insertNewPlayer :: pushTableInQueue :: tableId :: ==>>", tableId);
                if (roundTablePlay.currentPlayerInTable == NUMERICAL.ONE) {
                    await redis.commands.pushIntoQueue(queueKey, tableId);
                }
            } else if (roundTablePlay.currentPlayerInTable === tableGamePlay.totalPlayers) {

                const data = {
                    timer: tableGamePlay.gameStartTimer,
                };

                commonEventEmitter.emit(EVENTS.ROUND_TIMER_STARTED_SOCKET_EVENT, {
                    tableId,
                    data,
                });
                logger.info(userId,
                    "insertNewPlayer : GameStartTimer :::: ",
                    tableGamePlay.gameStartTimer,
                    ` tableId :::  ${tableId}`
                );


                await initializeGameplayQueue({
                    timer: Number(tableGamePlay.gameStartTimer - NUMERICAL.FIVE) * NUMERICAL.THOUSAND,
                    queueKey,
                    tableId,
                    tableGamePlay,
                    roundTablePlay
                });

                roundTablePlay.tableState = TABLE_STATE.ROUND_TIMER_STARTED;
                roundTablePlay.tableCurrentTimer = new Date();
                roundTablePlay.updatedAt = new Date();

                logger.info(' remTableFromQueue :>> queueKey :: ', queueKey);
                await redis.commands.remFromQueue(queueKey, tableId);
                await roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, tableGamePlay.currentRound);
            }
        }
        else {
            throw new Errors.InvalidInput("number of player require more then one!")
        }

        return true;
    } catch (error) {
        logger.error(tableId,
            `CATCH_ERROR : joinTable :: tableId: ${tableId} :: userId: ${userId} :: `,
            error,
        );
        throw error;
    }

}

export = joinTable;