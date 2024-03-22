import Joi from "joi";

const formatCardPassSchema = Joi.object().keys({
    cards: Joi.array().items(Joi.string()).required().description("card Pass Players"),
    userId: Joi.string().required().description("userId"),
    si : Joi.number().required().description("si"),
});

export = formatCardPassSchema;