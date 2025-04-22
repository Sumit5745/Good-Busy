import mongoose, { Schema } from "mongoose";

export interface IFollow {
  _id: mongoose.Types.ObjectId;
  follower: mongoose.Types.ObjectId; // The user who is following
  following: mongoose.Types.ObjectId; // The user being followed
  status: string; // pending, accepted, rejected
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
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

// Ensure users can't follow themselves
FollowSchema.pre("save", function (next) {
  if (this.follower.toString() === this.following.toString()) {
    const error = new Error("You cannot follow yourself");
    return next(error);
  }
  next();
});

// Ensure users can't follow the same person twice
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Define a pre-find hook to filter out deleted follows by default
FollowSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

FollowSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

const Follow = mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;
