import Joi from "joi";
import logger from "../../logger";
import { REDIS } from "../../../constants";
import { tableGamePlaySchema } from "../../Validator/schemas/methodSchemas";
import redis from "../../redis";
import { tableGamePlayIf } from "../../interface/tableGamePlay";

async function getTableGamePlay(
  tableId: string
): Promise<tableGamePlayIf | null> {
  const key = `${REDIS.PREFIX.TABLE_GAME_PLAY}:${tableId}`;
  try {
    const tableGamePlay = await redis.commands.getValueFromKey(key);
    if (tableGamePlay) Joi.assert(tableGamePlay, tableGamePlaySchema);

    return tableGamePlay;
  } catch (error) {
    logger.error(
      tableId,
      `Error in getTableGamePlay for tableId ${tableId} and currentRound `,
      error
    );
    throw new Error("Error in getTableGamePlay for tableId" + error);
  }
}

async function insertTableGamePlay(
  tableGamePlay: tableGamePlayIf,
  tableId: string
): Promise<boolean> {
  const key = `${REDIS.PREFIX.TABLE_GAME_PLAY}:${tableId}`;
  try {
    Joi.assert(tableGamePlay, tableGamePlaySchema);
    const res = await redis.commands.setValueInKeyWithExpiry(
      key,
      tableGamePlay
    );
    return res;
  } catch (error) {
    logger.error(
      tableId,
      `Error in insertTableGamePlay for tableId ${tableId} `,
      error
    );
    throw new Error("Error in insertTableGamePlay for tableId " + error);
  }
}

const deleteTableGamePlay = async (tableId: string): Promise<boolean> => {
  const key = `${REDIS.PREFIX.TABLE_GAME_PLAY}:${tableId}`;
  try {
    return redis.commands.deleteKey(key);
  } catch (e) {
    logger.error(tableId, `Error in deleteTableGamePlay for key ${key} `, e);
    return false;
  }
};

const exportObj = {
  getTableGamePlay,
  deleteTableGamePlay,
  insertTableGamePlay,
};

export = exportObj;
