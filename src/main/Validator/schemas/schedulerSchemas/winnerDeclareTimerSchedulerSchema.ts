const Joi = require('joi');

const winnerDeclareTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('Job Id'),
  tableId: Joi.string().description('table Id')
});

export = winnerDeclareTimerSchedulerSchema;