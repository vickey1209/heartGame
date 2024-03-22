import Joi from "joi";

const playerGamePlaySchema = Joi.object()
  .keys({
    _id: Joi.string().required().description("user Unique Id"),
    userId: Joi.string().required().description("user Unique Id"),
    username: Joi.string().required().allow("").description("user naem"),
    profilePic: Joi.string().required().allow("").description("User Profile Pic"),
    roundTableId: Joi.string().required().description("Round Table Id"),
    seatIndex: Joi.number().required().description("seat index"),
    userStatus: Joi.string().required().description("playing status"),
    isFirstTurn: Joi.boolean().required().description("first user turn"),
    socketId: Joi.string().required().description("User SocketId"),
    currentCards: Joi.array().required().description("user All Card"),
    turnTimeout: Joi.number().required().description("lobby user turn timer"),
    cardPassDetails: Joi.object().keys({
      status: Joi.boolean().required().description("status"),
      cards: Joi.array().items(Joi.string()).default([]).required().description("cards"),
    }).required().description("card Pass Details"),
    hands: Joi.number().required().description("total hands"),
    penaltyPoint: Joi.number().required().description("penalty  point"),
    spadePoint : Joi.number().required().description("spade point"),
    heartPoint : Joi.number().required().description("heart point"),
    totalPoint: Joi.number().required().description("total  point"),
    isLeft: Joi.boolean().required().description("user is left"),
    isAuto: Joi.boolean().required().description("auto turn"),
    isTurn: Joi.boolean().required().description("user turn"),
    isBot: Joi.boolean().required().description("isBot yer or not"),
  }).unknown(true);

export = playerGamePlaySchema;
