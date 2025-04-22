import { celebrate, Joi, Segments } from "celebrate";
import mongoose from "mongoose";
import { mailStatus } from "../../../shared/models/Mail";

export const mailIdParamValidator = celebrate({
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
        "any.required": "Mail ID is required",
        "any.invalid": "Invalid mail ID format",
      }),
  }),
});

export const mailQueryValidator = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    mailStatus: Joi.string().valid(...Object.values(mailStatus)),
    mailFrom: Joi.string(),
    mailTo: Joi.string(),
    mailSubject: Joi.string(),
    createdBy: Joi.number(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")),
  }),
}); 