import userDetailSchema from './userDetailSchema';
import createTableSchema from './createTableSchema';
import playerGamePlaySchema from './playerGamePlaySchema';
import tableGamePlaySchema from './tableGamePlaySchema';
import roundTablePlaySchema from './roundTablePlaySchema';
import distributeCardsSchema from './distributeCardsSchema';
import rejoinTableHistorySchema from './rejoinTableHistorySchema';
import checkWinnerSchema from "./checkWinnerSchema";

const exportObject = {
  userDetailSchema,
  createTableSchema,
  playerGamePlaySchema,
  tableGamePlaySchema,
  roundTablePlaySchema,
  distributeCardsSchema,
  rejoinTableHistorySchema,
  checkWinnerSchema
};

export = exportObject;
