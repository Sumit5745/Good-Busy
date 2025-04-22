import axios from "axios";
import logger from "./logger.service";

/**
 * Send push notification using Firebase Cloud Messaging
 * @param deviceId - Firebase registration token or array of tokens
 * @param content - Notification message content
 * @param data - Additional data to send with notification
 * @param type - Type of notification
 * @param header - Notification title
 * @returns Promise<boolean> - Success status
 */
const sendPushNotification = async (
  deviceId: string | string[],
  content: string,
  data: any,
  type: string,
  header = "Good-Busy Notification"
): Promise<boolean> => {
  // Skip if no deviceId provided
  if (
    !deviceId ||
    (typeof deviceId === "string" && deviceId.trim() === "") ||
    (Array.isArray(deviceId) && deviceId.length === 0)
  ) {
    logger.info("No device ID provided for push notification", {
      service: "notification",
      type,
    });
    return false;
  }

  try {
    // Prepare tokens array
    const tokens = Array.isArray(deviceId) ? deviceId : [deviceId];

    // Firebase Cloud Messaging API endpoint
    const fcmEndpoint = "https://fcm.googleapis.com/fcm/send";

    // Prepare notification payload
    const notification = {
      title: header,
      body: content,
      sound: "default",
    };

    // Determine if sending to multiple devices or single device
    let message;
    if (tokens.length > 1) {
      // Multiple devices
      message = {
        registration_ids: tokens,
        notification,
        data: {
          ...data,
          type,
          click_action: "FLUTTER_NOTIFICATION_CLICK", // For Flutter apps
        },
        priority: "high",
      };
    } else {
      // Single device
      message = {
        to: tokens[0],
        notification,
        data: {
          ...data,
          type,
          click_action: "FLUTTER_NOTIFICATION_CLICK", // For Flutter apps
        },
        priority: "high",
      };
    }

    // Make the request to Firebase
    const response = await axios.post(fcmEndpoint, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${global.config.FIREBASE_SERVER_KEY}`,
      },
    });

    // Log success
    logger.info("Firebase push notification sent successfully", {
      service: "notification",
      type,
      success: response.data.success,
      failure: response.data.failure,
    });

    return response.data.success > 0;
  } catch (error: any) {
    // Log error
    logger.error(
      `Failed to send Firebase push notification: ${error.message}`,
      {
        service: "notification",
        type,
        error: error.response?.data || error.message,
      }
    );

    return false;
  }
};

export default sendPushNotification;
