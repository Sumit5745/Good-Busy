import { StatusCodes } from "http-status-codes";
import {
  generateOtp,
  encrypt,
  comparePassword,
  otpExpire,
} from "../../../shared/helper/utils";
import User, {
  UserCurrentRole,
  UserRole,
  UserStatus,
} from "../../../user-ms/src/models/User";
import { emailSender } from "../../../shared/services/sendMail.service";
import { generateToken } from "../../../shared/helper/auth.helper";
import logger from "../../../shared/services/logger.service";
import { EMAIL_CONSTANT } from "../constant/emailContant";
import { formatUserData } from "../helper/utils";
import File, { FileType, FIleStatus } from "../../../shared/models/Files";
import { getRelativePath } from "../../../shared/middleware/fileUpload.middleware";
import mongoose from "mongoose";

// Properly type the _id from mongoose
type ObjectId = mongoose.Types.ObjectId;

// Store email and timestamp for rate limiting
const otpRequestTracker: {
  [email: string]: { count: number; lastRequest: Date };
} = {};

// Reset the OTP request count after 24 hours
setInterval(
  () => {
    const now = new Date();
    for (const email in otpRequestTracker) {
      const lastRequest = otpRequestTracker[email].lastRequest;
      if (now.getTime() - lastRequest.getTime() > 24 * 60 * 60 * 1000) {
        delete otpRequestTracker[email];
      }
    }
  },
  60 * 60 * 1000
); // Check every hour

// Maximum number of OTP requests allowed in a day
const MAX_OTP_REQUESTS = 5;
// Cooldown period between OTP requests in minutes
const OTP_COOLDOWN_MINUTES = 2;

// Rate limit function for OTP requests
const rateLimitOtpRequest = (
  email: string
): { allowed: boolean; timeRemaining?: number } => {
  const now = new Date();

  if (!otpRequestTracker[email]) {
    otpRequestTracker[email] = { count: 1, lastRequest: now };
    return { allowed: true };
  }

  const tracker = otpRequestTracker[email];

  // Check if user has exceeded max requests
  if (tracker.count >= MAX_OTP_REQUESTS) {
    return { allowed: false };
  }

  // Check cooldown period
  const timeSinceLastRequest =
    (now.getTime() - tracker.lastRequest.getTime()) / (60 * 1000);
  if (timeSinceLastRequest < OTP_COOLDOWN_MINUTES) {
    const timeRemaining = Math.ceil(
      OTP_COOLDOWN_MINUTES - timeSinceLastRequest
    );
    return { allowed: false, timeRemaining };
  }

  // Allow the request and update the tracker
  tracker.count += 1;
  tracker.lastRequest = now;
  return { allowed: true };
};

