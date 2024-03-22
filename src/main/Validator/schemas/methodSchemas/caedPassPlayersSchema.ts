const Joi = require("joi");

const caedPassPlayersSchema = Joi.object()
  .keys({
    userId: Joi.string().description("user Unique Id"),
    si: Joi.number().description("user seat index"),
  })
  .unknown(true);

export = caedPassPlayersSchema;