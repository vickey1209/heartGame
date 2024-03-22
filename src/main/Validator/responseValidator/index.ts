const Joi = require("joi");
import logger from "../../logger";
import Errors from "../../errors";
import {
  formatCardDistributionSchema,
  formatCollectBootValueSchema,
  formatGameTableInfoSchema,
  formatJoinTableInfoSchema,
  formatRejoinTableInfoSchema,
  formatSingUpInfoSchema,
  formatStartUserCardPassTurnSchema,
  formatStartUserTurnSchema,
  formatUserThrowCardShowSchema,
} from "../schemas/responseSchemas";
import {
  formantUserThrowCardShowIf,
  formatCardDistributionIf,
  formatCardMoveIf,
  formatCardPassIf,
  formatCollectBootValueIf,
  formatGameTableInfoIf,
  formatJoinTableInfoIf,
  formatPreCardPassIf,
  formatRejoinTableInfoIf,
  formatShowScoreBoardIf,
  formatSingUpInfoIf,
  formatStartUserCardPassTurnIf,
  formatStartUserTurnIf,
  formatWinnerDeclareIf,
} from "../../interface/responseIf";
import formatCardPassSchema from "../schemas/responseSchemas/formatCardPassSchema";
import formatCardMoveSchema from "../schemas/responseSchemas/formatCardMoveSchema";
import formatWinnerDeclareSchema from "../schemas/responseSchemas/formatWinnerDeclareSchema";
import formatShowScoreBoardSchema from "../schemas/responseSchemas/formatShowScoreBoardSchema";
import formatPreCardPassSchema from "../schemas/responseSchemas/formatPreCardPassSchema";

async function formatSingUpInfoValidator(
  data: formatSingUpInfoIf
): Promise<formatSingUpInfoIf> {
  try {
    Joi.assert(data, formatSingUpInfoSchema);
    return data;
  } catch (error) {
    logger.error(data.userId,
      "CATCH_ERROR : formatSingUpInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatGameTableInfoValidator(
  data: formatGameTableInfoIf
): Promise<formatGameTableInfoIf> {
  try {
    Joi.assert(data, formatGameTableInfoSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatGameTableInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatJoinTableInfoValidator(
  data: formatJoinTableInfoIf
): Promise<formatJoinTableInfoIf> {
  try {
    Joi.assert(data, formatJoinTableInfoSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatJoinTableInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatCollectBootValueValidator(
  data: formatCollectBootValueIf
): Promise<formatCollectBootValueIf> {
  try {
    Joi.assert(data, formatCollectBootValueSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatCollectBootValueValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatCardDistributionValidator(
  data: formatCardDistributionIf
): Promise<formatCardDistributionIf> {
  try {
    Joi.assert(data, formatCardDistributionSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatCardDistributionValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatStartUserCardPassTurnValidator(
  data: formatStartUserCardPassTurnIf
): Promise<formatStartUserCardPassTurnIf> {
  try {
    Joi.assert(data, formatStartUserCardPassTurnSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR :: formatStartUserCardPassTurnValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatCardPassValidator(
  data: formatCardPassIf
): Promise<formatCardPassIf> {
  try {
    Joi.assert(data, formatCardPassSchema);
    return data;
  } catch (error) {
    logger.error(data.userId,
      "CATCH_ERROR : formatCardPassValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatPreCardPassValidator(
  data: formatPreCardPassIf
): Promise<formatPreCardPassIf> {
  try {
    Joi.assert(data, formatPreCardPassSchema);
    return data;
  } catch (error) {
    logger.error(data.userId,
      "CATCH_ERROR : formatPreCardPassValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatCardMoveValidator(
  data: formatCardMoveIf
): Promise<formatCardMoveIf> {
  try {
    Joi.assert(data, formatCardMoveSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatCardMoveValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatStartUserTurnValidator(
  data: formatStartUserTurnIf
): Promise<formatStartUserTurnIf> {
  try {
    Joi.assert(data, formatStartUserTurnSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatStartUserTurnValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatUserThrowCardShowValidator(
  data: formantUserThrowCardShowIf
): Promise<formantUserThrowCardShowIf> {
  try {
    Joi.assert(data, formatUserThrowCardShowSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatUserThrowCardShowValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}


async function formatRejoinTableInfoValidator(
  data: formatRejoinTableInfoIf
): Promise<formatRejoinTableInfoIf> {
  try {
    Joi.assert(data, formatRejoinTableInfoSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatRejoinTableInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatWinnerDeclareValidator(
  data: formatWinnerDeclareIf
): Promise<formatWinnerDeclareIf> {
  try {
    Joi.assert(data, formatWinnerDeclareSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatWinnerDeclareValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatShowScoreBoardValidator(
  data: formatShowScoreBoardIf
): Promise<formatShowScoreBoardIf> {
  try {
    Joi.assert(data, formatShowScoreBoardSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatShowScoreBoardValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}


const exportObject = {
  formatSingUpInfoValidator,
  formatGameTableInfoValidator,
  formatJoinTableInfoValidator,
  formatCollectBootValueValidator,
  formatCardDistributionValidator,
  formatStartUserCardPassTurnValidator,
  formatCardPassValidator,
  formatPreCardPassValidator,
  formatCardMoveValidator,
  formatStartUserTurnValidator,
  formatUserThrowCardShowValidator,
  formatRejoinTableInfoValidator,
  formatWinnerDeclareValidator,
  formatShowScoreBoardValidator,
  
};
export = exportObject;
