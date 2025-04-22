import sendPushNotification from "../../../shared/services/sendNotification.service";
import Notification, { INotification } from "../models/notification.model";
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
} from "../constant/notificationConstant";
import User from "../../../user-ms/src/models/User";

// Define a more specific type for notification messages
interface NotificationMessage {
  header: string;
  content: string | ((param?: any) => string);
}

export class NotificationService {
  static async createAndSendNotification(
    toUser: string,
    fromUser: string | undefined,
    type: keyof typeof NOTIFICATION_TYPES,
    extraData: any = {},
    deviceId?: string
  ): Promise<INotification> {
    const message = NOTIFICATION_MESSAGES[type] as NotificationMessage;

    const user = await User.findById(toUser);

    const fromUserData = await User.findById(fromUser);
    if (!user) {
      throw new Error("User not found");
    }

    // Use fcmTokens if available, otherwise fallback to deviceId
    const fcmTokens =
      user.fcmTokens && user.fcmTokens.length > 0
        ? user.fcmTokens
        : user.deviceId
          ? [user.deviceId]
          : [];

    // Handle content properly based on whether it's a function or string
    const content =
      typeof message.content === "function"
        ? message.content(fromUserData?.firstName)
        : message.content;

    // Create notification in database
    const notification = await Notification.create({
      header: message.header,
      content,
      toUser,
      fromUser,
      extraData,
      isRead: false,
    });

    // Send push notification if FCM tokens are available
    if (fcmTokens.length > 0) {
      await sendPushNotification(
        fcmTokens,
        content,
        { ...extraData, notificationId: notification._id },
        type,
        message.header
      );
    }

    return notification;
  }

  static async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ toUser: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("fromUser", "name email");

    const total = await Notification.countDocuments({ toUser: userId });

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, toUser: userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { toUser: userId, isRead: false },
      { isRead: true }
    );
  }
}
