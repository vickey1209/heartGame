import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { playerTurnTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import playerTurnTimerProcess from "../processes/playerTurnTimer.process";

class PlayerTurnTimerQueue extends QueueBaseClass {

    constructor() {
        super("PlayerTurnTimerQueue");
        this.queue.process(playerTurnTimerProcess)
    }
    playerTurnTimerQueue = async (data: playerTurnTimerIf) => {
        try {

            data = await schedulerValidator.playerTurnTimerSchedulerValidator(data);
            logger.info(" PlayerTurnTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: data.jobId,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' PlayerTurnTimerQueue --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("PlayerTurnTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            } else {
                throw error;
            }
        }
    }
}

export = new PlayerTurnTimerQueue().playerTurnTimerQueue;