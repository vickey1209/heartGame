import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import CommonEventEmitter from "../../main/commonEventEmitter";

async function playersCardPassTurnTimerProcess(job: any) {
    try {
        logger.info("---->> playersCardPassTurnTimerProcess :: JOB ::", job)
        logger.info("---->> playersCardPassTurnTimerProcess :: Job Data ::", job.data)

        CommonEventEmitter.emit(EVENT_EMITTER.CARD_PASS_TURN_TIMER_EXPIRED, job.data)
    } catch (error) {
        logger.error("players Card Pass Turn Timer Process :: ERROR ::", error);
        return undefined;
    }
}

export = playersCardPassTurnTimerProcess;