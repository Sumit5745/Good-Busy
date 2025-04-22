import { StatusCodes } from "http-status-codes";
import { ActivityLog, Action } from "../../../shared/models/ActivityLog";
import logger from "../../../shared/services/logger.service";
import mongoose from "mongoose";

/**
 * Get activity logs with pagination and filtering
 */
export const getActivityLogs = async (req: any, res: any): Promise<any> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      action, 
      tableName, 
      targetId,
      createdBy,
      startDate,
      endDate
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: res.__("INVALID_PAGINATION_PARAMS"),
      });
    }

    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const query: any = {};

    // Filter by action type if provided
    if (action) {
      if (!Object.values(Action).includes(action as Action)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: res.__("INVALID_FILTER_PARAMS"),
        });
      }
      query.action = action;
    }

    // Filter by table name (source) if provided
    if (tableName) {
      query.tableName = tableName;
    }

    // Filter by target ID if provided
    if (targetId) {
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: res.__("INVALID_FILTER_PARAMS"),
        });
      }
      query.targetId = targetId;
    }

    // Filter by user ID if provided
    if (createdBy) {
      if (!mongoose.Types.ObjectId.isValid(createdBy)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: false,
          message: res.__("INVALID_FILTER_PARAMS"),
        });
      }
      query.createdBy = createdBy;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: res.__("INVALID_FILTER_PARAMS"),
          });
        }
        query.createdAt.$gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message: res.__("INVALID_FILTER_PARAMS"),
          });
        }
        query.createdAt.$lte = end;
      }
    }

    // Execute query with pagination
    const activityLogs = await ActivityLog.find(query).populate('createdBy', '_id username role currentRole status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalLogs = await ActivityLog.countDocuments(query);
    
    // Return paginated results
    return res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("CHANGELOG_FETCH_SUCCESS"),
      data: {
        activityLogs,
        pagination: {
          total: totalLogs,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalLogs / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

/**
 * Get a specific activity log by ID
 */
export const getActivityLogById = async (req: any, res: any): Promise<any> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: res.__("INVALID_FILTER_PARAMS"),
      });
    }

    // Find the activity log
    const activityLog = await ActivityLog.findById(id).populate('createdBy', '_id username role currentRole status');

    if (!activityLog) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("CHANGELOG_NOT_FOUND"),
      });
    }

    // Return the activity log
    return res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("CHANGELOG_FETCH_SUCCESS"),
      data: activityLog,
    });
  } catch (error) {
    logger.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: res.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
}; 