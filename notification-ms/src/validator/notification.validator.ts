import { celebrate, Joi, Segments } from "celebrate";

export const getNotificationsValidator = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
});

export const markAsReadValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    notificationId: Joi.string().required().messages({
      "string.empty": "Notification ID is required",
      "any.required": "Notification ID is required",
    }),
  }),
});
