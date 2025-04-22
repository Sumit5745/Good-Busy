import { Request } from "express";
import { 
  getRecentConversations, 
  getConversationMessages
} from "../services/chat.service";
import logger from "../../../shared/services/logger.service";

/**
 * Get recent conversations for the logged-in user
 */
export const getRecentChats = async (req: Request, res: any) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1 } = req.query;
    
    const conversations = await getRecentConversations(
      userId,
      Number(limit),
      Number(page),
      res
    );
    
    return res.status(200).json({
      success: true,
      data: conversations,
      message: res.__("CONVERSATIONS_FETCHED")
    });
  } catch (error: any) {
    logger.error(`Error fetching recent chats: ${error.message}`, {
      service: "chat-ms",
      error
    });
    
    return res.status(500).json({
      success: false,
      message: error.message || res.__("SOMETHING_WENT_WRONG")
    });
  }
};

/**
 * Get conversation history between logged-in user and another user
 */
export const getChatHistory = async (req: Request, res: any) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: res.__("RECEIVER_ID_REQUIRED")
      });
    }
    
    const messages = await getConversationMessages(
      userId,
      receiverId,
      Number(limit),
      Number(page),
      res
    );
    
    return res.status(200).json({
      success: true,
      data: messages,
      message: res.__("CHAT_HISTORY_FETCHED")
    });
  } catch (error: any) {
    logger.error(`Error fetching chat history: ${error.message}`, {
      service: "chat-ms",
      error
    });
    
    return res.status(500).json({
      success: false,
      message: error.message || res.__("SOMETHING_WENT_WRONG")
    });
  }
};