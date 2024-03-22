import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { initialCardPassTurnSetupTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import initialCardPassTurnSetupTimerProcess from "../processes/initialCardPassTurnSetupTimer.process";

class InitialCardPassTurnSetupTimerQueue extends QueueBaseClass {

    constructor() {
        super("InitialCardPassTurnSetupTimerQueue");
        this.queue.process(initialCardPassTurnSetupTimerProcess)
    }
    initialCardPassTurnSetupTimerQueue = async (data: initialCardPassTurnSetupTimerIf) => {
        try {

            data = await schedulerValidator.initialCardPassTurnSetupTimerSchedulerValidator(data);
            logger.info(" InitialCardPassTurnSetupTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: `initialCardPassTurnSetupTimer:${data.tableId}`,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info('InitialCardPassTurnSetupTimer --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("InitialCardPassTurnSetupTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new InitialCardPassTurnSetupTimerQueue().initialCardPassTurnSetupTimerQueue;