const Joi = require('joi');
import logger from '../../logger';
import {
  cardPassRequestIf,
  cardThrowRequestIf,
  leaveTableRequestIf,
  preCardPassSelectRequestIf,
  signUpRequestIf,
} from '../../interface/requestIf';
import Errors from '../../errors';
import {
  cardPassSchema,
  leaveTableSchema,
  preCardPassSelectSchema,
  showScoreBoardSchema,
  signUpSchema,
  throwCardSchema,
} from '../schemas/requestSchemas';
import { showUserScoreIf } from '../../interface/userScoreIf';

async function signUpValidator(
  data: signUpRequestIf,
): Promise<signUpRequestIf> {
  try {
    Joi.assert(data, signUpSchema);
    return data;
  } catch (error) {
    logger.error(data.userId, 'CATCH_ERROR : signUpValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function cardPassValidator(
  data: cardPassRequestIf,
): Promise<cardPassRequestIf> {
  try {
    Joi.assert(data, cardPassSchema);
    return data;
  } catch (error) {
    logger.error(data.userId, 'CATCH_ERROR : cardPassValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function throwCardValidator(
  data: cardThrowRequestIf,
): Promise<cardThrowRequestIf> {
  try {
    Joi.assert(data, throwCardSchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : throwCardValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function leaveTableValidator(
  data: leaveTableRequestIf,
): Promise<leaveTableRequestIf> {
  try {
    Joi.assert(data, leaveTableSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId, 'CATCH_ERROR : leaveTableValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function preCardPassSelectValidator(
  data: preCardPassSelectRequestIf,
): Promise<preCardPassSelectRequestIf> {
  try {
    Joi.assert(data, preCardPassSelectSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId, 'CATCH_ERROR : preCardPassSelectValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function showScoreValidator(
  data: showUserScoreIf,
): Promise<showUserScoreIf> {
  try {
    Joi.assert(data, showScoreBoardSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId, 'CATCH_ERROR : showScoreValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}


const exportObject = {
  signUpValidator,
  cardPassValidator,
  throwCardValidator,
  leaveTableValidator,
  preCardPassSelectValidator,
  showScoreValidator

};

export = exportObject;
