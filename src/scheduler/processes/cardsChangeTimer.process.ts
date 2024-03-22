import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import commonEventEmitter from "../../main/commonEventEmitter";

async function cardsChangeTimerProcess(job: any) {
    try {
        logger.info("------->> cardsChangeTimeProcess :: JOB :: ", job)
        logger.info("------->> cardsChangeTimeProcess :: Job Data :: ", job.data)

        commonEventEmitter.emit(EVENT_EMITTER.CARD_CHANGE_TIMER_EXPIRED, job.data);
    } catch (error) {
        logger.error(" cards Change Time Process :: ERROR :: ", error);
        return undefined;
    }
}

export = cardsChangeTimerProcess;