import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../services/logger.service";

// Type for standardized API response
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    code?: number;
    stack?: string;
    timestamp?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any; // Allow additional properties
  };
}

// Extend Express Response interface to include our helper methods
declare global {
  namespace Express {
    interface Response {
      success: <T>(
        data?: T,
        message?: string,
        statusCode?: number,
        meta?: any
      ) => Response;
      error: (
        message?: string,
        error?: any,
        statusCode?: number,
        meta?: any
      ) => Response;
      notFound: (message?: string) => Response;
      badRequest: (message?: string, error?: any) => Response;
      unauthorized: (message?: string) => Response;
      forbidden: (message?: string) => Response;
      conflict: (message?: string, error?: any) => Response;
      tooManyRequests: (message?: string, timeRemaining?: number) => Response;
    }
  }
}

/**
 * Middleware to add standardized response methods to res object
 */
export const responseHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Success response helper
  res.success = function <T>(
    data?: T,
    message = req.__("SUCCESS"),
    statusCode = StatusCodes.OK,
    meta?: any
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (meta) {
      response.meta = {
        ...meta,
        timestamp: new Date().toISOString(),
      };
    }

    return res.status(statusCode).json(response);
  };

  // Error response helper
  res.error = function (
    message = req.__("SOMETHING_WENT_WRONG"),
    error?: any,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    meta?: any
  ) {
    const errorMessage = error?.message || String(error);

    // Log the error with appropriate service name from request path
    const serviceName = req.path.split("/")[1] || "api";
    logger.error(`API Error: ${errorMessage}`, {
      service: `${serviceName}-ms`,
      path: req.path,
      method: req.method,
      error,
    });

    // Create response with required fields
    const response: ApiResponse = {
      success: false,
      message,
      meta: {
        code: statusCode,
        timestamp: new Date().toISOString(),
        ...(meta || {}),
      },
    };

    // Ensure meta is always defined
    if (!response.meta) {
      response.meta = {
        code: statusCode,
        timestamp: new Date().toISOString()
      };
    }

    if (error) {
      response.error = errorMessage;
    }

    // Only include stack trace in development
    if (process.env.NODE_ENV !== "production" && error?.stack) {
      // Use non-null assertion since we've ensured meta exists above
      response.meta!.stack = error.stack;
    }

    return res.status(statusCode).json(response);
  };

  // Common error responses
  res.notFound = function (message = req.__("NOT_FOUND")) {
    return res.error(message, null, StatusCodes.NOT_FOUND);
  };

  res.badRequest = function (message = req.__("BAD_REQUEST"), error?: any) {
    return res.error(message, error, StatusCodes.BAD_REQUEST);
  };

  res.unauthorized = function (message = req.__("UNAUTHORIZED")) {
    return res.error(message, null, StatusCodes.UNAUTHORIZED);
  };

  res.forbidden = function (message = req.__("FORBIDDEN")) {
    return res.error(message, null, StatusCodes.FORBIDDEN);
  };

  res.conflict = function (message = req.__("CONFLICT"), error?: any) {
    return res.error(message, error, StatusCodes.CONFLICT);
  };

  res.tooManyRequests = function (
    message = req.__("TOO_MANY_REQUESTS"),
    timeRemaining?: number
  ) {
    const meta = timeRemaining ? { timeRemaining } : undefined;
    return res.error(message, null, StatusCodes.TOO_MANY_REQUESTS, meta);
  };

  next();
};

export default responseHandler;
