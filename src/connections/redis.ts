import { createClient } from 'redis';
import { getConfig } from "../config";
import Redis from '../main/redis';
import logger from '../main/logger';
const Redlock = require("redlock");
import ioredis from "ioredis";

class RedisConnection {

  private redisClients: any;
  private redisPubClients: any;
  private redisSubClients: any;
  private redlock: any;

  constructor() {
  }

  redisConnect() {
    return new Promise(async (resolve, reject) => {

      const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_DB }: any = getConfig();

      let counter = 0;
      const redisConfig: {
        socket: {
          host: string,
          port: number
        },
        database: number,
        password?: string
      } = {
        socket: {
          host: String(REDIS_HOST),
          port: Number(REDIS_PORT),
        },
        database: Number(REDIS_DB),
      };

      if (REDIS_PASSWORD !== "") {
        redisConfig.password = REDIS_PASSWORD;
      }

      logger.info(' RedisConnection :: redisConfig :: ==>> ', redisConfig);

      this.redisClients = createClient(redisConfig);
      this.redisPubClients = createClient(redisConfig);
      this.redisSubClients = this.redisPubClients.duplicate()

      async function check(this: any) {
        if (counter === 2) {
          Redis.init(this.redisClients);
          // const flushDB = await this.redisClients.flushDb();
          // logger.info('redis data :: FLUSHDB :: =>>>', flushDB);

          resolve("")
        }
      }

      this.redisClients.on('ready', () => {
        logger.info('Redis connected successfully...');
        counter += 1;
        check.call(this);
      });

      this.redisClients.on('error', (error: any) => {
        console.log('CATCH_ERROR : Redis Client error:', error)
        logger.error('CATCH_ERROR : Redis Client error:', error);
        reject(error);
      });

      this.redisPubClients.on('ready', () => {
        logger.info('pubClient connected successfully...');
        counter += 1;
        check.call(this);
      });

      this.redisPubClients.on('error', (error: any) => {
        console.log('CATCH_ERROR : Redis Pub Client error:', error)
        logger.error('CATCH_ERROR : pubClient Client error:', error);
        reject(error);
      });

      await this.redisClients.connect();
      await this.redisPubClients.connect();
      await this.redisSubClients.connect()

    })
  }

  // initialize Red lock
  initializeRedlock() {
    if (this.redlock) return this.redlock;

    const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, REDIS_DB }: any = getConfig();

    const ioRedis = new ioredis({
      host : REDIS_HOST,
      port : REDIS_PORT,
      db : REDIS_DB,
      password : REDIS_PASSWORD
    });
    
    this.redlock = new Redlock([ioRedis], {
      driftFactor: 0.01,
      retryCount: -1,
      retryDelay: 25, // time in ms
      retryJitter: 20, // time in ms
      automaticExtensionThreshold: 500, // time in ms
    });
  
    this.registerRedlockError();
    return this.redlock;
  }

  registerRedlockError() {
    this.redlock.on("CATCH_ERROR : RedLock : error", logger.error);
  }

  get redisClient() {
    return this.redisClients;
  }
  get redisSubClient() {
    return this.redisSubClients;
  }
  get redisPubClient() {
    return this.redisPubClients
  }
  get getRedLock() {
    return this.redlock;
  }
}

export const redisConnection = new RedisConnection();

