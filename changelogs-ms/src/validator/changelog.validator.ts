import { celebrate, Joi, Segments } from "celebrate";
import mongoose from "mongoose";
import { Action } from "../../../shared/models/ActivityLog";

export const activityLogIdParamValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string()
      .required()
      .custom((value: string, helpers: any) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .messages({
        "any.required": "Activity log ID is required",
        "any.invalid": "Invalid activity log ID format",
      }),
  }),
});

export const activityLogQueryValidator = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    action: Joi.string().valid(...Object.values(Action)),
    tableName: Joi.string(),
    targetId: Joi.string().custom((value: string, helpers: any) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }),
    createdBy: Joi.string().custom((value: string, helpers: any) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")),
  }),
}); 