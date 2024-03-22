import Joi from 'joi';
import logger from "../../logger";
import { REDIS } from '../../../constants';
import redis from '../../redis';
import { RejoinTableHistoryIf } from '../../interface/tableGamePlay';
import Validator from "../../Validator";

// Rejoin User Function
const getRejoinTableHistory = (
    userId: string,
    gameId: string,
    lobbyId: string
): Promise<RejoinTableHistoryIf> => {
    const key = `${REDIS.PREFIX.REJOIN_HISTORY}:${userId}:${gameId}:${lobbyId}`;
    return redis.commands.getValueFromKey(key);
}


const insertRejoinTableHistory = async (
    userId: string,
    gameId: string,
    lobbyId: string,
    value: RejoinTableHistoryIf
) => {
    try {
        value = await Validator.methodValidator.rejoinTableHistoryValidator(value);
        const key = `${REDIS.PREFIX.REJOIN_HISTORY}:${userId}:${gameId}:${lobbyId}`;
        return redis.commands.setValueInKeyWithExpiry(key, value);
    } catch (e) {
        logger.error(userId,
            `CATCH_ERROR : insertRejoinTableHistory :: userId : ${userId} :: gameId : ${gameId} :: lobbyId : ${lobbyId}`,
            value,
            e
        );
        throw e;
    }
};

const removeRejoinTableHistory = (
    userId: string,
    gameId: string,
    lobbyId: string
) => {
    const key = `${REDIS.PREFIX.REJOIN_HISTORY}:${userId}:${gameId}:${lobbyId}`;
    try {
        return redis.commands.deleteKey(key);;
    } catch (e) {
        logger.error(userId, `Error in removeRejoinTableHistory for key ${key} `, e);
        return false;
    }
}

const exportObj = {
    getRejoinTableHistory,
    insertRejoinTableHistory,
    removeRejoinTableHistory
};

export = exportObj;