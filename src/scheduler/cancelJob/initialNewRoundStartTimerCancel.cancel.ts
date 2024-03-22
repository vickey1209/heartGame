import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class InitialNewRoundStartTimerCancel extends QueueBaseClass {
    constructor() {
        super("InitialNewRoundStartTimerQueue");
    }

    initialNewRoundStartTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> initialNewRoundStartTimerCancel :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> initialNewRoundStartTimerCancel :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> initialNewRoundStartTimerCancel :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> initialNewRoundStartTimerCancel :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : initialNewRoundStartTimerCancel ----:', jobId, error);
        }
    }
}

export = new InitialNewRoundStartTimerCancel().initialNewRoundStartTimerCancel;