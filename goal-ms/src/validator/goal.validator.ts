import { celebrate, Joi, Segments } from "celebrate";

const goalValidator = {
  validateCreateGoal: celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required().min(3).max(100),
      description: Joi.string().required().min(10).max(1000),
      frequency: Joi.string().valid("daily", "weekly", "monthly").required(),
      privacy: Joi.string()
        .valid("public", "private", "followers")
        .default("followers")
        .description(
          "Who can see this goal: 'public' (everyone), 'private' (only you), 'followers' (only your followers)"
        ),
    }),
  }),

  validateUpdateGoal: celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().min(3).max(100),
      description: Joi.string().min(10).max(1000),
      frequency: Joi.string().valid("daily", "weekly", "monthly"),
      privacy: Joi.string()
        .valid("public", "private", "followers")
        .description(
          "Who can see this goal: 'public' (everyone), 'private' (only you), 'followers' (only your followers)"
        ),
    }),
  }),

  validateUpdateGoalStatus: celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
    [Segments.BODY]: Joi.object().keys({
      status: Joi.string().valid("active", "completed", "missed").required(),
    }),
  }),

  validateGoalAction: celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),

  validateGoalLike: celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),

  validateGoalThumbsDown: celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().required(),
    },
  }),
};

export default goalValidator;
