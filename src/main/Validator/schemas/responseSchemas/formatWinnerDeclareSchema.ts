const Joi = require('joi');

const formatWinnerDeclareSchema = Joi.object().keys({
  timer: Joi.number().optional().description('turn timer'),
  roundScoreHistory:
    Joi.object()
      .keys({
        total: Joi.array().items(
          Joi.object().keys({
            seatIndex: Joi.number().required().description('seat index'),
            totalPoint: Joi.number().required().description('total point'),
          }),
        ),

        roundwinner: Joi.array().items(
          Joi.object().keys({
            title: Joi.string().optional().description('title'),
            roundWinners: Joi.array().items(
              Joi.object().keys({
                userId: Joi.string().required().description('userId'),
                seatIndex: Joi.number().required().description('seat index'),
                profilePic: Joi.string().required().description('profile Pic'),
              })
            )
          })
        ),

        scores: Joi.array().items(
          Joi.object().keys({
            title: Joi.string().required().description('round title'),
            score: Joi.array().items(
              Joi.object().keys({
                seatIndex: Joi.number().required().description('seat index'),
                spadePoint: Joi.number().required().description("spade Point"),
                heartPoint: Joi.number().required().description("heart Point"),
                roundPoint: Joi.number()
                  .required()
                  .description('total round point'),
              }),
            ),
          }),
        ),

        users: Joi.array().items(
          Joi.object().keys({
            seatIndex: Joi.number().required().description('seat index'),
            username: Joi.string()
              .required()
              .allow('')
              .description('user name'),
            profilePicture: Joi.string()
              .required()
              .allow('')
              .description('user profile pic'),
            userStatus: Joi.string()
              .required()
              .description('user status'),
          }),
        ),

      })
      .required()
      .description('score data'),
  roundTableId: Joi.string().required().description('round table id'),
  winningAmount: Joi.array().items(
    Joi.object().keys({
      seatIndex: Joi.number().required().description('user seat index'),
      userId: Joi.string().required().description('userId'),
      winningAmount: Joi.string().required().description('user winning Amount')
    })
  ),
  winner: Joi.array()
    .items(Joi.number().optional())
    .optional()
    .description('user seat index'),
  nextRound: Joi.number().required().description('next Round')
});

export = formatWinnerDeclareSchema;
