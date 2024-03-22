import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class RoundStartTimerCancel extends QueueBaseClass {
    constructor() {
        super("RoundStartTimerQueue");
    }

    roundStartTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> RoundStartTimerCancel :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> RoundStartTimerCancel :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> RoundStartTimerCancel :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> RoundStartTimerCancel :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : RoundStartTimerCancel --:', jobId, error);
        }
    }
}

export = new RoundStartTimerCancel().roundStartTimerCancel;