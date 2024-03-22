import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { cardsChangeTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import cardsChangeTimerProcess from "../processes/cardsChangeTimer.process";

class CardsChangeTimerQueue extends QueueBaseClass {

    constructor() {
        super("CardsChangeTimerQueue");
        this.queue.process(cardsChangeTimerProcess);
    }
    cardsChangeTimerQueue = async (data: cardsChangeTimerIf) => {
        try {

            data = await schedulerValidator.cardsChangeTimerSchedulerValidator(data);
            logger.info(" CardsChangeTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: `cardsChangeTimerQueue:${data.tableId}`,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' CardsChangeTimerQueue --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("CardsChangeTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new CardsChangeTimerQueue().cardsChangeTimerQueue;