export const register = async (req: any, res: any) => {
  try {
    const { firstName, lastName, email, password, bio } = req.body;
    const file = req.file;

    logger.info(`Registration request for: ${email}`, {
      service: "auth-ms",
    });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (
        existingUser.status === UserStatus.Deleted ||
        existingUser.status === UserStatus.Inactive
      ) {
        // Reactivate a deleted/inactive user account
        const hashedPassword = await encrypt(password);
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.bio = bio;

        // Handle file upload
        if (file) {
          try {
            const relativePath = getRelativePath(file.path);

            logger.info(
              `Creating file record for profile image: ${file.originalname}`,
              {
                service: "auth-ms",
                email: email,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
              }
            );

            const newFile = await File.create({
              name: file.filename,
              size: file.size,
              fileType: file.mimetype,
              ext: file.originalname.split(".").pop(),
              location: relativePath,
              type: FileType.IMAGE,
              ownerId: existingUser._id,
            });

            // Type casting to ensure proper type assignment
            existingUser.profileImage = newFile._id as unknown as ObjectId;

            logger.info(`Profile image created with ID: ${newFile._id}`, {
              service: "auth-ms",
              userId: existingUser._id,
              fileId: newFile._id,
            });
          } catch (fileError: any) {
            logger.error(`Error creating file record: ${fileError.message}`, {
              service: "auth-ms",
              email: email,
              error: fileError,
            });

            // Continue registration process even if file upload fails
            // We don't want to block registration due to image issues
          }
        }

        existingUser.password = hashedPassword;
        existingUser.status = UserStatus.Pending;

        // Generate 4-digit OTP for verification
        const otp = await generateOtp(4);
        existingUser.otp = otp;
        existingUser.otpExpireTime = otpExpire();
        await existingUser.save();

        const token = await generateToken({
          _id: existingUser._id,
        });

        // Send account verification email with OTP
        await emailSender(
          email,
          EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.subject,
          {
            firstName: existingUser.firstName,
            verificationCode: otp,
          },
          EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.templateName
        );

        return res.status(StatusCodes.CREATED).send({
          status: true,
          message: res.__("ACCOUNT_REGISTERED_SUCCESSFULLY"),
          token,
          data: formatUserData(existingUser),
        });
      }

      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ status: false, message: res.__("ACCOUNT_ALREADY_EXISTS") });
    }

    const hashedPassword = await encrypt(password);

    logger.info(`Creating new user account for: ${email}`, {
      service: "auth-ms",
    });

    // Create user object with required fields
    const userObj: any = {
      firstName,
      lastName,
      email,
      bio,
      password: hashedPassword,
      role: UserRole.User,
      currentRole: UserCurrentRole.User,
      status: UserStatus.Pending,
    };

    // Handle file upload
    if (file) {
      try {
        const relativePath = getRelativePath(file.path);

        logger.info(
          `Creating file record for profile image: ${file.originalname}`,
          {
            service: "auth-ms",
            email: email,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
          }
        );

        // Create a temporary ObjectId for ownerId that will be updated after user creation
        const tempOwnerId = new mongoose.Types.ObjectId();

        const newFile = await File.create({
          name: file.filename,
          size: file.size,
          fileType: file.mimetype,
          ext: file.originalname.split(".").pop(),
          location: relativePath,
          type: FileType.IMAGE,
          ownerId: tempOwnerId, // Providing a temporary ObjectId instead of null
        });

        // Type casting to ensure proper type assignment
        userObj.profileImage = newFile._id as unknown as ObjectId;

        logger.info(`Profile image created with ID: ${newFile._id}`, {
          service: "auth-ms",
          fileId: newFile._id,
        });
      } catch (fileError: any) {
        logger.error(`Error creating file record: ${fileError.message}`, {
          service: "auth-ms",
          email: email,
          error: fileError,
        });

        // Continue registration process even if file upload fails
        // We don't want to block registration due to image issues
      }
    }

    // Generate 4-digit OTP for account verification
    const otp = await generateOtp(4);
    userObj.otp = otp;
    userObj.otpExpireTime = otpExpire();

    const user = await User.create(userObj).catch((err: any) => {
      logger.error(`Error creating user: ${err.message}`, {
        service: "auth-ms",
        email: email,
        error: err,
      });
      throw err;
    });

    // Update file owner if one was created
    if (file && userObj.profileImage) {
      try {
        await File.findByIdAndUpdate(userObj.profileImage, {
          ownerId: user._id,
        });
      } catch (updateError: any) {
        logger.error(`Error updating file owner: ${updateError.message}`, {
          service: "auth-ms",
          userId: user._id,
          fileId: userObj.profileImage,
          error: updateError,
        });
        // Continue registration process even if this update fails
      }
    }

    // Send account verification email with OTP
    await emailSender(
      email,
      EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.subject,
      {
        firstName,
        verificationCode: otp,
      },
      EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.templateName
    );

    const token = await generateToken({
      _id: user._id,
    });

    logger.info(`User registered successfully: ${user._id}`, {
      service: "auth-ms",
      userId: user._id,
    });

    res.status(StatusCodes.CREATED).send({
      status: true,
      message: res.__("VERIFICATION_CODE_SENT"),
      token,
      data: formatUserData(user),
    });
  } catch (error: any) {
    logger.error(`Registration error: ${error.message}`, {
      service: "auth-ms",
      error,
    });

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error: error.message,
    });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: res.__("USER_NOT_FOUND") });
    }

    if (
      user.status === UserStatus.Inactive ||
      user.status === UserStatus.Deleted
    ) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: false, message: res.__("ACCOUNT_INACTIVE") });
    }

    if (user.status === UserStatus.Pending) {
      // Send a new OTP to user's email for verification
      const otp = await generateOtp(4); // Generate a 4-digit OTP
      user.otp = otp;
      user.otpExpireTime = otpExpire(); // OTP expires in 5 minutes
      await user.save();

      await emailSender(
        email,
        EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.subject,
        {
          firstName: user.firstName,
          verificationCode: otp,
        },
        EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.templateName
      );

      return res.status(StatusCodes.FORBIDDEN).json({
        status: false,
        message: res.__("ACCOUNT_VERIFICATION_REQUIRED"),
        userId: user._id,
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: false, message: res.__("INVALID_CREDENTIALS") });
    }

    // Generate JWT token here
    const token = await generateToken({
      _id: user._id,
    });

    res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("LOGIN_SUCCESS"),
      token,
      data: formatUserData(user),
    });
  } catch (error: any) {
    logger.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: res.__("SOMETHING_WENT_WRONG"), error });
  }
};

