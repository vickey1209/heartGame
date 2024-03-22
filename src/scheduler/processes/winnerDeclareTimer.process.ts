import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import commonEventEmitter from "../../main/commonEventEmitter";

async function winnerDeclareTimerProcess(job: any) {
    try {
        logger.info("---->> winnerDeclareTimerProcess :: JOB ::", job)
        logger.info("---->> winnerDeclareTimerProcess :: Job Data ::", job.data)

        commonEventEmitter.emit(EVENT_EMITTER.WINNER_DECLARE_TIMER, job.data)
    } catch (error) {
        logger.error("winner Declare Timer Process :: ERROR ::", error);
        return undefined;
    }
}

export = winnerDeclareTimerProcess;