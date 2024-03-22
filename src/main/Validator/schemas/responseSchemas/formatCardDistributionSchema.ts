const Joi = require('joi');

const formatCardDistributionSchema = Joi.object().keys({
  cards: Joi.array().items(Joi.string()).required().description('cards'),
  currentRound : Joi.number().required().description('currentRound')
});

export = formatCardDistributionSchema;
