import Joi from "joi";

const formatPreCardPassSchema = Joi.object().keys({
    passCards: Joi.array().items(Joi.string()).required().description("pass Cards Players"),
    card : Joi.string().required().description("card"),
    forwardCardMove: Joi.boolean().required().description("forward Card Move"),
    userId: Joi.string().required().description("userId"),
    si : Joi.number().required().description("si"),
});

export = formatPreCardPassSchema;