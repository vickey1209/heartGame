import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { winnerDeclareTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import winnerDeclareTimerProcess from "../processes/winnerDeclareTimer.process";

class WinnerDeclareTimerQueue extends QueueBaseClass {

    constructor() {
        super("WinnerDeclareTimerQueue");
        this.queue.process(winnerDeclareTimerProcess)
    }
    winnerDeclareTimerQueue = async (data: winnerDeclareTimerIf) => {
        try {

            data = await schedulerValidator.winnerDeclareTimerSchedulerValidator(data);
            logger.info(" WinnerDeclareTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: data.jobId,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' WinnerDeclareTimerQueue --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("WinnerDeclareTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new WinnerDeclareTimerQueue().winnerDeclareTimerQueue;