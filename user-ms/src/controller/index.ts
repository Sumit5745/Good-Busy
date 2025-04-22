import User, { UserRole, UserStatus, IUser } from "../models/User";
import File, { FIleStatus, FileType } from "../../../shared/models/Files";
import { StatusCodes } from "http-status-codes";
import { comparePassword, encrypt } from "../../../shared/helper/utils";
import logger from "../../../shared/services/logger.service";
import {
  createActivityLog,
  validateAndGetChanges,
} from "../../../shared/models/ActivityLog";
import { updateProfileValidator } from "../validator/user.validator";
import fs from "fs";
import path from "path";
import { getRelativePath } from "../../../shared/middleware/fileUpload.middleware";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

// Create an extended interface for the response
interface UserResponse extends Partial<IUser> {
  profileImageUrl?: string;
}

export const getProfile = async (req: any, res: any): Promise<any> => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select("-password -otp -otpExpireTime -__v")
      .populate("profileImage");

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    // Transform profileImage URL if exists
    const userData: UserResponse = user.toObject();
    if (userData.profileImage && typeof userData.profileImage === "object") {
      userData.profileImageUrl = `${global.config.FILE_BASE_URL}${(userData.profileImage as any).location}`;
    }
    userData.profileImage = (userData.profileImage as any)?._id;

    res.json({
      status: true,
      data: userData,
    });
  } catch (error: any) {
    console.error(error);
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    // Manual validation directly in the controller
    const { firstName, lastName, bio } = req.body;

    // Validate the body directly instead of using celebrate middleware
    const validationResult = updateProfileValidator.validate(req.body);
    if (validationResult.error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: validationResult.error.details[0].message,
      });
    }

    const user = await User.findById(userId)
      .select("-password -otp -otpExpireTime -__v")
      .populate("profileImage");

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    const updatedFields: any = {};
    const oldProfileImageId = user.profileImage
      ? (user.profileImage as any)._id
      : null;

    // Handle profileImage file upload
    if (file) {
      try {
        const relativePath = getRelativePath(file.path);

        logger.info(
          `Creating file record for avatar upload: ${file.originalname}`,
          {
            service: "user-ms",
            userId: userId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
          }
        );

        // Create new file record
        const newFile = await File.create({
          name: file.filename,
          size: file.size,
          fileType: file.mimetype,
          ext: file.originalname.split(".").pop(),
          location: relativePath,
          type: FileType.IMAGE,
          ownerId: userId,
        });

        updatedFields.profileImage = newFile._id;

        logger.info(`Profile image created with ID: ${newFile._id}`, {
          service: "user-ms",
          userId: userId,
          fileId: newFile._id,
        });
      } catch (fileError: any) {
        logger.error(`Error creating file record: ${fileError}`, {
          service: "user-ms",
          error: fileError,
        });

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: false,
          message: res.__("FAILED_TO_UPDATE_PROFILE_IMAGE"),
          error: fileError.message,
        });
      }
    }

    updatedFields.firstName = firstName || user.firstName;
    updatedFields.lastName = lastName || user.lastName;
    updatedFields.bio = bio || user.bio;

    const changes = validateAndGetChanges(user, updatedFields);
    if (changes.length > 0) {
      await createActivityLog(
        "users",
        user._id,
        "UPDATE",
        changes,
        req.user._id
      );
    }

    // Update user
    await user.updateOne(updatedFields);

    // Delete old profileImage file and record if a new one was uploaded
    if (file && oldProfileImageId) {
      try {
        // Get old profileImage record
        const oldProfileImage = await File.findById(oldProfileImageId);
        if (oldProfileImage) {
          // Delete file from filesystem
          const filePath = path.resolve(
            __dirname,
            "../../../shared/uploads",
            oldProfileImage.location
          );
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted old profile image file: ${filePath}`, {
              service: "user-ms",
              userId: userId,
              fileId: oldProfileImageId,
            });
          }
          // Mark file record as deleted
          await File.findByIdAndUpdate(oldProfileImageId, {
            status: FIleStatus.DELETED,
          });
        }
      } catch (deleteError: any) {
        // Just log the error but continue execution
        logger.error(
          `Error deleting old profile image: ${deleteError.message}`,
          {
            service: "user-ms",
            userId: userId,
            fileId: oldProfileImageId,
            error: deleteError,
          }
        );
      }
    }

    // Get updated user with populated profileImage
    const updatedUser = await User.findById(userId)
      .select("-password -otp -otpExpireTime -__v")
      .populate("profileImage");

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    // Transform profileImage URL
    const userData: UserResponse = updatedUser.toObject();
    if (userData.profileImage && typeof userData.profileImage === "object") {
      userData.profileImageUrl = `${global.config.FILE_BASE_URL}${(userData.profileImage as any).location}`;
    }
    userData.profileImage = (userData.profileImage as any)?._id;

    res.json({
      status: true,
      message: res.__("PROFILE_UPDATED_SUCCESSFULLY"),
      data: userData,
    });
  } catch (error: any) {
    logger.error(`Error updating user profile: ${error.message}`, {
      service: "user-ms",
      error,
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error: error.message,
    });
  }
};

export const getAllUsers = async (req: any, res: any) => {
  try {
    if (req.user.role !== UserRole.Admin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: false,
        message: res.__("ACCESS_DENIED"),
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const searchQuery = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(searchQuery)
      .select("-password -otp -otpExpireTime -__v")
      .populate("profileImage")
      .skip((page - 1) * limit)
      .limit(limit);

    // Transform profileImage URLs
    const transformedUsers = users.map((user) => {
      const userData: UserResponse = user.toObject();
      if (userData.profileImage && typeof userData.profileImage === "object") {
        userData.profileImageUrl = `${global.config.FILE_BASE_URL}${(userData.profileImage as any).location}`;
      }
      userData.profileImage = (userData.profileImage as any)?._id;
      return userData;
    });

    res.json({
      status: true,
      data: transformedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: limit,
      },
    });
  } catch (error: any) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

export const changePassword = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: res.__("CURRENT_PASSWORD_INCORRECT"),
      });
    }

    user.password = await encrypt(newPassword);
    await user.save();

    res.json({
      status: true,
      message: res.__("SUCCESS_CHANGE_PASSWORD"),
    });
  } catch (error: any) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

export const changeUserRole = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    if (role === UserRole.Admin) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: res.__("ACCESS_DENIED"),
      });
    }

    user.currentRole = role;
    await user.save();
    const changes = validateAndGetChanges(user, { currentRole: role });
    await createActivityLog("users", user._id, "UPDATE", changes, req.user._id);

    res.json({
      status: true,
      message: res.__("USER_ROLE_CHANGED_SUCCESSFULLY"),
    });
  } catch (err: any) {
    logger.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error: err,
    });
  }
};

export const deleteAccount = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { deleteReason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    user.status = UserStatus.Deleted;
    user.deleteReason = deleteReason;

    await user.save();
    const changes = validateAndGetChanges(user, { status: UserStatus.Deleted });
    await createActivityLog("users", user._id, "UPDATE", changes, req.user._id);

    res.json({
      status: true,
      message: res.__("ACCOUNT_DELETED_SUCCESSFULLY"),
    });
  } catch (err: any) {
    logger.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error: err,
    });
  }
};

export const updateDeviceId = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { deviceId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    const changes = validateAndGetChanges(user, { deviceId });
    await createActivityLog("users", user._id, "UPDATE", changes, req.user._id);

    user.deviceId = deviceId;
    await user.save();

    res.json({
      status: true,
      message: res.__("DEVICE_ID_UPDATED_SUCCESSFULLY"),
    });
  } catch (error: any) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

/**
 * Register a Firebase Cloud Messaging token for the user
 */
export const registerFcmToken = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: false,
        message: res.__("INVALID_TOKEN"),
      });
    }

    // Find user and update FCM tokens
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: res.__("USER_NOT_FOUND"),
      });
    }

    // Initialize fcmTokens array if it doesn't exist
    if (!user.fcmTokens) {
      user.fcmTokens = [];
    }

    // Add token if it doesn't already exist
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);

      // Also update the legacy deviceId field for backwards compatibility
      user.deviceId = token;

      await user.save();

      logger.info(`FCM token registered for user ${userId}`, {
        service: "user-ms",
        userId,
      });
    }

    return res.status(200).json({
      status: true,
      message: res.__("FCM_TOKEN_REGISTERED"),
    });
  } catch (error: any) {
    logger.error(`Error registering FCM token: ${error.message}`, {
      service: "user-ms",
      error,
    });

    return res.status(500).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};
