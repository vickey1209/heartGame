import seatsSchema from "./seatsSchema";
const Joi = require('joi');

const tableGamePlaySchema = Joi.object()
  .keys({
    _id: Joi.string().required().description('Table Unique Id'),
    tableId: Joi.string().required().description('Table Id'),
    gameType: Joi.string().required().description('Game Type'),
    lobbyId: Joi.string().required().description('lobby id'),
    gameId: Joi.string().required().description('game id'),
    minimumPlayers: Joi.number().required().description('minimun Players'),
    totalPlayers: Joi.number().required().description('total Players'),
    currentRound: Joi.number().required().description('Current Rounds'),
    entryFee: Joi.number().required().description('entry Fee Of Playing'),
    winningAmount:Joi.string().required().description('winning Amount'),
    winningScores: Joi.number().required().description('winning Scores'),
    gameStartTimer: Joi.number().required().description('Game start Timer'),
    userTurnTimer: Joi.number().required().description('User Turn Timer'),
    cardPassTimer: Joi.number().required().description('card Pass Timer'),
    isTieGame: Joi.boolean().required().description('is Tie Game'),
    winner: Joi.array().required().description('winner array'),
    isUseBot: Joi.boolean().required().description('isUseBot'),
  
  })
  .unknown(true);

export = tableGamePlaySchema;
