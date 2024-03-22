import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class PlayerTurnTimerCancel extends QueueBaseClass {
    constructor() {
        super("PlayerTurnTimerQueue");
    }

    playerTurnTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> PlayerTurnTimerQueue :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> PlayerTurnTimerQueue :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> PlayerTurnTimerQueue :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> PlayerTurnTimerQueue :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : PlayerTurnTimerQueue ----:', jobId, error);
        }
    }
}

export = new PlayerTurnTimerCancel().playerTurnTimerCancel;