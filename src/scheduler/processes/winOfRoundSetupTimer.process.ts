import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import commonEventEmitter from "../../main/commonEventEmitter";

async function winOfRoundSetupTimerProcess(job: any) {
    try {
        logger.info("---->> winOfRoundSetupTimerProcess :: JOB ::", job)
        logger.info("---->> winOfRoundSetupTimerProcess :: Job Data ::", job.data)

        commonEventEmitter.emit(EVENT_EMITTER.WIN_OF_ROUND_TIMER, job.data)
    } catch (error) {
        logger.error("win Of Round Setup Timer Process :: ERROR ::", error);
        return undefined;
    }
}

export = winOfRoundSetupTimerProcess;