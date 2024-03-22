import Bull from "bull";
import { getConfig } from "../../config";
import url from "url";
import logger from "../../main/logger";

class QueueBaseClass {
    public queue: any;

    constructor(queueName: string) {
        const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB} = getConfig();

        const redisConfig: {
            host: string,
            port: number,
            db: number,
            password?: string
        } = {
            host: REDIS_HOST,
            port: REDIS_PORT,
            db: REDIS_DB
        }

        if (REDIS_PASSWORD !== "") {
            redisConfig.password = REDIS_PASSWORD
        }

        logger.info(`QueueBaseClass :: redisConfig ::===>> `, redisConfig);
        this.queue = new Bull(queueName, { redis: redisConfig })

    }
}

export default QueueBaseClass;