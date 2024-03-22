import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import CommonEventEmitter from "../../main/commonEventEmitter";

async function initialCardPassTurnSetupTimerProcess(job: any) {
    try {
        logger.info("------->> initialCardPassTurnSetupTimerProcess :: JOB :: ", job)
        logger.info("------->> initialCardPassTurnSetupTimerProcess :: Job Data :: ", job.data)

        CommonEventEmitter.emit(EVENT_EMITTER.INITIAL_CARD_PASS_TURN_TIMER_EXPIRED, job.data)
    } catch (error) {
        logger.error("initial Card Pass Turn Setup Timer Process :: ERROR :: ", error);
        return undefined;
    }
}

export = initialCardPassTurnSetupTimerProcess;