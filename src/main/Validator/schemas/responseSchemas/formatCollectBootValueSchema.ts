const Joi = require("joi");

const formatCollectBootValueSchema = Joi.object().keys({
  entryFee: Joi.number().required().description("entry Fee"),
  userIds: Joi.array().items(Joi.string()).required().description("User Id"),
  balanceData: Joi.array().items(Joi.object().keys({
    userId: Joi.string().required().description("User Id"),
    balance: Joi.number().required().description("balance after deduct boot value")
  }))
});

export = formatCollectBootValueSchema;
