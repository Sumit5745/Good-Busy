import { StatusCodes } from "http-status-codes";
import MailModel from "../../../shared/models/Mail";
import logger from "../../../shared/services/logger.service";
import mongoose from "mongoose";

/**
 * Get emails with pagination and filtering
 */
export const getMails = async (req: any, res: any): Promise<any> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      mailStatus, 
      mailFrom, 
      mailTo,
      mailSubject,
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

    // Filter by mail status if provided
    if (mailStatus) {
      query.mailStatus = mailStatus;
    }

    // Filter by mail from if provided
    if (mailFrom) {
      query.mailFrom = { $regex: mailFrom, $options: 'i' };
    }

    // Filter by mail to if provided
    if (mailTo) {
      query.mailTo = { $regex: mailTo, $options: 'i' };
    }

    // Filter by mail subject if provided
    if (mailSubject) {
      query.mailSubject = { $regex: mailSubject, $options: 'i' };
    }

    // Filter by createdBy if provided
    if (createdBy) {
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
    const mails = await MailModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalMails = await MailModel.countDocuments(query);
    
    // Return paginated results
    return res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("MAIL_FETCH_SUCCESS"),
      data: {
        mails,
        pagination: {
          total: totalMails,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalMails / limitNum),
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
 * Get a specific email by ID
 */
export const getMailById = async (req: any, res: any): Promise<any> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: res.__("INVALID_FILTER_PARAMS"),
      });
    }

    // Find the mail
    const mail = await MailModel.findById(id);

    if (!mail) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("MAIL_NOT_FOUND"),
      });
    }

    // Return the mail
    return res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("MAIL_FETCH_SUCCESS"),
      data: mail,
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