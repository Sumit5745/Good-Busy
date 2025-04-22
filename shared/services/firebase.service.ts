import admin from "firebase-admin";
import logger from "./logger.service";
import path from "path";
import fs from "fs";

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * This is optional but useful for additional features like topic subscriptions
 */
export const initializeFirebase = () => {
  if (firebaseInitialized) {
    return admin;
  }

  try {
    // Try to find service account file
    const serviceAccountPath = path.join(
      __dirname,
      "../firebase-service-account.json"
    );

    if (fs.existsSync(serviceAccountPath)) {
      // Initialize with service account file
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: global.config.FIREBASE_PROJECT_ID,
      });

      logger.info("Firebase Admin SDK initialized with service account", {
        service: "firebase",
      });
    } else {
      // Initialize with server key only (limited functionality)
      admin.initializeApp({
        projectId: global.config.FIREBASE_PROJECT_ID,
      });

      logger.info("Firebase Admin SDK initialized without service account", {
        service: "firebase",
      });
    }

    firebaseInitialized = true;
    return admin;
  } catch (error: any) {
    logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`, {
      service: "firebase",
      error: error.message,
    });

    throw error;
  }
};

/**
 * Subscribe a device to a topic
 * @param token - Device FCM token
 * @param topic - Topic name
 */
export const subscribeToTopic = async (
  token: string,
  topic: string
): Promise<boolean> => {
  try {
    const firebase = initializeFirebase();
    await firebase.messaging().subscribeToTopic(token, topic);
    logger.info(`Device subscribed to topic: ${topic}`, {
      service: "firebase",
      topic,
    });
    return true;
  } catch (error: any) {
    logger.error(`Failed to subscribe to topic: ${error.message}`, {
      service: "firebase",
      topic,
      error: error.message,
    });
    return false;
  }
};

/**
 * Unsubscribe a device from a topic
 * @param token - Device FCM token
 * @param topic - Topic name
 */
export const unsubscribeFromTopic = async (
  token: string,
  topic: string
): Promise<boolean> => {
  try {
    const firebase = initializeFirebase();
    await firebase.messaging().unsubscribeFromTopic(token, topic);
    logger.info(`Device unsubscribed from topic: ${topic}`, {
      service: "firebase",
      topic,
    });
    return true;
  } catch (error: any) {
    logger.error(`Failed to unsubscribe from topic: ${error.message}`, {
      service: "firebase",
      topic,
      error: error.message,
    });
    return false;
  }
};

/**
 * Send notification to a topic
 * @param topic - Topic name
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data
 */
export const sendTopicNotification = async (
  topic: string,
  title: string,
  body: string,
  data: any = {}
): Promise<boolean> => {
  try {
    const firebase = initializeFirebase();

    await firebase.messaging().send({
      topic,
      notification: {
        title,
        body,
      },
      data: data,
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    });

    logger.info(`Notification sent to topic: ${topic}`, {
      service: "firebase",
      topic,
    });

    return true;
  } catch (error: any) {
    logger.error(`Failed to send topic notification: ${error.message}`, {
      service: "firebase",
      topic,
      error: error.message,
    });

    return false;
  }
};

export default {
  initializeFirebase,
  subscribeToTopic,
  unsubscribeFromTopic,
  sendTopicNotification,
};
