import { NUMERICAL } from "./constants";

require("dotenv").config();

const processEnv = process.env;
let configData: any = null;

function getEnvJSON(env: any) {
  const NODE_ENV = `NODE_ENV`;
  const serverPort = `HTTP_SERVER_PORT`;

  const HTTPS_KEY = `HTTPS_KEY`;
  const HTTPS_CERT = `HTTPS_CERT`;

  const redisHost = `REDIS_HOST`;
  const redisPassword = `REDIS_PASSWORD`;
  const redisPort = `REDIS_PORT`;
  const redisDB = `REDIS_DB`;

  const schedulerRedisHost = `SCHEDULER_REDIS_HOST`;
  const schedulerRedisPassword = `SCHEDULER_REDIS_PASSWORD`;
  const schedulerRedisPort = `SCHEDULER_REDIS_PORT`;

  const pubSubRedisHost = `PUBSUB_REDIS_HOST`;
  const pubSubRedisPassword = `PUBSUB_REDIS_PASSWORD`;
  const pubSubRedisPort = `PUBSUB_REDIS_PORT`;

  return Object.freeze({
    NODE_ENV: processEnv[NODE_ENV],
    HTTP_SERVER_PORT: processEnv[serverPort],

    REDIS_HOST: processEnv[redisHost],
    REDIS_PASSWORD: processEnv[redisPassword],
    REDIS_PORT: processEnv[redisPort],
    REDIS_DB: processEnv[redisDB],

    HTTPS_KEY: processEnv[HTTPS_KEY],
    HTTPS_CERT: processEnv[HTTPS_CERT],

    SCHEDULER_REDIS_HOST: processEnv[schedulerRedisHost],
    SCHEDULER_REDIS_PASSWORD: processEnv[schedulerRedisPassword],
    SCHEDULER_REDIS_PORT: processEnv[schedulerRedisPort],

    PUBSUB_REDIS_HOST: processEnv[pubSubRedisHost],
    PUBSUB_REDIS_PASSWORD: processEnv[pubSubRedisPassword],
    PUBSUB_REDIS_PORT: processEnv[pubSubRedisPort],

    //all wait timer
    GAME_START_TIMER: 10,
    GAME_TURN_TIMER: 10,
    IS_CLOCKWISE_TURN: true,
    TIME_OUT_COUNT: NUMERICAL.TWO,
    PENLETY_POINT: 1,
  });
}

function getConfig() {
  const { NODE_ENV } = process.env;

  configData = getEnvJSON(NODE_ENV);
  // console.log(`start ${NODE_ENV} server`);

  return configData;
}

const exportObject = { getConfig };
export = exportObject;
