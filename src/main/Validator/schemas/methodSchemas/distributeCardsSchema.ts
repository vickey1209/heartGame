import playerGamePlaySchema from './playerGamePlaySchema';

const Joi = require('joi');

const distributeCardsSchema = Joi.array()
  .items(playerGamePlaySchema)
  .required();
export = distributeCardsSchema;
