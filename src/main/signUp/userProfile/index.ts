import logger from '../../logger';
import { PREFIX } from '../../../constants/redis';
import REDIS from '../../redis';

async function getUserByObjectId(tableId: string, userId: number) {
  const key = `${PREFIX.PLAYER}:${userId}:${tableId}`;
  logger.debug(key, 'getUser key');
  let playerData = await REDIS.commands.getValueFromKey(key);
  if (!playerData) {
    const keyForUser = `${PREFIX.USER}:${userId}`;
    playerData = await REDIS.commands.getValueFromKey(keyForUser);

    // caching the result
    REDIS.commands.setValueInKey(key, playerData);
  }
  return playerData;
}
const exportObject = {
  getUserByObjectId,
};
export = exportObject;
