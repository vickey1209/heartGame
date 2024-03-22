const Joi = require('joi');
import logger from '../../logger';
import Errors from '../../errors';
import { cardsChangeTimerSchedulerSchema, initialCardPassTurnSetupTimerSchedulerSchema, initialUserTurnTimerSchedulerSchema, initializeGameplaySchedulerSchema, playersCardPassTurnTimerSchedulerSchema, roundStartTimerSchedulerSchema, winOfRoundSetupTimerSchedulerSchema, winnerDeclareTimerSchedulerSchema } from '../schemas/schedulerSchemas';
import { cardsChangeTimerIf, initialCardPassTurnSetupTimerIf, initialNewRoundStartTimerIf, initialUserTurnTimerIf, initializeGameplayIf, playerTurnTimerIf, playersCardPassTurnTimerIf, roundStartTimerIf, winOfRoundSetupTimerIf, winnerDeclareTimerIf } from '../../interface/schedulerIf';
import playerTurnTimerSchedulerSchema from '../schemas/schedulerSchemas/playerTurnTimerSchedulerSchema';
import initialNewRoundStartTimerSchedulerSchema from '../schemas/schedulerSchemas/initialNewRoundStartTimerSchedulerSchema';


async function initializeGameplaySchedulerValidator(
  data: initializeGameplayIf,
): Promise<initializeGameplayIf> {
  try {
    Joi.assert(data, initializeGameplaySchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : initializeGameplaySchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function roundStartTimerSchedulerValidator(
  data: roundStartTimerIf,
): Promise<roundStartTimerIf> {
  try {
    Joi.assert(data, roundStartTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : roundStartTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function initialCardPassTurnSetupTimerSchedulerValidator(
  data: initialCardPassTurnSetupTimerIf,
): Promise<initialCardPassTurnSetupTimerIf> {
  try {
    Joi.assert(data, initialCardPassTurnSetupTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : initialCardPassTurnSetupTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function playersCardPassTurnTimerSchedulerValidator(
  data: playersCardPassTurnTimerIf,
): Promise<playersCardPassTurnTimerIf> {
  try {
    Joi.assert(data, playersCardPassTurnTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : playersCardPassTurnTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function initialUserTurnTimerSchedulerValidator(
  data: initialUserTurnTimerIf,
): Promise<initialUserTurnTimerIf> {
  try {
    Joi.assert(data, initialUserTurnTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : initialUserTurnTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function cardsChangeTimerSchedulerValidator(
  data: cardsChangeTimerIf,
): Promise<cardsChangeTimerIf> {
  try {
    Joi.assert(data, cardsChangeTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : cardsChangeTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function playerTurnTimerSchedulerValidator(
  data: playerTurnTimerIf,
): Promise<playerTurnTimerIf> {
  try {
    Joi.assert(data, playerTurnTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : playerTurnTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function winOfRoundSetupTimerSchedulerValidator(
  data: winOfRoundSetupTimerIf,
): Promise<winOfRoundSetupTimerIf> {
  try {
    Joi.assert(data, winOfRoundSetupTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : winOfRoundSetupTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function winnerDeclareTimerSchedulerValidator(
  data: winnerDeclareTimerIf,
): Promise<winnerDeclareTimerIf> {
  try {
    Joi.assert(data, winnerDeclareTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(
      'CATCH_ERROR : winnerDeclareTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function initialNewRoundStartTimerSchedulerValidator(
  data: initialNewRoundStartTimerIf,
): Promise<initialNewRoundStartTimerIf> {
  try {
    Joi.assert(data, initialNewRoundStartTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(
      'CATCH_ERROR : initialNewRoundStartTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}


const exportObject = {
  initializeGameplaySchedulerValidator,
  roundStartTimerSchedulerValidator,
  initialCardPassTurnSetupTimerSchedulerValidator,
  playersCardPassTurnTimerSchedulerValidator,
  initialUserTurnTimerSchedulerValidator,
  cardsChangeTimerSchedulerValidator,
  playerTurnTimerSchedulerValidator,
  winOfRoundSetupTimerSchedulerValidator,
  winnerDeclareTimerSchedulerValidator,
  initialNewRoundStartTimerSchedulerValidator

};

export = exportObject;
