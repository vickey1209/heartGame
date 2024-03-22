import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { schedulerValidator } from "../../main/Validator";
import { initialNewRoundStartTimerIf } from "../../main/interface/schedulerIf";
import initialNewRoundStartTimerProcess from "../processes/initialNewRoundStartTimer.process";

class InitialNewRoundStartTimerQueue extends QueueBaseClass {

    constructor() {
        super("InitialNewRoundStartTimerQueue");
        this.queue.process(initialNewRoundStartTimerProcess)
    }
    initialNewRoundStartTimerQueue = async (data: initialNewRoundStartTimerIf) => {
        try {

            data = await schedulerValidator.initialNewRoundStartTimerSchedulerValidator(data);
            logger.info(" InitialNewRoundStartTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: `initialNewRoundStartTimerQueue:${data.tableId}`,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' InitialNewRoundStartTimerQueue --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("InitialNewRoundStartTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new InitialNewRoundStartTimerQueue().initialNewRoundStartTimerQueue;