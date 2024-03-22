import Joi from "joi";

const formatSingUpInfoSchema = Joi.object().keys({
  _id: Joi.string().required().description("user Object Id"),
  userId: Joi.string().required().description("user Id"),
  name: Joi.string().required().allow("").description("user Name"),
  pp : Joi.string().required().description("profile Pic"),
  balance: Joi.number().required().allow(null).description("User Balance"),
});

export = formatSingUpInfoSchema;
