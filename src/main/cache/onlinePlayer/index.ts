import { NUMERICAL, REDIS } from "../../../constants";
import { PREFIX } from "../../../constants/redis";
import logger from "../../logger";
import redis from "../../redis";

const setCounterIntialValue = async (onlinePlayer: string) => {
  try {
    let counter = NUMERICAL.ZERO;
    return redis.commands.setValueInKey(`${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`, counter);
  } catch (error) {
    logger.error("CATCH_ERROR : setCounterIntialValue", error)
    throw error
  }
}

const getOnliPlayerCount = async (onlinePlayer: string) => {
  try {
    const count = await redis.commands.getValueFromKey(`${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`);
    return count
  } catch (error) {
    logger.error('CATCH_ERROR :  getOnliPlayerCount', error)
  }

}

const incrCounter = async (onlinePlayer: string) => {
  try {
    return redis.commands.setIncrementCounter(`${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`);
  } catch (error) {
    logger.error("CATCH_ERROR : incrCounter", error)
    throw error
  }
}

const decrCounter = async (onlinePlayer: string) => {
  try {
    return redis.commands.setDecrementCounter(`${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`);
  } catch (error) {
    logger.error("CATCH_ERROR : decrCounter", error)
    throw error
  }
}

const setCounterIntialValueLobby = async (onlinePlayerLobby: string , lobbyId: string) => {
  try {
    let counter = NUMERICAL.ZERO;
    return redis.commands.setValueInKey(`${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`, counter);
  } catch (error) {
    logger.error("CATCH_ERROR : setCounterIntialValue", error)
    throw error
  }
}

const getOnliPlayerCountLobbyWise = async (onlinePlayerLobby: string , lobbyId: string) => {
  try {
    const count = await redis.commands.getValueFromKey(`${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`);
    
    return count
  } catch (error) {
    logger.error('CATCH_ERROR :  getOnliPlayerCount', error)
  }

}

const removeOnliPlayerCountLobbyWise = (onlinePlayerLobby: string , lobbyId: string) =>
  redis.commands.deleteKey(`${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`);

const incrCounterLobbyWise = async (onlinePlayerLobby: string , lobbyId: string) => {
  try {
    return redis.commands.setIncrementCounter(`${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`);
  } catch (error) {
    logger.error("CATCH_ERROR : incrCounterLobbyWise", error)
    throw error
  }
}

const decrCounterLobbyWise = async (onlinePlayerLobby: string , lobbyId: string) => {
  try {
    return redis.commands.setDecrementCounter(`${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`);
  } catch (error) {
    logger.error("CATCH_ERROR : decrCounterLobbyWise", error)
    throw error
  }
}

const exportedObject = { 
  decrCounter, 
  incrCounter, 
  getOnliPlayerCount, 
  getOnliPlayerCountLobbyWise, 
  setCounterIntialValue, 
  setCounterIntialValueLobby,
  removeOnliPlayerCountLobbyWise,
  incrCounterLobbyWise,
  decrCounterLobbyWise
};

export = exportedObject;
