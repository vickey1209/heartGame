const Joi = require("joi");

const userDetailSchema = Joi.object()
  .keys({
    _id: Joi.string().required().description("user Unique Id"),
    isFTUE: Joi.boolean().description("tutorial flag"),
    username: Joi.string().required().allow("").description("user naem"),
    lobbyId: Joi.string().required().allow("").description("lobby id"),
    gameId: Joi.string().required().description("game id"),
    startTime: Joi.number().required().description("Start Timer"),
    balance: Joi.number().required().allow(null).description("user balance"),
    userId: Joi.string().required().description("user Unique Id"),
    profilePic: Joi.string()
      .required()
      .allow("")
      .description("User Profile Pic"),
    minPlayer : Joi.number().required().description("minPlayer"),
    noOfPlayer : Joi.number().required().description("noOfPlayer"),
    gameStartTimer: Joi.number().required().description("Game start Timer"),
    userTurnTimer: Joi.number().required().description("User Turn Timer"),
    entryFee: Joi.number().required().description("Boot Ammount Of Playing"),
    winningAmount : Joi.string().required().description("winningAmount"),
    authToken: Joi.string().required().description("Unique Auth Token"),
    isUseBot : Joi.boolean().required().description("isUseBot"),
    isBot : Joi.boolean().required().description("isBot yer or not"),
    socketId: Joi.string().required().description("User SocketId"),
  })
  .unknown(true);

export = userDetailSchema;
