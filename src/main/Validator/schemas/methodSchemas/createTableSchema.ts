// const Joi = require("joi");
import Joi from "joi";

const createTableSchema = Joi.object()
  .keys({
    userId : Joi.string().required().description("userId"),
    gameType: Joi.string().required().description("Game Type"),
    lobbyId: Joi.string().allow("").description("lobby id"),
    gameId: Joi.string().required().description("game id"),
    gameStartTimer: Joi.number().required().description("Game start Timer"),
    userTurnTimer: Joi.number().required().description("User Turn Timer"),
    entryFee: Joi.number().required().description("Boot Ammount Of Playing"),
    winningAmount : Joi.string().required().description("winningAmount"),
    minPlayer : Joi.number().required().description("min Player"),
    noOfPlayer : Joi.number().required().description("no Of Player "),
    isUseBot : Joi.boolean().required().description("isUseBot"),
  })
  .unknown(true);

export = createTableSchema;
