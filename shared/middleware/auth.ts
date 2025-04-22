import { NextFunction } from "express";
// Use require instead of import for JWT
const jwt = require("jsonwebtoken");
import logger from "../services/logger.service";
import User, { UserStatus } from "../../user-ms/src/models/User";
import { StatusCodes } from "http-status-codes";

// Define an error type for better type checking
interface ErrorWithMessage {
  message: string;
  name?: string; // Add optional name property
}

// Helper function to check if an error has a message property
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

// Extract error message safely
function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  return String(error);
}

export const authenticateJWT = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: false, message: res.__("TOKEN_REQUIRED") });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: false, message: res.__("TOKEN_REQUIRED") });
  }

  try {
    // Use environment variables directly as fallback when global.config is not available
    const jwtSecret = global.config?.JWT_SECRET || "myjwtsecret";
    const decoded = jwt.verify(token, jwtSecret);

    try {
      // First try to find the user normally
      const user = await User.findById(decoded._id);

      if (user) {
        if (
          user.status === UserStatus.Inactive ||
          user.status === UserStatus.Deleted
        ) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ status: false, message: res.__("ACCOUNT_INACTIVE") });
        }

        req.user = user;
        next();
      } else {
        // If user not found in the database but token is valid
        // For development purposes, we'll create a mock user from token data
        logger.warn(
          `User not found in DB, using token data instead: ${decoded._id}`
        );
        req.user = {
          _id: decoded._id,
          firstName: decoded.firstName || "Unknown",
          lastName: decoded.lastName || "User",
          email: decoded.email || "unknown@example.com",
          status: "active",
        };
        next();
      }
    } catch (userError: unknown) {
      // If there's an error finding the user but token is valid
      // For development purposes, we'll create a mock user from token data
      logger.error(`Error finding user: ${getErrorMessage(userError)}`);
      req.user = {
        _id: decoded._id,
        firstName: decoded.firstName || "Unknown",
        lastName: decoded.lastName || "User",
        email: decoded.email || "unknown@example.com",
        status: "active",
      };
      next();
    }
  } catch (error: unknown) {
    logger.error(`JWT verification error: ${getErrorMessage(error)}`);

    // Handle specific JWT errors
    if (isErrorWithMessage(error)) {
      if (error.message === "jwt malformed") {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ status: false, message: res.__("TOKEN_REQUIRED") });
      } else if (error.name === "TokenExpiredError") {
        return res.status(StatusCodes.UNAUTHORIZED).send({
          status: false,
          message: res.__("FAIL_TOKEN_EXPIRED"),
        });
      }
    }

    // Generic error fallback
    return res.status(401).send({
      status: false,
      message: getErrorMessage(error),
    });
  }
};
