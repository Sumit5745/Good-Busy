import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  header: string;
  content: string;
  toUser: mongoose.Types.ObjectId;
  fromUser?: mongoose.Types.ObjectId;
  extraData?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema(
  {
    header: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    extraData: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
