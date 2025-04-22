import { Router } from "express";
import { getRecentChats, getChatHistory } from "../controller";
import { chatHistoryValidator } from "../validator/chat.validator";

const routes = Router();

// Get recent conversations for the logged-in user
routes.get("/conversations", getRecentChats);

// Get chat history between logged-in user and another user
routes.get("/history/:receiverId", chatHistoryValidator, getChatHistory);

export default routes; 