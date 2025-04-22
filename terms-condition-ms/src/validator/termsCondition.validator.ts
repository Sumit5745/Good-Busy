import { Joi, Segments, celebrate } from "celebrate";

export const validateTermsCondition = celebrate({
  [Segments.BODY]: Joi.object().keys({
    version: Joi.string().trim().required().min(1).max(20).messages({
      "string.empty": "TERMS_CONDITION_VERSION_REQUIRED",
      "string.min": "TERMS_CONDITION_VERSION_LENGTH",
      "string.max": "TERMS_CONDITION_VERSION_LENGTH",
      "any.required": "TERMS_CONDITION_VERSION_REQUIRED",
    }),
    title: Joi.string().trim().required().min(5).max(100).messages({
      "string.empty": "TERMS_CONDITION_TITLE_REQUIRED",
      "string.min": "TERMS_CONDITION_TITLE_LENGTH",
      "string.max": "TERMS_CONDITION_TITLE_LENGTH",
      "any.required": "TERMS_CONDITION_TITLE_REQUIRED",
    }),
    sections: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().trim().required().min(5).max(100).messages({
            "string.empty": "TERMS_CONDITION_SECTION_TITLE_REQUIRED",
            "string.min": "TERMS_CONDITION_SECTION_TITLE_LENGTH",
            "string.max": "TERMS_CONDITION_SECTION_TITLE_LENGTH",
            "any.required": "TERMS_CONDITION_SECTION_TITLE_REQUIRED",
          }),
          content: Joi.string().trim().required().min(10).messages({
            "string.empty": "TERMS_CONDITION_SECTION_CONTENT_REQUIRED",
            "string.min": "TERMS_CONDITION_SECTION_CONTENT_LENGTH",
            "any.required": "TERMS_CONDITION_SECTION_CONTENT_REQUIRED",
          }),
        }),
      )
      .min(1)
      .messages({
        "array.min": "TERMS_CONDITION_SECTIONS_REQUIRED",
        "array.base": "TERMS_CONDITION_SECTIONS_REQUIRED",
      }),
    isActive: Joi.boolean().default(false),
  }),
});

export const validateTermsConditionUpdate = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().trim().min(5).max(100).messages({
        "string.empty": "TERMS_CONDITION_TITLE_REQUIRED",
        "string.min": "TERMS_CONDITION_TITLE_LENGTH",
        "string.max": "TERMS_CONDITION_TITLE_LENGTH",
      }),
      sections: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().trim().required().min(5).max(100).messages({
              "string.empty": "TERMS_CONDITION_SECTION_TITLE_REQUIRED",
              "string.min": "TERMS_CONDITION_SECTION_TITLE_LENGTH",
              "string.max": "TERMS_CONDITION_SECTION_TITLE_LENGTH",
              "any.required": "TERMS_CONDITION_SECTION_TITLE_REQUIRED",
            }),
            content: Joi.string().trim().required().min(10).messages({
              "string.empty": "TERMS_CONDITION_SECTION_CONTENT_REQUIRED",
              "string.min": "TERMS_CONDITION_SECTION_CONTENT_LENGTH",
              "any.required": "TERMS_CONDITION_SECTION_CONTENT_REQUIRED",
            }),
          }),
        )
        .min(1)
        .messages({
          "array.min": "TERMS_CONDITION_SECTIONS_REQUIRED",
          "array.base": "TERMS_CONDITION_SECTIONS_REQUIRED",
        }),
      isActive: Joi.boolean(),
    })
    .min(1),
});

export const validateIdParam = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "TERMS_CONDITION_INVALID_ID",
        "any.required": "TERMS_CONDITION_ID_REQUIRED",
      }),
  }),
});

export const validateVersionParam = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    version: Joi.string().required().messages({
      "any.required": "TERMS_CONDITION_VERSION_REQUIRED",
    }),
  }),
});
