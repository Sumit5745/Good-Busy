export enum ChatEvents {
  SEND_MESSAGE = "send_message",
  RECEIVE_MESSAGE = "receive_message",
  MESSAGE_SENT = "message_sent",
  READ_MESSAGE = "read_message",
  MESSAGE_READ = "message_read",
  DELETE_MESSAGE = "delete_message", 
  MESSAGE_DELETED = "message_deleted",
  TYPING = "typing",
  USER_TYPING = "user_typing",
  ERROR = "error",
  JOIN = "join",
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  AUDIO = "audio"
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  DELETED = "deleted"
} 