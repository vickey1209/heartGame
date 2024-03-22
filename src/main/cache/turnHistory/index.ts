import logger from "../../logger"
import { REDIS } from '../../../constants';
import redis from '../../redis';
import { roundDetailsInterface } from "../../interface/turnHistoryIf";

const insertTurnHistory = async (
    obj: roundDetailsInterface,
    tableId: string,
    roundNo: number,
): Promise<boolean> => {
    const key = `${REDIS.PREFIX.TURN_HISTORY}:${tableId}:${roundNo}`;
    try {
        await redis.commands.setValueInKeyWithExpiry(key, obj);
        return true;

    } catch (error) {
        logger.error(tableId,
            `Error in insertTurnHistory for key ${key} and object ${JSON.stringify(obj)}`,
            error
        );
        throw new Error("set value key error")
    }
};

const getTurnHistory = async (
    tableId: string,
    roundNo: number,
): Promise<roundDetailsInterface | null> => {
    const key = `${REDIS.PREFIX.TURN_HISTORY}:${tableId}:${roundNo}`;
    try {
        const turnHistory = await redis.commands.getValueFromKey(key);
        return turnHistory;
    } catch (error) {
        logger.error(tableId, `Error in getTurnHistory for key ${key}`, error);
        throw new Error("set value key error")

    }
};

const deleteTurnHistory = async (
    tableId: string,
    roundNo: number,
): Promise<boolean> => {
    const key = `${REDIS.PREFIX.TURN_HISTORY}:${tableId}:${roundNo}`;
    try {
        return redis.commands.deleteKey(key);
    } catch (e) {
        logger.error(tableId, `Error in deleteTurnHistory for key ${key} `, e);
        return false;
    }
};

const exportedObject = {
    insertTurnHistory,
    getTurnHistory,
    deleteTurnHistory
};

export = exportedObject;