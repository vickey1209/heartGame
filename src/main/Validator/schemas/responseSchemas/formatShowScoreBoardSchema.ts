const Joi = require('joi');

const formatShowScoreBoardSchema = Joi.object().keys({
    winner: Joi.array()
        .items(Joi.number().optional())
        .optional()
        .description('user seat index'),
    scoreHistory:
        Joi.object()
            .keys({
                total: Joi.array().items(
                    Joi.object().keys({
                        seatIndex: Joi.number().required().description('seat index'),
                        totalPoint: Joi.number().required().description('total point'),
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
    currentRound: Joi.number().required().description('current Round')
});

export = formatShowScoreBoardSchema;
