import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors"
import { playersCardPassTurnTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import playersCardPassTurnTimerProcess from "../processes/playersCardPassTurnTimer.process";

class PlayersCardPassTurnTimerQueue extends QueueBaseClass {

    constructor() {
        super("PlayersCardPassTurnTimerQueue");
        this.queue.process(playersCardPassTurnTimerProcess)
    }
    playersCardPassTurnTimerQueue = async (data: playersCardPassTurnTimerIf) => {
        try {

            data = await schedulerValidator.playersCardPassTurnTimerSchedulerValidator(data);
            logger.info(" PlayersCardPassTurnTimerQueue :: data :: ----->>", data)

            const queueOption = {
                delay: data.timer, // in ms
                jobId: `playersCardPassTurnTimer:${data.tableId}`,
                removeOnComplete: true,
            };

            logger.info('---------------------------------------------');
            logger.info(' PlayersCardPassTurnTimer --------->>>', queueOption);
            logger.info('---------------------------------------------');

            await this.queue.add(data, queueOption);

        } catch (error) {
            logger.error("PlayersCardPassTurnTimerQueue :: ERROR ::----->>>", error);
            if (error instanceof Errors.CancelBattle) {
                throw new Errors.CancelBattle(error);
            }else{
                throw error;
            }
        }
    }
}

export = new PlayersCardPassTurnTimerQueue().playersCardPassTurnTimerQueue;