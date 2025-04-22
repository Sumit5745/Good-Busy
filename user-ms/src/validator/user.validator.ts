import { celebrate, Joi, Segments } from "celebrate";
import { UserCurrentRole } from "../models/User";

export const updateProfileValidator = Joi.object().keys({
  firstName: Joi.string().optional().allow(null, ""),
  lastName: Joi.string().optional().allow(null, ""),
  bio: Joi.string().optional().allow(null, ""),
});

export const changePasswordValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    currentPassword: Joi.string().required().min(6),
    newPassword: Joi.string().required().min(6),
    confirmPassword: Joi.string().required().valid(Joi.ref("newPassword")),
  }),
});

export const switchRoleValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    role: Joi.string()
      .required()
      .valid(...Object.values(UserCurrentRole)),
  }),
});

export const deleteAccountValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    deleteReason: Joi.string().required(),
  }),
});
