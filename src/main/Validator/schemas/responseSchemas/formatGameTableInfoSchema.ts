import seatsSchema from '../methodSchemas/seatsSchema';

import Joi from "joi";

const formatGameTableInfoSchema = Joi.object().keys({
  isRejoin: Joi.boolean().required().description('Rehjoin Data'),
  tableId: Joi.string().required().description('table Id'),
  currentRound: Joi.number().required().description('currentRound'),
  totalUserTurnTimer: Joi.number().required().description('total user Turn Timer'),
  totalPlayers: Joi.number().required().description('total Player'),
  minimumPlayers: Joi.number().required().description('minimum Players'),
  entryFee: Joi.number().required().description('boot value'),
  winnningAmonut: Joi.string().required().description('winnningAmonut'),
  seats: Joi.array().items(seatsSchema).required().description('seats'),
  tableState: Joi.string().required().description('tableState'),
  seatIndex: Joi.number().required().description('seat Index'),
  isFTUE: Joi.boolean().required().description('tutorial playing flag'),
});

export = formatGameTableInfoSchema;
