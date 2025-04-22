import mongoose from "mongoose";
import Message, { IMessage } from "../models/Chat";
import { MessageStatus, MessageType } from "../constants/socket.constants";
import logger from "../../../shared/services/logger.service";

interface MessageInput {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content?: string;
  messageType: MessageType;
  mediaUrl?: string;
}

/**
 * Save a new message to the database
 */
// @ts-ignore - res parameter is used in error throwing
export const saveMessage = async (
  messageData: MessageInput,
  res?: any
): Promise<IMessage> => {
  try {
    const message = new Message({
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      messageType: messageData.messageType,
      mediaUrl: messageData.mediaUrl,
      status: MessageStatus.SENT,
    });

    await message.save();
    return message;
  } catch (error: any) {
    logger.error(`Error saving message: ${error.message}`, {
      service: "chat-ms",
      error,
    });
    throw error;
  }
};

/**
 * Mark a message as read and update the readAt timestamp
 */
// @ts-ignore - res parameter is used in error handling
export const markMessageAsRead = async (
  messageId: string,
  res?: any
): Promise<IMessage | null> => {
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        status: MessageStatus.READ,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      throw new Error(res.__("MESSAGE_NOT_FOUND"));
    }

    return message;
  } catch (error: any) {
    logger.error(`Error marking message as read: ${error.message}`, {
      service: "chat-ms",
      error,
    });
    throw error;
  }
};

/**
 * Mark a message as deleted (soft delete)
 */
// @ts-ignore - res parameter is used in error handling
export const markMessageAsDeleted = async (
  messageId: string,
  userId: mongoose.Types.ObjectId,
  res?: any
): Promise<IMessage | null> => {
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        status: MessageStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
      },
      { new: true }
    );

    if (!message) {
      throw new Error(res.__("MESSAGE_NOT_FOUND"));
    }

    return message;
  } catch (error: any) {
    logger.error(`Error deleting message: ${error.message}`, {
      service: "chat-ms",
      error,
    });
    throw error;
  }
};

/**
 * Get recent conversations for a user
 */
// @ts-ignore - res parameter is used in error handling
export const getRecentConversations = async (
  userId: string,
  limit: number = 20,
  page: number = 1,
  res?: any
): Promise<any> => {
  try {
    const skip = (page - 1) * limit;

    // Find the most recent message for each unique conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
          deletedAt: null,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "user.avatar",
          foreignField: "_id",
          as: "avatarFile",
        },
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          user: {
            _id: { $arrayElemAt: ["$user._id", 0] },
            username: { $arrayElemAt: ["$user.username", 0] },
            avatarUrl: {
              $cond: [
                { $gt: [{ $size: "$avatarFile" }, 0] },
                {
                  $concat: [
                    global.config.FILE_BASE_URL,
                    { $arrayElemAt: ["$avatarFile.location", 0] },
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    ]);

    return conversations;
  } catch (error: any) {
    logger.error(`Error fetching recent conversations: ${error.message}`, {
      service: "chat-ms",
      error,
    });
    throw new Error(res.__("CONVERSATIONS_FETCH_FAILED"));
  }
};

/**
 * Get messages between two users with pagination
 */
export const getConversationMessages = async (
  userId: string,
  receiverId: string,
  limit: number = 20,
  page: number = 1,
  res: any
): Promise<IMessage[]> => {
  try {
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return messages;
  } catch (error: any) {
    logger.error(`Error fetching conversation messages: ${error.message}`, {
      service: "chat-ms",
      error,
    });
    throw new Error(res.__("CHAT_HISTORY_FETCH_FAILED"));
  }
};
