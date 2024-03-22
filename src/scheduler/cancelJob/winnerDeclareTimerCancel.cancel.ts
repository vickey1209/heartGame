import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class WinnerDeclareTimerCancel extends QueueBaseClass {
    constructor() {
        super("WinnerDeclareTimerQueue");
    }

    winnerDeclareTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> WinnerDeclareTimerCancel :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> WinnerDeclareTimerCancel :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> WinnerDeclareTimerCancel :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> WinnerDeclareTimerCancel :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : WinnerDeclareTimerCancel --:', jobId, error);
        }
    }
}

export = new WinnerDeclareTimerCancel().winnerDeclareTimerCancel;