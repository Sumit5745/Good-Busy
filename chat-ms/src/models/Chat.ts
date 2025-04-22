import mongoose, { Document, Schema } from "mongoose";
import { MessageStatus, MessageType } from "../constants/socket.constants";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  messageType: MessageType;
  mediaUrl?: string;
  status: MessageStatus;
  readAt?: Date;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === MessageType.TEXT;
      },
    },
    messageType: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    mediaUrl: {
      type: String,
      required: function () {
        return this.messageType !== MessageType.TEXT;
      },
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

// Adding a virtual for conversationId (combining sender and receiver IDs)
messageSchema.virtual("conversationId").get(function () {
  const ids = [this.senderId.toString(), this.receiverId.toString()].sort();
  return ids.join("_");
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
