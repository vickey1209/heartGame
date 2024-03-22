import { roundTablePlaySchema, tableGamePlaySchema } from "../methodSchemas";

const Joi = require('joi');

const roundStartTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('Job Id'),
  tableId: Joi.string().description('table Id'),
  tableGamePlay: tableGamePlaySchema,
  roundTablePlay: roundTablePlaySchema,
});

export = roundStartTimerSchedulerSchema;
