import { playerGamePlaySchema } from "../methodSchemas";
import seatsSchema from "../methodSchemas/seatsSchema";

import Joi from "joi";

const formatRejoinTableInfoSchema = Joi.object().keys({
  isRejoin: Joi.boolean().required().description('Rehjoin Data'),
  entryFee: Joi.number().required().description('boot value'),
  userTurnTimer: Joi.number().required().description('user Turn Timer'),
  currentUserTurnTimer: Joi.number().required().description('current User Turn Timer'),
  gameStartTimer: Joi.number().required().description('game Start Timer'),
  currentGameStartTimer: Joi.number().required().description('current Game Start Timer'),
  cardPassTimer: Joi.number().required().description('card Pass Timer'),
  currentCardPassTimer: Joi.number().required().description('current Card Pass Timer'),
  tableId: Joi.string().required().description('table Id'),
  totalPlayers: Joi.number().required().description('total Player'),
  minimumPlayers: Joi.number().required().description('minimun Players'),
  currentRound: Joi.number().required().description('currentRound'),
  currentTurn: Joi.string().allow("").required().description('currentTurn'),
  winnningAmonut: Joi.string().required().description('winnningAmonut'),
  handCount : Joi.number().required().description('handCount'),
  tableState: Joi.string().required().description('tableState'),
  turnCurrentCards : Joi.array().items(Joi.string().required()).required().description('turnCurrentCards'),
  turnCardSequence : Joi.string().required().description('turnCardSequence'),
  isBreakingHearts : Joi.boolean().required().description('isBreakingHearts'),
  cardMoveSide : Joi.string().required().description('cardMoveSide'),
  seats: Joi.array().items(seatsSchema),
  userId: Joi.string().required().description('userId'),
  seatIndex: Joi.number().required().description('seat Index'),
  isFTUE: Joi.boolean().required().description('tutorial playing flag'),
  playersDetails : Joi.array().items(playerGamePlaySchema).description('players details'),
  massage : Joi.string().allow("").required().description('massage'),
});

export = formatRejoinTableInfoSchema;
