import { tableGamePlaySchema } from "../methodSchemas";

const Joi = require('joi');

const initialUserTurnTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  tableId: Joi.string().description('table Id'),
  tableGamePlay : tableGamePlaySchema,
  nextTurn : Joi.string().description('next turn')
});

export = initialUserTurnTimerSchedulerSchema;