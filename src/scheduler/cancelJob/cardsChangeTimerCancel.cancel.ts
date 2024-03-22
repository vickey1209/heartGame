import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class CardsChangeTimerCancel extends QueueBaseClass {
    constructor() {
        super("CardsChangeTimerQueue");
    }

    cardsChangeTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> CardsChangeTimerCancel :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> CardsChangeTimerCancel :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> CardsChangeTimerCancel :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> CardsChangeTimerCancel :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : CardsChangeTimerCancel --:', jobId, error);
        }
    }
}

export = new CardsChangeTimerCancel().cardsChangeTimerCancel;