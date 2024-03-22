import Joi from 'joi';
import logger from "../../logger"
import { NUMERICAL, REDIS } from '../../../constants';
import redis from '../../redis';
import { userIf } from '../../interface/user';
import { userDetailSchema } from '../../Validator/schemas/methodSchemas';

const insertUserProfile = async (
  userId: string,
  obj: userIf
): Promise<boolean> => {
  const key = `${REDIS.PREFIX.USER}:${userId}`;
  try {
    Joi.assert(obj, userDetailSchema);
    const ttlTime = NUMERICAL.ONE_HOUR * NUMERICAL.THREE;
    await redis.commands.setValueInKeyWithExpiry(key, obj, ttlTime);
    return true;

  } catch (error) {
    logger.error(userId,
      `Error in setUserProfile for key ${key} and object ${JSON.stringify(obj)}`,
      error
    );
    throw new Error("set value key error")
  }
};

const getUserProfile = async (
  userId: string
): Promise<userIf | null> => {
  const key = `${REDIS.PREFIX.USER}:${userId}`;
  try {
    const userProfile = await redis.commands.getValueFromKey(key);
    if (userProfile) Joi.assert(userProfile, userDetailSchema);
    return userProfile;
  } catch (error) {
    logger.error(userId, `Error in getUserProfile for key ${key}`, error);
    throw new Error("set value key error")

  }
};

const deleteUserProfile = async (userId: string): Promise<boolean> => {
  const key = `${REDIS.PREFIX.USER}:${userId}`;
  try {
    return redis.commands.deleteKey(key);
  } catch (e) {
    logger.error(userId, `Error in deleteUserProfile for key ${key} `, e);
    return false;
  }
};

const exportedObject = {
  insertUserProfile,
  getUserProfile,
  deleteUserProfile
};

export = exportedObject;