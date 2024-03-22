import Joi from 'joi';
import logger from "../../logger";
import { REDIS } from '../../../constants';
import { tableGamePlaySchema } from '../../Validator/schemas/methodSchemas';
import redis from '../../redis';
import { tableGamePlayIf } from '../../interface/tableGamePlay';

async function getRoundScoreHistory(
    tableId: string,
): Promise<any | null> {
    const key = `${REDIS.PREFIX.SCORE_HISTORY}:${tableId}`;
    try {
        const roundScoreHistory =  await redis.commands.getValueFromKey(key);
        return roundScoreHistory;
    } catch (error) {
        logger.error(tableId, `Error in getRoundScoreHistory for tableId ${tableId} and currentRound `, error);
        throw new Error("Error in getRoundScoreHistory for tableId" + error);
    }
}

async function insertRoundScoreHistory(
    value: any,
    tableId: string,
): Promise<boolean> {
    const key = `${REDIS.PREFIX.SCORE_HISTORY}:${tableId}`;
    try {
        const res = await redis.commands.setValueInKeyWithExpiry(key, value);
        return res;
    } catch (error) {
        logger.error(tableId, `Error in insertRoundScoreHistory for tableId ${tableId} `, error);
        throw new Error("Error in insertRoundScoreHistory for tableId " + error);
    }
}

const deleteRoundScoreHistory = async (
    tableId: string,
): Promise<boolean> => {
    const key = `${REDIS.PREFIX.SCORE_HISTORY}:${tableId}`;
    try {
        return redis.commands.deleteKey(key);
    } catch (e) {
        logger.error(tableId, `Error in deleteRoundScoreHistory for key ${key} `, e);
        return false;
    }
};

const exportObj = {
    getRoundScoreHistory,
    insertRoundScoreHistory,
    deleteRoundScoreHistory
};

export = exportObj;
