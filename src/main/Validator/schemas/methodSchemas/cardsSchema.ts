const Joi = require("joi");

const cardsSchema = Joi.object()
  .keys({
    card: Joi.string().description("card"),
    index: Joi.number().description("card index"),
  })
  .unknown(true);

export = cardsSchema;