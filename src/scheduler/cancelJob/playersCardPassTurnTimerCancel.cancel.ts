import logger from "../../main/logger";
import QueueBaseClass from "../queues/queueBaseClass";

class PlayersCardPassTurnTimerCancel extends QueueBaseClass {
    constructor() {
        super("PlayersCardPassTurnTimerQueue");
    }

    playersCardPassTurnTimerCancel = async (jobId: any) => {
        try {
            const jobData = await this.queue.getJob(jobId)
            logger.debug('------>> PlayersCardPassTurnTimerCancel :: JOB CANCELLED  :: JOB ID:" ---- ', jobId);
            logger.debug('------>> PlayersCardPassTurnTimerCancel :: JOB CANCELLED :: JOB ID:" job ---- ', jobData);
            if (jobData !== null) {
                logger.info("===========>> PlayersCardPassTurnTimerCancel :: JOB AVAILABLE :: ");
                await jobData.remove();
            } else {
                logger.info("===========>> PlayersCardPassTurnTimerCancel :: JOB NOT AVAILABLE :: ");
            }

            return jobData;
        } catch (error) {
            logger.error('CATCH_ERROR : PlayersCardPassTurnTimerCancel --:', jobId, error);
        }
    }
}

export = new PlayersCardPassTurnTimerCancel().playersCardPassTurnTimerCancel;