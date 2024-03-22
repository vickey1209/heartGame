import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import CommonEventEmitter from "../../main/commonEventEmitter";

async function initialUserTurnTimerProcess(job: any) {
    try {
        logger.info("------->> initialUserTurnTimerProcess :: JOB :: ", job)
        logger.info("------->> initialUserTurnTimerProcess :: Job Data :: ", job.data)

        CommonEventEmitter.emit(EVENT_EMITTER.INITIAL_USER_TURN_TIMER_EXPIRED, job.data);
    } catch (error) {
        logger.error("initial User Turn Timer Process :: ERROR :: ", error);
        return undefined;
    }
}

export = initialUserTurnTimerProcess;