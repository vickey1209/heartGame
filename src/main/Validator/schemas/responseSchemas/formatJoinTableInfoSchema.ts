import seatsSchema from "../methodSchemas/seatsSchema";

import Joi from "joi";

const formatJoinTableInfoSchema = Joi.object().keys({
  totalPlayers: Joi.number().required().description("total Player"),
  tableId : Joi.string().required().description("tableId"),
  seats: Joi.array().items(seatsSchema).required().description("seats")
});

export = formatJoinTableInfoSchema;
