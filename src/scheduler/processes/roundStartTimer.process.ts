import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import CommonEventEmitter from "../../main/commonEventEmitter";

async function roundStartTimerProcess(job: any) {
    try {
        logger.info("---->> roundStartTimerProcess :: JOB ::", job)
        logger.info("---->> roundStartTimerProcess :: Job Data ::", job.data)

        CommonEventEmitter.emit(EVENT_EMITTER.ROUND_STARTED, job.data)
    } catch (error) {
        logger.error("round Start Timer Process :: ERROR ::", error);
        return undefined;
    }
}

export = roundStartTimerProcess;