export const verifyAccount = async (req: any, res: any) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: res.__("USER_NOT_FOUND") });
    }
    if (user.otp !== otp) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: res.__("INVALID_OTP") });
    }
    if (user.otpExpireTime && user.otpExpireTime < new Date()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: res.__("OTP_EXPIRED") });
    }
    user.status = UserStatus.Active;
    await user.save();
    res
      .status(StatusCodes.OK)
      .json({ status: true, message: res.__("ACCOUNT_VERIFICATION_SUCCESS") });
  } catch (error: any) {
    logger.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: res.__("SOMETHING_WENT_WRONG"), error });
  }
};

export const forgotPasswordSendOTP = async (req: any, res: any) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: res.__("USER_NOT_FOUND") });
    }

    const otp = await generateOtp(4);
    user.otp = otp;
    user.otpExpireTime = otpExpire(); // 5 minutes
    await user.save();

    await emailSender(
      email,
      EMAIL_CONSTANT.RESET_PASSWORD_EMAIL.subject,
      { firstName: user.firstName, otp },
      EMAIL_CONSTANT.RESET_PASSWORD_EMAIL.templateName
    );

    res
      .status(StatusCodes.OK)
      .json({ status: true, message: res.__("OTP_SENT") });
  } catch (error: any) {
    logger.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: res.__("SOMETHING_WENT_WRONG"), error });
  }
};

export const resetPassword = async (req: any, res: any) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: res.__("USER_NOT_FOUND") });
    }
    if (user.otp !== otp) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: res.__("INVALID_OTP") });
    }
    if (user.otpExpireTime && user.otpExpireTime < new Date()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: res.__("OTP_EXPIRED") });
    }

    const hashedPassword = await encrypt(password);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpireTime = null;
    await user.save();

    res
      .status(StatusCodes.OK)
      .json({ status: true, message: res.__("PASSWORD_RESET_SUCCESS") });
  } catch (error: any) {
    logger.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: res.__("SOMETHING_WENT_WRONG"), error });
  }
};

export const resendOTP = async (req: any, res: any) => {
  try {
    const { email } = req.body;

    // Apply rate limiting
    const rateLimit = rateLimitOtpRequest(email);
    if (!rateLimit.allowed) {
      if (rateLimit.timeRemaining) {
        return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          status: false,
          message: res.__("OTP_REQUEST_TOO_SOON"),
          timeRemaining: rateLimit.timeRemaining,
        });
      } else {
        return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          status: false,
          message: res.__("OTP_MAX_REQUESTS_EXCEEDED"),
        });
      }
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: res.__("USER_NOT_FOUND") });
    }

    // Generate a new OTP
    const otp = await generateOtp(4);
    user.otp = otp;
    user.otpExpireTime = otpExpire(); // OTP expires in 5 minutes
    await user.save();

    // Send the OTP via email
    await emailSender(
      email,
      EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.subject,
      {
        firstName: user.firstName,
        verificationCode: otp,
      },
      EMAIL_CONSTANT.ACCOUNT_VERIFICATION_EMAIL.templateName
    );

    logger.info(`OTP resent successfully for: ${email}`, {
      service: "auth-ms",
      userId: user._id,
    });

    res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("OTP_RESENT_SUCCESS"),
    });
  } catch (error: any) {
    logger.error(`Resend OTP error: ${error.message}`, {
      service: "auth-ms",
      error,
    });

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error: error.message,
    });
  }
};
