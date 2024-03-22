import Joi from 'joi';
import logger from "../../logger"
import { REDIS } from '../../../constants';
import redis from '../../redis';
import { roundTablePlayIf } from '../../interface/roundTablePlay';
import { roundTablePlaySchema } from '../../Validator/schemas/methodSchemas';

const getRoundTablePlay = async (
  tableId: string,
  roundNo: number
): Promise<roundTablePlayIf | null> => {
  const keyData = `${REDIS.PREFIX.ROUND}:${tableId}:${roundNo}`;
  try {
    const roundTablePlay =
      await redis.commands.getValueFromKey(keyData);
    if (roundTablePlay) Joi.assert(roundTablePlay, roundTablePlaySchema);
    return roundTablePlay;
  } catch (error) {
    logger.error(`Error in getRoundTablePlay for key ${keyData}`, error);
    throw new Error(`Error in getRoundTablePlay for key ${keyData} Error :: ${error}`)
  }
};

const deleteRoundTablePlay = async (
  tableId: string,
  roundNo: number
): Promise<boolean> => {
  const key = `${REDIS.PREFIX.ROUND}:${tableId}:${roundNo}`;
  try {
    return await redis.commands.deleteKey(key);
  } catch (e) {
    logger.error(`Error in deleteRoundTablePlay for key ${key} `, e);
    return false;
  }
};

async function insertRoundTablePlay(
  roundTablePlay: roundTablePlayIf,
  tableId: string,
  roundNo : number,
): Promise<boolean> {
  const key = `${REDIS.PREFIX.ROUND}:${tableId}:${roundNo}`;
  try {
    Joi.assert(roundTablePlay, roundTablePlaySchema);
    const res = await redis.commands.setValueInKeyWithExpiry(key, roundTablePlay);

    return res;
  } catch (error) {
    logger.error(`Error in insertRoundTablePlay for key ${key} `, error);
    throw new Error(`Error in insertRoundTablePlay for key ${key} Error :: ${error}`)
  }
}

const exportedObject = {
  getRoundTablePlay,
  deleteRoundTablePlay,
  insertRoundTablePlay
};
export = exportedObject;