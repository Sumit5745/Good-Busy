import { NotificationService } from "../services/notification.service";
import logger from "../../../shared/services/logger.service";
import { StatusCodes } from "http-status-codes";

const getNotifications = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await NotificationService.getNotifications(
      userId,
      page,
      limit,
    );
    res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("NOTIFICATION_LIST_SUCCESS"),
      data: result,
    });
  } catch (error: any) {
    logger.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: req.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

const markAsRead = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await NotificationService.markAsRead(
      notificationId,
      userId,
    );
    if (!notification) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("NOTIFICATION_NOT_FOUND"),
      });
    }

    res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("NOTIFICATION_MARK_READ_SUCCESS"),
      data: notification,
    });
  } catch (error: any) {
    logger.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: req.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

const markAllAsRead = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    await NotificationService.markAllAsRead(userId);

    res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("NOTIFICATION_MARK_ALL_READ_SUCCESS"),
    });
  } catch (error: any) {
    logger.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: req.__("SOMETHING_WENT_WRONG"),
      error,
    });
  }
};

export { getNotifications, markAsRead, markAllAsRead };
