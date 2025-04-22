import { Joi, Segments, celebrate } from "celebrate";

export const validateAboutUs = celebrate({
  [Segments.BODY]: Joi.object().keys({
    version: Joi.string().trim().required().min(1).max(20).messages({
      "string.empty": "ABOUT_US_VERSION_REQUIRED",
      "string.min": "ABOUT_US_VERSION_LENGTH",
      "string.max": "ABOUT_US_VERSION_LENGTH",
      "any.required": "ABOUT_US_VERSION_REQUIRED",
    }),
    title: Joi.string().trim().required().min(5).max(100).messages({
      "string.empty": "ABOUT_US_TITLE_REQUIRED",
      "string.min": "ABOUT_US_TITLE_LENGTH",
      "string.max": "ABOUT_US_TITLE_LENGTH",
      "any.required": "ABOUT_US_TITLE_REQUIRED",
    }),
    sections: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().trim().required().min(5).max(100).messages({
            "string.empty": "ABOUT_US_SECTION_TITLE_REQUIRED",
            "string.min": "ABOUT_US_SECTION_TITLE_LENGTH",
            "string.max": "ABOUT_US_SECTION_TITLE_LENGTH",
            "any.required": "ABOUT_US_SECTION_TITLE_REQUIRED",
          }),
          content: Joi.string().trim().required().min(10).messages({
            "string.empty": "ABOUT_US_SECTION_CONTENT_REQUIRED",
            "string.min": "ABOUT_US_SECTION_CONTENT_LENGTH",
            "any.required": "ABOUT_US_SECTION_CONTENT_REQUIRED",
          }),
        }),
      )
      .min(1)
      .messages({
        "array.min": "ABOUT_US_SECTIONS_REQUIRED",
        "array.base": "ABOUT_US_SECTIONS_REQUIRED",
      }),
    isActive: Joi.boolean().default(false),
  }),
});

export const validateAboutUsUpdate = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().trim().min(5).max(100).messages({
        "string.empty": "ABOUT_US_TITLE_REQUIRED",
        "string.min": "ABOUT_US_TITLE_LENGTH",
        "string.max": "ABOUT_US_TITLE_LENGTH",
      }),
      sections: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().trim().required().min(5).max(100).messages({
              "string.empty": "ABOUT_US_SECTION_TITLE_REQUIRED",
              "string.min": "ABOUT_US_SECTION_TITLE_LENGTH",
              "string.max": "ABOUT_US_SECTION_TITLE_LENGTH",
              "any.required": "ABOUT_US_SECTION_TITLE_REQUIRED",
            }),
            content: Joi.string().trim().required().min(10).messages({
              "string.empty": "ABOUT_US_SECTION_CONTENT_REQUIRED",
              "string.min": "ABOUT_US_SECTION_CONTENT_LENGTH",
              "any.required": "ABOUT_US_SECTION_CONTENT_REQUIRED",
            }),
          }),
        )
        .min(1)
        .messages({
          "array.min": "ABOUT_US_SECTIONS_REQUIRED",
          "array.base": "ABOUT_US_SECTIONS_REQUIRED",
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
        "string.pattern.base": "ABOUT_US_INVALID_ID",
        "any.required": "ABOUT_US_ID_REQUIRED",
      }),
  }),
});

export const validateVersionParam = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    version: Joi.string().required().messages({
      "any.required": "ABOUT_US_VERSION_REQUIRED",
    }),
  }),
});
