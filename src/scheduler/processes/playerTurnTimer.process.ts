import { EVENT_EMITTER } from "../../constants";
import logger from "../../main/logger";
import CommonEventEmitter from "../../main/commonEventEmitter";

async function playerTurnTimerProcess(job: any) {
    try {
        logger.info("------->> playerTurnTimerProcess :: JOB :: ", job)
        logger.info("------->> playerTurnTimerProcess :: Job Data :: ", job.data)

        CommonEventEmitter.emit(EVENT_EMITTER.PLAYER_TURN_TIMER_EXPIRED, job.data);
    } catch (error) {
        logger.error("player Turn Timer Process :: ERROR :: ", error);
        return undefined;
    }
}

export = playerTurnTimerProcess;