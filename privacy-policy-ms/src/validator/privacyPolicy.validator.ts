import { Joi, Segments, celebrate } from "celebrate";

export const validatePrivacyPolicy = celebrate({
  [Segments.BODY]: Joi.object().keys({
    version: Joi.string().trim().required().min(1).max(20).messages({
      "string.empty": "PRIVACY_POLICY_VERSION_REQUIRED",
      "string.min": "PRIVACY_POLICY_VERSION_LENGTH",
      "string.max": "PRIVACY_POLICY_VERSION_LENGTH",
      "any.required": "PRIVACY_POLICY_VERSION_REQUIRED",
    }),
    title: Joi.string().trim().required().min(5).max(100).messages({
      "string.empty": "PRIVACY_POLICY_TITLE_REQUIRED",
      "string.min": "PRIVACY_POLICY_TITLE_LENGTH",
      "string.max": "PRIVACY_POLICY_TITLE_LENGTH",
      "any.required": "PRIVACY_POLICY_TITLE_REQUIRED",
    }),
    sections: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().trim().required().min(5).max(100).messages({
            "string.empty": "PRIVACY_POLICY_SECTION_TITLE_REQUIRED",
            "string.min": "PRIVACY_POLICY_SECTION_TITLE_LENGTH",
            "string.max": "PRIVACY_POLICY_SECTION_TITLE_LENGTH",
            "any.required": "PRIVACY_POLICY_SECTION_TITLE_REQUIRED",
          }),
          content: Joi.string().trim().required().min(10).messages({
            "string.empty": "PRIVACY_POLICY_SECTION_CONTENT_REQUIRED",
            "string.min": "PRIVACY_POLICY_SECTION_CONTENT_LENGTH",
            "any.required": "PRIVACY_POLICY_SECTION_CONTENT_REQUIRED",
          }),
        }),
      )
      .min(1)
      .messages({
        "array.min": "PRIVACY_POLICY_SECTIONS_REQUIRED",
        "array.base": "PRIVACY_POLICY_SECTIONS_REQUIRED",
      }),
    isActive: Joi.boolean().default(false),
  }),
});

export const validatePrivacyPolicyUpdate = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().trim().min(5).max(100).messages({
        "string.empty": "PRIVACY_POLICY_TITLE_REQUIRED",
        "string.min": "PRIVACY_POLICY_TITLE_LENGTH",
        "string.max": "PRIVACY_POLICY_TITLE_LENGTH",
      }),
      sections: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().trim().required().min(5).max(100).messages({
              "string.empty": "PRIVACY_POLICY_SECTION_TITLE_REQUIRED",
              "string.min": "PRIVACY_POLICY_SECTION_TITLE_LENGTH",
              "string.max": "PRIVACY_POLICY_SECTION_TITLE_LENGTH",
              "any.required": "PRIVACY_POLICY_SECTION_TITLE_REQUIRED",
            }),
            content: Joi.string().trim().required().min(10).messages({
              "string.empty": "PRIVACY_POLICY_SECTION_CONTENT_REQUIRED",
              "string.min": "PRIVACY_POLICY_SECTION_CONTENT_LENGTH",
              "any.required": "PRIVACY_POLICY_SECTION_CONTENT_REQUIRED",
            }),
          }),
        )
        .min(1)
        .messages({
          "array.min": "PRIVACY_POLICY_SECTIONS_REQUIRED",
          "array.base": "PRIVACY_POLICY_SECTIONS_REQUIRED",
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
        "string.pattern.base": "PRIVACY_POLICY_INVALID_ID",
        "any.required": "PRIVACY_POLICY_ID_REQUIRED",
      }),
  }),
});

export const validateVersionParam = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    version: Joi.string().required().messages({
      "any.required": "PRIVACY_POLICY_VERSION_REQUIRED",
    }),
  }),
});
