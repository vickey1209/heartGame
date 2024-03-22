const Joi = require('joi');

const cardsChangeTimeSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  tableId: Joi.string().description('table Id'),
});

export = cardsChangeTimeSchedulerSchema;