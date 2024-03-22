const Joi = require('joi');

const formatUserThrowCardShowSchema = Joi.object().keys({
  seatIndex: Joi.number().integer().required().description('user Seat Index'),
  card: Joi.string().required().description('user Throwed Card'),
  turnTimeout: Joi.boolean().required().description('user miss the turn'),
});

export = formatUserThrowCardShowSchema;
