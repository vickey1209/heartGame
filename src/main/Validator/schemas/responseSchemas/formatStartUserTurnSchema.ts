import Joi from "joi";

const formatStartUserTurnSchema = Joi.object().keys({
  tableId : Joi.string().required().description("tableId"),
  currentRound: Joi.number().required().allow().description("current Round"),
  currentTurnUserId: Joi.string().required().description("current Turn User Id"),
  currentTurnSI: Joi.number().required().allow().description("current Turn SI"),
  userTurnTimer: Joi.number().required().allow().description("user Turn Timer"),
  isBreakingHearts : Joi.boolean().required().allow().description("is Breaking Hearts"),
  turnCardSequence : Joi.string().required().description("turn Card Sequence"),
  turnCurrentCards : Joi.array().items(Joi.string()).required().description("turn Current Cards"),
});

export = formatStartUserTurnSchema;
