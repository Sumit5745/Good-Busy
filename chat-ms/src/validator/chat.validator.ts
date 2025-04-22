import { celebrate, Joi, Segments } from "celebrate";
import mongoose from "mongoose";

// Validator for chat history endpoint
export const chatHistoryValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    receiverId: Joi.string()
      .required()
      .custom((value: string, helpers: any) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .message("Invalid receiver ID format"),
  }),
  [Segments.QUERY]: Joi.object().keys({
    limit: Joi.number().optional().min(1).max(100),
    page: Joi.number().optional().min(1),
  }),
});

// Validator for message sending (used in socket validation)
export const messageValidator = Joi.object().keys({
  userId: Joi.string().required(),
  receiverId: Joi.string()
    .required()
    .custom((value: string, helpers: any) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .message("Invalid receiver ID format"),
  content: Joi.string().optional().allow("", null),
  messageType: Joi.string().required().valid("text", "image", "video", "document", "audio"),
  mediaUrl: Joi.string().optional().allow("", null),
}); 