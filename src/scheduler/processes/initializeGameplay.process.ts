import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import CommonEventEmitter from "../../main/commonEventEmitter";

async function initializeGameplayProcess(job: any) {
    try {
        logger.info("---->> initializeGameplayProcess :: JOB ::", job)
        logger.info("---->> initializeGameplayProcess :: Job Data ::", job.data)

        CommonEventEmitter.emit(EVENT_EMITTER.INITIALIZE_GAME_PLAY, job.data)
    } catch (error) {
        logger.error("initialize Game play Process :: ERROR ::", error);
        return undefined;
    }
}

export = initializeGameplayProcess;