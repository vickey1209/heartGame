const Joi = require("joi");

const checkWinnerSchema = Joi.array().items({
  username: Joi.string().required().allow("").description("user naem"),
  profilePic: Joi.string()
    .allow("")
    .required()
    .description("User Profile Pic"),
  userId: Joi.string().required().description("user Id"),
  seatIndex: Joi.number().required().description("user seat index"),
  hands: Joi.number().required().description("number of hands"),
  isLeft: Joi.boolean().required().description("user left or not"),
  isAuto : Joi.boolean().required().description("user auto or not"),
  spadePoint : Joi.number().required().description("spade Point"),
  heartPoint : Joi.number().required().description("heart Point"),
  penaltyPoint: Joi.number().required().description("penalty Point"),
  totalPoint: Joi.number().required().description("sum of all point"),
  
});

export = checkWinnerSchema;
