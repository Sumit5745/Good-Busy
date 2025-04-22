import { celebrate, Joi, Segments } from "celebrate";

const validateRegister = celebrate({
  [Segments.BODY]: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    bio: Joi.string().optional().allow(null, ""),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({ "any.only": "Passwords do not match" }),
    agreeToTerms: Joi.boolean().valid(true).required().messages({
      "any.only": "You must agree to Terms & Conditions and Privacy Policy",
    }),
  }),
});

const validateLogin = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const validateForgetPassword = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
});

const validateResetPassword = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.number().required(),
    password: Joi.string().min(6).required(),
  }),
});

const validateVerifyAccount = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.number().required(),
  }),
});

const validateResendOTP = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
});

export default {
  validateRegister,
  validateLogin,
  validateForgetPassword,
  validateResetPassword,
  validateVerifyAccount,
  validateResendOTP,
};
