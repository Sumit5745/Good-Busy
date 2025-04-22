const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Dynamic Multer upload service
 * @param destinationPath - The path where files should be stored
 * @param allowedTypes - Array of allowed MIME types, defaults to images
 * @param maxSize - Maximum file size in bytes, defaults to 5MB
 * @returns multer instance with custom storage
 */
const uploadMulter = (
  destinationPath: string,
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES,
  maxSize: number = MAX_FILE_SIZE
) => {
  try {
    const storage = multer.diskStorage({
      destination: function (req: any, file: any, cb: any) {
        const uploadPath = path.join(
          __dirname,
          "..",
          "uploads",
          destinationPath
        );
        try {
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
        } catch (error) {
          console.error("Error creating upload directory:", error);
        }
        cb(null, uploadPath);
      },
      filename: function (req: any, file: any, cb: any) {
        // Generate a unique filename with timestamp and sanitized original name
        const sanitizedFileName = file.originalname
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-_.]/g, ""); // Remove any potentially problematic characters
        cb(null, `${Date.now()}-${sanitizedFileName}`);
      },
    });

    // File filter function to check file types
    const fileFilter = function (req: any, file: any, cb: any) {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${allowedTypes.join(", ")} are allowed`), false);
      }
    };

    return multer({
      storage: storage,
      limits: {
        fileSize: maxSize,
      },
      fileFilter: fileFilter,
    });
  } catch (error) {
    console.error("Error creating multer instance:", error);
    // Return a default multer instance with memory storage instead of failing
    return multer({ storage: multer.memoryStorage() });
  }
};

module.exports = { uploadMulter, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE };
