const Joi = require('joi');
import { playerGamePlaySchema, tableGamePlaySchema } from '../methodSchemas';

const initialCardPassTurnSetupTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId : Joi.string().description('jobId'),
  tableId: Joi.string().description('table Id'),
  tableGamePlay: tableGamePlaySchema,
  playersData: Joi.array().items(playerGamePlaySchema).description('playersData')  
});

export = initialCardPassTurnSetupTimerSchedulerSchema;