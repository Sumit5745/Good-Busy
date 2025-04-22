import mongoose, { Schema } from "mongoose";

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending",
  Deleted = "deleted",
}

// This is a simplified schema just for reference purposes in the social microservice
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
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.Pending,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model but check if it's already registered first
// Note: The model name should be "Users" to match the user-ms microservice
const User = mongoose.models.Users || mongoose.model("Users", userSchema);

export default User;
