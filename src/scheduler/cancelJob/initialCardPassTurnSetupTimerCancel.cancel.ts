import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class InitialCardPassTurnSetupTimerCancel extends QueueBaseClass {
    constructor() {
        super("InitialCardPassTurnSetupTimerQueue");
    }

    initialCardPassTurnSetupTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> InitialCardPassTurnSetupTimerCancel :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> InitialCardPassTurnSetupTimerCancel :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> InitialCardPassTurnSetupTimerCancel :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> InitialCardPassTurnSetupTimerCancel :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : InitialCardPassTurnSetupTimerCancel --:', jobId, error);
        }
    }
}

export = new InitialCardPassTurnSetupTimerCancel().initialCardPassTurnSetupTimerCancel;