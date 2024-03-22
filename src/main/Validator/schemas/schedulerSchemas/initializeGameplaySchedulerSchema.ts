const Joi = require('joi');
import { roundTablePlaySchema, tableGamePlaySchema } from '../methodSchemas';

const initializeGameplaySchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  queueKey: Joi.string().description('user queue Key'),
  tableId: Joi.string().description('table Id'),
  tableGamePlay: tableGamePlaySchema,
  roundTablePlay: roundTablePlaySchema
});

export = initializeGameplaySchedulerSchema;
