import { playerGamePlaySchema, tableGamePlaySchema } from "../methodSchemas";

const Joi = require('joi');

const playerTurnTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('jobId'),
  tableId: Joi.string().description('table Id'),
  tableGamePlay : tableGamePlaySchema,
  playerGamePlay : playerGamePlaySchema,
  isAutoMode : Joi.boolean().description('isAutoMode'),
});

export = playerTurnTimerSchedulerSchema;