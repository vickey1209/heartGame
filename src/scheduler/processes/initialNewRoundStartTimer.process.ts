import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import commonEventEmitter from "../../main/commonEventEmitter";

async function initialNewRoundStartTimerProcess(job: any) {
    try {
        logger.info("---->> initialNewRoundStartTimerProcess :: JOB ::", job)
        logger.info("---->> initialNewRoundStartTimerProcess :: Job Data ::", job.data)

        commonEventEmitter.emit(EVENT_EMITTER.START_NEW_ROUND_TIMER, job.data)
    } catch (error) {
        logger.error("initial New Round Start Timer Process :: ERROR ::", error);
        return undefined;
    }
}

export = initialNewRoundStartTimerProcess;