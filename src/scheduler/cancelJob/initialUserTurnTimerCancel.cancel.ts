import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class InitialUserTurnTimerCancel extends QueueBaseClass {
    constructor() {
        super("InitialUserTurnTimerQueue");
    }

    initialUserTurnTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> InitialUserTurnTimerQueue :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> InitialUserTurnTimerQueue :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> InitialUserTurnTimerQueue :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> InitialUserTurnTimerQueue :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : InitialUserTurnTimerQueue --:', jobId, error);
        }
    }
}

export = new InitialUserTurnTimerCancel().initialUserTurnTimerCancel;