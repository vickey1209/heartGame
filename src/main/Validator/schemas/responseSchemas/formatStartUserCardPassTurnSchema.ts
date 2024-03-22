import caedPassPlayersSchema from "../methodSchemas/caedPassPlayersSchema";

import Joi from "joi";

const formatStartUserCardPassTurnSchema = Joi.object().keys({
    cardPassPlayersData: Joi.array().items(caedPassPlayersSchema).required().description("card Pass Players"),
    time: Joi.number().required().description("time"),
    cardMoveSide : Joi.string().required().description("cardMoveSide"),
    currentRound : Joi.number().required().description("currentRound"),
});

export = formatStartUserCardPassTurnSchema;