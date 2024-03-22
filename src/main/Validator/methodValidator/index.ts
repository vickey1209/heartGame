const Joi = require("joi");
import logger from "../../logger";
import { userIf } from "../../interface/user";
import Errors from "../../errors";
import {
  createTableSchema,
  userDetailSchema,
  playerGamePlaySchema,
  rejoinTableHistorySchema,
  tableGamePlaySchema,
  distributeCardsSchema,
  roundTablePlaySchema,
  checkWinnerSchema,
} from "../schemas/methodSchemas";
import {
  tableGamePlayIf,
  RejoinTableHistoryIf,
  defaultTableGamePlayIf,
} from "../../interface/tableGamePlay";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { userScoreIf } from "../../interface/userScoreIf";

async function userDetailValidator(data: userIf): Promise<userIf> {
  try {
    Joi.assert(data, userDetailSchema);
    return data;
  } catch (error) {
    logger.error(data._id, "CATCH_ERROR : userDetailValidator :: ", error, "-", data);
    throw new Errors.InvalidInput(error);
  }
}

async function createTableValidator(
  data: defaultTableGamePlayIf
): Promise<defaultTableGamePlayIf> {
  try {
    Joi.assert(data, createTableSchema);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : createTableValidator :: ", error, "-", data);
    throw new Errors.InvalidInput(error);
  }
}

async function playerGamePlayValidator(
  data: playerGamePlayIf
): Promise<playerGamePlayIf> {
  try {
    Joi.assert(data, playerGamePlaySchema);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : playerGamePlayValidator :: ", error, "-", data);
    throw new Errors.CancelBattle(error);
  }
}


async function tableGamePlayValidator(
  data: tableGamePlayIf
): Promise<tableGamePlayIf> {
  try {
    Joi.assert(data, tableGamePlaySchema);
    return data;
  } catch (error) {
    logger.error(data._id, "CATCH_ERROR : tableGamePlayValidator :: ", error, "-", data);
    throw new Errors.CancelBattle(error);
  }
}

async function roundTablePlayValidator(
  data: roundTablePlayIf
): Promise<roundTablePlayIf> {
  try {
    Joi.assert(data, roundTablePlaySchema);
    return data;
  } catch (error) {
    logger.error(data._id, "CATCH_ERROR : roundTablePlayValidator :: ", error, "-", data);
    throw new Errors.CancelBattle(error);
  }
}

async function distributeCardsValidator(
  data: playerGamePlayIf[]
): Promise<playerGamePlayIf[]> {
  try {
    Joi.assert(data, distributeCardsSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : distributeCardsValidator :: ",
      error,
      "-",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function checkWinnerValidator(
  data: userScoreIf[]
): Promise<userScoreIf[]> {
  try {
    Joi.assert(data, checkWinnerSchema);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : checkWinnerValidator :: ", error, "-", data);
    throw new Errors.CancelBattle(error);
  }
}


async function rejoinTableHistoryValidator(
  data: RejoinTableHistoryIf
): Promise<RejoinTableHistoryIf> {
  try {
    Joi.assert(data, rejoinTableHistorySchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      "CATCH_ERROR : rejoinTableHistoryValidator :: ",
      error,
      "-",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

const exportObject = {
  userDetailValidator,
  createTableValidator,
  playerGamePlayValidator,
  tableGamePlayValidator,
  roundTablePlayValidator,
  distributeCardsValidator,
  checkWinnerValidator,
  rejoinTableHistoryValidator
};
export = exportObject;
