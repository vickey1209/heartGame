import Joi from "joi";

const formatCardMoveSchema = Joi.object().keys({
    playersCards: Joi.array().items(
        Joi.object().keys({
            cards: Joi.array().items(Joi.object().keys({
                card: Joi.string().required().description("card"),
                isAlready: Joi.boolean().required().description("isAlready"),
            })).required().description("cards"),
            userId: Joi.string().required().description("userId"),
            userSI: Joi.number().required().description("userId"),
            destinationSI: Joi.number().required().description("destinationSI"),
        }).description("user details")
    ).required().description("playersCards"),

});

export = formatCardMoveSchema;