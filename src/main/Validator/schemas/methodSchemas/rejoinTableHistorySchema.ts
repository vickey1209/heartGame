const Joi = require("joi");

const rejoinTableHistorySchema = Joi.object()
  .keys({
    userId: Joi.string().required().description("user Unique Id"),
    tableId: Joi.string().required().description("table Unique Id"),
    isEndGame: Joi.boolean().required().description("user turn"),
  })
  .unknown(true);

export = rejoinTableHistorySchema;
