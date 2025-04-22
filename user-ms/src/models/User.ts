import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  profileImage?: mongoose.Types.ObjectId; // File ID
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  otp: number | null;
  otpExpireTime: Date | null;
  role: string;
  currentRole: string;
  status: string;
  deviceId: string; // Legacy field for backwards compatibility
  fcmTokens: string[]; // New field for Firebase Cloud Messaging tokens
  merchantAccountId: string;
  deleteReason: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  User = "user",
  Admin = "admin",
}

export enum UserCurrentRole {
  User = "user",
  Owner = "admin",
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending",
  Deleted = "deleted",
}

const userSchema = new Schema(
  {
    profileImage: {
      type: Schema.Types.ObjectId,
      ref: "File",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
    },
    otpExpireTime: {
      type: Date,
    },
    role: {
      type: String,
      enum: [...Object.values(UserRole)],
      default: UserRole.User,
    },
    currentRole: {
      type: String,
      enum: [...Object.values(UserCurrentRole)],
      default: UserCurrentRole.User,
    },
    status: {
      type: String,
      enum: [...Object.values(UserStatus)],
      default: UserStatus.Pending,
    },
    deviceId: {
      type: String,
    },
    fcmTokens: [
      {
        type: String,
        trim: true,
      },
    ],
    deleteReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("Users", userSchema);
