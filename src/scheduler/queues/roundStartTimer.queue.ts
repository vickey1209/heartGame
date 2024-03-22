import logger from "../../main/logger";
import QueueBaseClass from "./queueBaseClass";
import Errors from "../../main/errors";
import { roundStartTimerIf } from "../../main/interface/schedulerIf";
import { schedulerValidator } from "../../main/Validator";
import roundStartTimerProcess from "../processes/roundStartTimer.process";

class RoundStartTimerQueue extends QueueBaseClass {
  constructor() {
    super("RoundStartTimerQueue");
    this.queue.process(roundStartTimerProcess);
  }
  roundStartTimerQueue = async (data: roundStartTimerIf) => {
    try {
      data = await schedulerValidator.roundStartTimerSchedulerValidator(data);
      logger.info(" RoundStartTimerQueue :: data :: ----->>", data);

      const queueOption = {
        delay: data.timer, // in ms
        jobId: `roundStartTimer:${data.tableId}`,
        removeOnComplete: true,
      };

      logger.info("---------------------------------------------");
      logger.info(" RoundStartTimer --------->>>", queueOption);
      logger.info("---------------------------------------------");

      await this.queue.add(data, queueOption);
    } catch (error) {
      logger.error("RoundStartTimerQueue :: ERROR ::----->>>", error);
      if (error instanceof Errors.CancelBattle) {
        throw new Errors.CancelBattle(error);
      } else {
        throw error;
      }
    }
  };
}

export = new RoundStartTimerQueue().roundStartTimerQueue;
