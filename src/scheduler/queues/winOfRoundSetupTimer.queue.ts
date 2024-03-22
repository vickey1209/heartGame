import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { winOfRoundSetupTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import winOfRoundSetupTimerProcess from "../processes/winOfRoundSetupTimer.process";

class WinOfRoundSetupTimerQueue extends QueueBaseClass {

    constructor() {
        super("WinOfRoundSetupTimerQueue");
        this.queue.process(winOfRoundSetupTimerProcess)
    }
    winOfRoundSetupTimerQueue = async (data: winOfRoundSetupTimerIf) => {
        try {

            data = await schedulerValidator.winOfRoundSetupTimerSchedulerValidator(data);
            logger.info(" WinOfRoundSetupTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: data.jobId,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' WinOfRoundSetupTimerQueue --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("WinOfRoundSetupTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new WinOfRoundSetupTimerQueue().winOfRoundSetupTimerQueue;