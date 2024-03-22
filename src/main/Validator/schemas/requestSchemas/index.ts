const Joi = require("joi");

const signUpSchema = Joi.object().keys({
  accessToken: Joi.string(),
  userId: Joi.string().required(),
  profilePic: Joi.string().required(),
  userName: Joi.string().required(),
  minPlayer: Joi.number().required(),
  noOfPlayer: Joi.number().required(),
  entryFee: Joi.number().required(),
  winningAmount: Joi.string().required(),
  lobbyId: Joi.string().required(),
  gameId: Joi.string().required(),
  isUseBot: Joi.boolean().required(),
  isFTUE: Joi.boolean().required(),
})
  .unknown(true);

const cardPassSchema = Joi.object().keys({
  userId: Joi.string().required().description("user Id"),
  tableId: Joi.string().required().description("Table Id"),
  cards: Joi.array().items(Joi.string()).required().description("cards")
})

const throwCardSchema = Joi.object().keys({
  card: Joi.string().required().description("card")
})

const leaveTableSchema = Joi.object().keys({
  userId: Joi.string().required().description("user Id"),
  tableId: Joi.string().required().description("Table Id"),
})
  .unknown(true);

const preCardPassSelectSchema = Joi.object().keys({
  userId: Joi.string().required().description("user Id"),
  tableId: Joi.string().required().description("Table Id"),
  card: Joi.string().required().description("card"),
  forwardCardMove: Joi.boolean().required().description("forwardCardMove")
})
  .unknown(true);


const showScoreBoardSchema = Joi.object()
  .keys({
    tableId: Joi.string().required().description("Table Id"),
  })
  .unknown(true);



const exportObject = {
  signUpSchema,
  cardPassSchema,
  throwCardSchema,
  leaveTableSchema,
  preCardPassSelectSchema,
  showScoreBoardSchema
};

export = exportObject;
