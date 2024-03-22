import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { initialUserTurnTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import initialUserTurnTimerProcess from "../processes/initialUserTurnTimer.process";

class InitialUserTurnTimerQueue extends QueueBaseClass {

    constructor() {
        super("InitialUserTurnTimerQueue");
        this.queue.process(initialUserTurnTimerProcess)
    }
    initialUserTurnTimerQueue = async (data: initialUserTurnTimerIf) => {
        try {

            data = await schedulerValidator.initialUserTurnTimerSchedulerValidator(data);
            logger.info(" InitialUserTurnTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: `initialUserTurnTimerQueue:${data.tableId}`,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' InitialUserTurnTimerQueue --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("InitialUserTurnTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new InitialUserTurnTimerQueue().initialUserTurnTimerQueue;