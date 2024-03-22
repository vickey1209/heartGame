const Joi = require("joi");
import seatsSchema from "./seatsSchema";

const roundTablePlaySchema = Joi.object()
  .keys({
    _id: Joi.string().required().description("Round Unique Id"),
    tableId: Joi.string().required().description("Table Unique Id"),
    tableState: Joi.string().required().description("Game Status"),
    currentPlayerInTable: Joi.number().required().description("current Player In Table"),
    totalPlayers: Joi.number().required().description("Player Count"),
    currentRound: Joi.number().required().description("Round Number"),
    totalHands: Joi.number().required().description("Number of Hands"),
    seats: Joi.array().items(seatsSchema).default([]).required().description('seats'),
    currentTurn: Joi.string().allow(null).description("current Turn"),
    tableCurrentTimer: Joi.date()
      .required()
      .allow(null)
      .description("Turn Timer"),
    cardPassTurn: Joi.boolean().required().description("card turn turn completed or not"),
    turnCurrentCards: Joi.array().required().description("Turn Card"),
    turnCardSequence: Joi.string().required().description("turn Sequence Card"),
    isBreakingHearts: Joi.boolean().allow(null).description("is Breaking Hearts"),
    lastInitiater: Joi.string()
      .required()
      .allow(null)
      .description("first throw card user id"),
    hands: Joi.array().required().description("Turn Cards"),
    turnCount: Joi.number().required().description("Total Turn Count"),
    handCount: Joi.number().required().description("Total Hand Count"),
    isShootingMoon: Joi.boolean().required().description("is Shooting Moon"),
    isTieRound: Joi.boolean().required().description("is Tie Round"),
    currentTieRound: Joi.number().required().description("Number Of Tie Round"),
    isWinFlag: Joi.boolean().allow(null).description("is Win Flag"),
    currentUserTurnTimer: Joi.number().description("user turn timer"),
    currentGameStartTimer: Joi.number().description("game start timer"),
    currentCardPassTimer: Joi.number().description("card Pass Timer"),
  })
  .unknown(true);

export = roundTablePlaySchema;