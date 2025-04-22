import { Request, Response, NextFunction } from "express";
const {
  uploadMulter,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} = require("../services/upload.service");
const path = require("path");
import logger from "../services/logger.service";

/**
 * Helper function to extract path after uploads folder
 * @param filePath - The full file path
 * @returns Path after uploads/ folder
 */
export const getRelativePath = (filePath: string): string => {
  const parts = filePath.split(path.sep);
  const uploadsIndex = parts.findIndex((part) => part === "uploads");
  if (uploadsIndex !== -1 && uploadsIndex < parts.length - 1) {
    return parts.slice(uploadsIndex + 1).join("/");
  }
  return filePath; // Return original if we can't find uploads
};

/**
 * Error handler middleware for multer
 */
export const handleFileUploadErrors = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (err) {
    logger.error(`File upload error: ${err.message}`, {
      service: "file-upload",
      error: err,
    });

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: false,
        message: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }

    if (err.message.includes("Only")) {
      return res.status(400).json({
        status: false,
        message: err.message,
        allowedTypes: ALLOWED_IMAGE_TYPES,
      });
    }

    return res.status(400).json({
      status: false,
      message: `File upload error: ${err.message}`,
    });
  }

  next();
};

/**
 * Enhanced middleware for user avatar uploads
 * @param fieldName - The field name in the form (default: avatar)
 */
export const uploadUserAvatar = (fieldName: string = "avatar") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const upload = uploadMulter("users", ALLOWED_IMAGE_TYPES);

    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        handleFileUploadErrors(err, req, res, next);
        return;
      }
      next();
    });
  };
};

/**
 * Middleware for handling file uploads to different folders based on entity type
 * @param entity - The entity type (e.g., 'boats', 'facilities', 'users', etc.)
 * @param fieldName - The field name in the form
 * @returns multer middleware with error handling
 */
export const uploadFiles = (entity: string, fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const upload = uploadMulter(entity);

    upload.array(fieldName)(req, res, (err: any) => {
      if (err) {
        handleFileUploadErrors(err, req, res, next);
        return;
      }
      next();
    });
  };
};

/**
 * Enhanced single file upload with error handling
 * @param entity - The entity type folder
 * @param fieldName - The field name in the form
 */
export const uploadSingeFiles = (entity: string, fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const upload = uploadMulter(entity);

    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        handleFileUploadErrors(err, req, res, next);
        return;
      }
      next();
    });
  };
};

/**
 * Middleware for handling multiple file fields with error handling
 * @param entity - The entity type (e.g., 'boats', 'facilities', 'users', etc.)
 * @param fields - Array of field configurations { name }
 */
export const uploadMultipleFields = (
  entity: string,
  fields: { name: string }[]
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const upload = uploadMulter(entity);

    upload.fields(fields)(req, res, (err: any) => {
      if (err) {
        handleFileUploadErrors(err, req, res, next);
        return;
      }
      next();
    });
  };
};

/**
 * Middleware to validate file uploads exist
 * Optional validation - will only check if requireFile is true
 */
export const validateFileUploads = (
  req: Request,
  res: Response,
  next: NextFunction,
  requireFile: boolean = true
): Response | void => {
  if (
    requireFile &&
    !req.file &&
    (!req.files ||
      (Array.isArray(req.files)
        ? req.files.length === 0
        : Object.keys(req.files).length === 0))
  ) {
    return res
      .status(400)
      .json({ status: false, message: "No files uploaded" });
  }
  return next();
};
