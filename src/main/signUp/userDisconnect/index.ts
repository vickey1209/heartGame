import logger from '../../logger';
import { getConfig } from '../../../config';
const { REJOIN_TIMER } = getConfig();
import {
    TABLE_STATE,
    NUMERICAL,
    PLAYER_STATE,
} from '../../../constants';
import { playerGamePlayCache, rejoinDataCache, roundTablePlayCache, tableGamePlayCache, userProfileCache } from '../../cache';
import { tableGamePlayIf } from '../../interface/tableGamePlay';
import { userIf } from '../../interface/user';
import cancelBattle from '../../play/cancelBattle';
import Errors from '../../errors';
import { socketDataIf } from '../../interface/schedulerIf';
import { redisConnection } from "../../../connections/redis";
import { playerGamePlayIf } from '../../interface/playerGamePlay';
import { roundTablePlayIf } from '../../interface/roundTablePlay';
import { leaveTable } from '../../play/leaveTable';

// call On socket disconnect
const userDisconnect = async (socket: any) => {
    logger.info(' userDisconnect : REJOIN_TIMER :::------------>> ', REJOIN_TIMER, " socket.id  ==>> ", socket.id);
    logger.info(' userDisconnect : socket.eventMetaData :: ', socket.eventMetaData, "  typeof socket.eventMetaData  :: >==>", typeof socket.eventMetaData);

    if (
        typeof socket.eventMetaData === "undefined" ||
        typeof socket.eventMetaData.tableId === "undefined"
    ) {
        logger.error(`<<<========================================    disconnect eventMetaData is not found :: Ignore this error message...    ==========================================>>>`)
        throw new Error('disconnect eventMetaData is not found');
    }
    const { tableId, userId } = socket.eventMetaData;
    const { getRedLock } = redisConnection;
    const disconnectLock = await getRedLock.acquire([userId], 2000);
    try {
        if (
            typeof userId != 'undefined' &&
            userId != '' &&
            userId != null &&
            typeof tableId != 'undefined' &&
            tableId != '' &&
            tableId != null
        ) {
            logger.info(tableId,
                'userDisconnect : socket.eventMetaData ::: ',
                socket.eventMetaData,
                'userDisconnect : userId ::: ',
                userId,
                'userDisconnect : tableId ::: ',
                tableId,
            );

            const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
            const roundTablePlay = await roundTablePlayCache.getRoundTablePlay(tableId, tableGamePlay.currentRound) as roundTablePlayIf;
            const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(userId, tableId) as playerGamePlayIf;
            const userProfile = await userProfileCache.getUserProfile(userId) as userIf;

            logger.info("userDisconnect :: tableGamePlay :::>>> ", tableGamePlay);
            logger.info("userDisconnect :: playerGamePlay :::>>> ", playerGamePlay);
            logger.info("userDisconnect :: userProfile :::>>> ", userProfile);

            if (tableGamePlay != null) {
                const { currentRound, lobbyId, gameId } = tableGamePlay;
                if(roundTablePlay.tableState === TABLE_STATE.WINNER_DECLARED){
                    return true;
                }
                logger.info(tableId, " roundTablePlay :: ====>> ", roundTablePlay);
                if (roundTablePlay.tableState != TABLE_STATE.WAITING_FOR_PLAYERS) {
                    const storeInRedis = {
                        userId,
                        tableId,
                        isEndGame: false,
                    };
                    const socketData : socketDataIf = {
                        id: socket.id,
                        eventMetaData: {
                            userId,
                            tableId
                        },
                    };

                    await rejoinDataCache.insertRejoinTableHistory(userId, gameId, lobbyId, storeInRedis);

                } else {
                    logger.info(tableId, 'userDisconnect : call else...');
                    const socketData = {
                        id: socket.id,
                        eventMetaData: {
                            userId,
                            tableId,
                            currentRound: currentRound,
                        },
                    };
                    logger.info(tableId,
                        'userDisconnect : socket.id ::  ',
                        socket.id,
                        'userDisconnect :: userProfile.socketId : socketId :: ',
                        userProfile.socketId,
                    );

                    if (userProfile.socketId == socket.id) {
                       await leaveTable(tableId, PLAYER_STATE.DISCONNECT, socket);
                    }
                }
            } else {
                logger.info(tableId,
                    'userDisconnect : leave user on.',
                    'userDisconnect : socketId :: 1 ::: ',
                    socket.id,
                    'userDisconnect : ta.socketId :: ',
                    userProfile.socketId,
                );

                if (userProfile.socketId == socket.id) {
                    await leaveTable(tableId, PLAYER_STATE.DISCONNECT, socket);
                }
            }
        } else {
            logger.info(tableId,
                'userDisconnect : data not proper in userDisconnect :: ',
                socket.eventMetaData,
            );
        }
    } catch (e) {
        logger.error(`<<<========================================   catch ::  disconnect eventMetaData is not found :: Ignore this error message...     ==========================================>>>`)
        logger.error(tableId,
            `CATCH_ERROR : userDisconnect : userDisconnect :: userId: ${typeof socket.eventMetaData !== undefined &&
                typeof socket.eventMetaData.userId !== undefined
                ? socket.eventMetaData.userId
                : ''
            } :: tableId: ${typeof socket.eventMetaData !== undefined &&
                typeof socket.eventMetaData.tableId !== undefined
                ? socket.eventMetaData.tableId
                : ''
            } ::`,
            e,
        );

        if (e instanceof Errors.CancelBattle) {
          await cancelBattle({tableId});
        }
    } finally {
        if(disconnectLock){
            await getRedLock.release(disconnectLock);
        }
    }
};

export = userDisconnect;

