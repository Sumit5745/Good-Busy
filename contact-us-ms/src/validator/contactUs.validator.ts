import { Joi, Segments, celebrate } from "celebrate";

export const validateContactForm = celebrate({
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().trim().required().min(2).max(50).messages({
      "string.empty": "CONTACT_US_USERNAME_REQUIRED",
      "string.min": "CONTACT_US_USERNAME_LENGTH",
      "string.max": "CONTACT_US_USERNAME_LENGTH",
      "any.required": "CONTACT_US_USERNAME_REQUIRED",
    }),
    email: Joi.string().trim().required().email().messages({
      "string.empty": "CONTACT_US_EMAIL_REQUIRED",
      "string.email": "CONTACT_US_EMAIL_INVALID",
      "any.required": "CONTACT_US_EMAIL_REQUIRED",
    }),
    subject: Joi.string().trim().required().min(5).max(100).messages({
      "string.empty": "CONTACT_US_SUBJECT_REQUIRED",
      "string.min": "CONTACT_US_SUBJECT_LENGTH",
      "string.max": "CONTACT_US_SUBJECT_LENGTH",
      "any.required": "CONTACT_US_SUBJECT_REQUIRED",
    }),
    message: Joi.string().trim().required().min(10).max(1000).messages({
      "string.empty": "CONTACT_US_MESSAGE_REQUIRED",
      "string.min": "CONTACT_US_MESSAGE_LENGTH",
      "string.max": "CONTACT_US_MESSAGE_LENGTH",
      "any.required": "CONTACT_US_MESSAGE_REQUIRED",
    }),
  }),
});
