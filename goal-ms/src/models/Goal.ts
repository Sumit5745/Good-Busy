import mongoose, { Schema, Query, Document } from "mongoose";

// Define a user structure for populated user data
export interface UserPopulated {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: mongoose.Types.ObjectId | null;
}

export interface IGoal {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  frequency: string;
  privacy: string;
  userId: mongoose.Types.ObjectId;
  status: string;
  completionDates: Date[];
  likes: mongoose.Types.ObjectId[];
  thumbsDown: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  user?: UserPopulated; // Use the defined type for populated user data
}

const GoalSchema = new Schema<IGoal>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },
    privacy: {
      type: String,
      enum: ["public", "private", "followers"],
      default: "followers",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "missed"],
      default: "active",
    },
    completionDates: [
      {
        type: Date,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    thumbsDown: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Define a pre-find hook to filter out deleted goals by default
GoalSchema.pre("find", function (this: Query<any, Document<any, any, any>>) {
  this.where({ isDeleted: false });
});

GoalSchema.pre("findOne", function (this: Query<any, Document<any, any, any>>) {
  this.where({ isDeleted: false });
});

GoalSchema.pre(/^find/, function (this: Query<any, Document<any, any, any>>) {
  this.where({ isDeleted: false });
});

const Goal = mongoose.model<IGoal>("Goal", GoalSchema);

export default Goal;
