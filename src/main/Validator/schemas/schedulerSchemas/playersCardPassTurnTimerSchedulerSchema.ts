const Joi = require('joi');
import { tableGamePlaySchema } from '../methodSchemas';

const playersCardPassTurnTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  tableId: Joi.string().description('table Id'),
  tableGamePlay: tableGamePlaySchema,
});

export = playersCardPassTurnTimerSchedulerSchema;