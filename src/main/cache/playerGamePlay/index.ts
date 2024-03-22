import Joi from 'joi';
import logger from "../../logger"
import { REDIS } from '../../../constants';
import { playerGamePlaySchema } from '../../Validator/schemas/methodSchemas';
import redis from '../../redis';
import { playerGamePlayIf } from '../../interface/playerGamePlay';

const getPlayerGamePlay = async (
  userId: string,
  tableId: string
): Promise<playerGamePlayIf | null> => {
  const keyData = `${REDIS.PREFIX.PLAYER_GAME_PLAY}:${userId}:${tableId}`;
  try {
    const playerGamePlay =
      await redis.commands.getValueFromKey(keyData);
    if (playerGamePlay) Joi.assert(playerGamePlay, playerGamePlaySchema);
    return playerGamePlay;
  } catch (error) {
    logger.error(`Error in getPlayerGamePlay for key ${keyData}`, error);
    throw new Error(`Error in getPlayerGamePlay for key ${keyData} Error :: ${error}`)
  }
};

const deletePlayerGamePlay = async (
  userId: string,
  tableId: string
): Promise<boolean> => {
  const key = `${REDIS.PREFIX.PLAYER_GAME_PLAY}:${userId}:${tableId}`;
  try {
    return await redis.commands.deleteKey(key);
  } catch (e) {
    logger.error(`Error in deletePlayerGamePlay for key ${key} `, e);
    return false;
  }
};

async function insertPlayerGamePlay(
  playerGamePlay: playerGamePlayIf,
  tableId: string,
): Promise<boolean> {
  const key = `${REDIS.PREFIX.PLAYER_GAME_PLAY}:${playerGamePlay.userId}:${tableId}`;
  try {
    Joi.assert(playerGamePlay, playerGamePlaySchema);
    const res = await redis.commands.setValueInKeyWithExpiry(key, playerGamePlay);

    return res;
  } catch (error) {
    logger.error(`Error in insertPlayerGamePlay for key ${key} `, error);
    throw new Error(`Error in insertPlayerGamePlay for key ${key} Error :: ${error}`)
  }
}

const exportedObject = {
  getPlayerGamePlay,
  deletePlayerGamePlay,
  insertPlayerGamePlay
};
export = exportedObject;
