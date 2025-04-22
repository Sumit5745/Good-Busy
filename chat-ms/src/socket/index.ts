import { ChatEvents, MessageStatus } from "../constants/socket.constants";
import logger from "../../../shared/services/logger.service";
import {
  saveMessage,
  markMessageAsRead,
  markMessageAsDeleted,
} from "../services/chat.service";
import { messageValidator } from "../validator/chat.validator";
import mongoose from "mongoose";
import { NotificationService } from "../../../notification-ms/src/services/notification.service";
import { NOTIFICATION_TYPES } from "../../../notification-ms/src/constant/notificationConstant";

interface MessageData {
  receiverId: mongoose.Types.ObjectId;
  content?: string;
  messageType: string;
  mediaUrl?: string;
  userId: mongoose.Types.ObjectId;
}

interface MessageIdData {
  messageId: string;
  userId: mongoose.Types.ObjectId;
}

interface TypingData {
  receiverId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isTyping: boolean
}

const connectedUsers: Record<string, string> = {};

export const socketHandler = (io: any, socket: any) => {
  // Join a personal room for direct messages
  socket.on(ChatEvents.JOIN, (data: { userId: string }) => {
    socket.join(`user:${data.userId}`);
    console.log(`User connected: ${data.userId}`);
    logger.info(`User connected: ${data.userId}`, {
      service: "chat-ms",
      userId: data.userId,
    });
    connectedUsers[socket.id] = data.userId;
  });

  // Handle new private message
  socket.on(ChatEvents.SEND_MESSAGE, async (data: MessageData) => {
    const { userId, receiverId, content, messageType, mediaUrl } = data;
    try {
      // Validate incoming message data
      const { error } = messageValidator.validate(data);
      if (error) {
        return socket.emit(ChatEvents.ERROR, { message: error.message });
      }

      // Save message to database
      const message = await saveMessage({
        senderId: userId,
        receiverId,
        content,
        messageType: messageType as any,
        mediaUrl,
      });

      if (Object.values(connectedUsers).includes(receiverId.toString())) {
        message.status = MessageStatus.DELIVERED
        await message.save()
        io.to(`user:${receiverId}`).emit(ChatEvents.RECEIVE_MESSAGE, message);
      } else {
        await NotificationService.createAndSendNotification(
          receiverId.toString(),
          userId.toString(),
          NOTIFICATION_TYPES.NEW_MESSAGE,
          {
            message: message.content,
            messageId: message._id,
          }
        );
      }

      // Emit back to sender for confirmation
      socket.emit(ChatEvents.MESSAGE_SENT, {
        messageId: message._id,
        status: "sent",
      });
    } catch (error: any) {
      logger.error(`Error sending message: ${error.message}`, {
        service: "chat-ms",
        error,
        userId,
      });
      socket.emit(ChatEvents.ERROR, { message: "Failed to send message" });
    }
  });

  // Handle read receipts
  socket.on(ChatEvents.READ_MESSAGE, async (data: MessageIdData) => {
    const { messageId, userId } = data;
    try {
      const updatedMessage = await markMessageAsRead(messageId);

      if (updatedMessage) {
        io.to(`user:${updatedMessage.senderId}`).emit(ChatEvents.MESSAGE_READ, {
          messageId: updatedMessage._id,
        });
      }
    } catch (error: any) {
      logger.error(`Error marking message as read: ${error.message}`, {
        service: "chat-ms",
        error,
        userId,
      });
    }
  });

  // Handle message deletion
  socket.on(ChatEvents.DELETE_MESSAGE, async (data: MessageIdData) => {
    const { messageId, userId } = data;
    try {
      const deletedMessage = await markMessageAsDeleted(messageId, userId);

      if (deletedMessage) {
        // Notify the other user about message deletion
        io.to(`user:${deletedMessage.receiverId}`).emit(
          ChatEvents.MESSAGE_DELETED,
          {
            messageId: deletedMessage._id,
          }
        );

        // Confirm deletion to sender
        socket.emit(ChatEvents.MESSAGE_DELETED, {
          messageId: deletedMessage._id,
        });
      }
    } catch (error: any) {
      logger.error(`Error deleting message: ${error.message}`, {
        service: "chat-ms",
        error,
        userId,
      });
      socket.emit(ChatEvents.ERROR, { message: "Failed to delete message" });
    }
  });

  // Handle typing indicators
  socket.on(ChatEvents.TYPING, (data: TypingData) => {
    const { receiverId, userId, isTyping } = data;
    io.to(`user:${receiverId}`).emit(ChatEvents.USER_TYPING, { userId, isTyping });
  });

  // Handle user going offline
  socket.on("disconnect", () => {
    const userId = connectedUsers[socket.id];
    if (userId) {
      delete connectedUsers[socket.id];
      console.log(`User ${userId} disconnected`);
    }
    console.log("User disconnected");
  });
};
