import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { initializeGameplayIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import initializeGameplayProcess from "../processes/initializeGameplay.process";

class InitializeGameplayQueue extends QueueBaseClass {

    constructor() {
        super("InitializeGameplayQueue");
        this.queue.process(initializeGameplayProcess)
    }
    initializeGameplayQueue = async (data: initializeGameplayIf) => {
        try {

            data = await schedulerValidator.initializeGameplaySchedulerValidator(data);
            logger.info(" InitializeGameplayQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: `initializeGameplay:${data.tableId}`,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' initializeGameplay --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("InitializeGameplayQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new InitializeGameplayQueue().initializeGameplayQueue;