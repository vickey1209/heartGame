const Joi = require("joi");

const seatsSchema = Joi.object()
  .keys({
    userId: Joi.string().description("user Unique Id"),
    si: Joi.number().description("user seat index"),
    name: Joi.string().allow("").description("user name"),
    pp: Joi.string().allow("").description("user profile pic"),
    userState: Joi.string().allow("").description("user state"),
  })
  .unknown(true);

export = seatsSchema;
