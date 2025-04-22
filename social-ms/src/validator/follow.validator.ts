import { celebrate, Joi, Segments } from "celebrate";

const followValidator = {
  validateFollowRequest: celebrate({
    [Segments.BODY]: Joi.object().keys({
      userId: Joi.string().required(),
    }),
  }),

  validateFollowAction: celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: Joi.object().keys({
      status: Joi.string().valid("accepted", "rejected").required(),
    }),
  }),

  validateFollowParam: celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),

  validateUserParam: celebrate({
    [Segments.PARAMS]: {
      userId: Joi.string().required(),
    },
  }),
};

export default followValidator; 