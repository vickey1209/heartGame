import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class WinOfRoundSetupTimerCancel extends QueueBaseClass {
    constructor() {
        super("WinOfRoundSetupTimerQueue");
    }

    winOfRoundSetupTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> winOfRoundSetupTimerCancel :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> winOfRoundSetupTimerCancel :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("=========>> winOfRoundSetupTimerCancel :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("=========>> winOfRoundSetupTimerCancel :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR :: winOfRoundSetupTimerCancel --:', jobId, error);
        }
    }
}

export = new WinOfRoundSetupTimerCancel().winOfRoundSetupTimerCancel;