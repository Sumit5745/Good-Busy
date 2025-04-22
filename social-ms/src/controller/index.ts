import { Request, Response } from "express";
import mongoose from "mongoose";
import Follow from "../models/Follow";
import { StatusCodes } from "http-status-codes";
import logger from "../../../shared/services/logger.service";
import axios from "axios";

/**
 * Send a follow request to another user
 * @param req - Express request object
 * @param res - Express response object
 */
export const sendFollowRequest = async (req: Request, res: Response) => {
  try {
    const followerId = req.user._id;
    const { userId: followingId } = req.body;

    // Check if user is trying to follow themselves
    if (followerId.toString() === followingId.toString()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("CANNOT_FOLLOW_YOURSELF"),
      });
    }

    // Check if the user is already following the target user
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existingFollow) {
      if (existingFollow.status === "pending") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: req.__("FOLLOW_REQUEST_ALREADY_SENT"),
        });
      } else if (existingFollow.status === "accepted") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: req.__("ALREADY_FOLLOWING_USER"),
        });
      } else if (existingFollow.status === "rejected") {
        // If previously rejected, update the status to pending
        existingFollow.status = "pending";
        await existingFollow.save();

        return res.status(StatusCodes.OK).json({
          success: true,
          message: req.__("FOLLOW_REQUEST_SENT_SUCCESSFULLY"),
          data: existingFollow,
        });
      }
    }

    // Create a new follow request
    const newFollow = new Follow({
      follower: followerId,
      following: followingId,
      status: "pending",
    });

    await newFollow.save();

    // Attempt to notify the user about the new follow request
    try {
      // Notification is sent via notification-ms service
      await axios.post(
        `http://localhost:${
          req.app.get("config").services["notification-ms"].PORT
        }/send`,
        {
          userId: followingId,
          type: "follow_request",
          message: "You have a new follow request",
          data: {
            followRequestId: newFollow._id,
          },
        },
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );
    } catch (error) {
      logger.error("Failed to send notification for follow request", {
        service: "social-ms",
        error,
      });
    }

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: req.__("FOLLOW_REQUEST_SENT_SUCCESSFULLY"),
      data: newFollow,
    });
  } catch (error: any) {
    logger.error(`Error sending follow request: ${error.message}`, {
      service: "social-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_SEND_FOLLOW_REQUEST"),
      error: error.message,
    });
  }
};

/**
 * Accept or reject a follow request
 * @param req - Express request object
 * @param res - Express response object
 */
export const respondToFollowRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_FOLLOW_REQUEST_ID"),
      });
    }

    const followRequest = await Follow.findById(id);

    if (!followRequest) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("FOLLOW_REQUEST_NOT_FOUND"),
      });
    }

    // Check if the current user is the one receiving the follow request
    if (followRequest.following.toString() !== userId.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: req.__("NOT_AUTHORIZED_TO_RESPOND_TO_REQUEST"),
      });
    }

    // Check if the request is still pending
    if (followRequest.status !== "pending") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("FOLLOW_REQUEST_ALREADY_PROCESSED"),
      });
    }

    // Update the status of the follow request
    followRequest.status = status;
    await followRequest.save();

    // Attempt to notify the user about the follow request response
    try {
      // Notification is sent via notification-ms service
      await axios.post(
        `http://localhost:${
          req.app.get("config").services["notification-ms"].PORT
        }/send`,
        {
          userId: followRequest.follower,
          type: status === "accepted" ? "follow_accepted" : "follow_rejected",
          message:
            status === "accepted"
              ? "Your follow request has been accepted"
              : "Your follow request has been rejected",
          data: {
            followRequestId: followRequest._id,
          },
        },
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );
    } catch (error) {
      logger.error("Failed to send notification for follow response", {
        service: "social-ms",
        error,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message:
        status === "accepted"
          ? req.__("FOLLOW_REQUEST_ACCEPTED")
          : req.__("FOLLOW_REQUEST_REJECTED"),
      data: followRequest,
    });
  } catch (error: any) {
    logger.error(`Error responding to follow request: ${error.message}`, {
      service: "social-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RESPOND_TO_REQUEST"),
      error: error.message,
    });
  }
};

/**
 * Unfollow a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_USER_ID"),
      });
    }

    // Find the follow relationship
    const follow = await Follow.findOne({
      follower: userId,
      following: id,
      status: "accepted",
    });

    if (!follow) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("NOT_FOLLOWING_USER"),
      });
    }

    // Soft delete by setting isDeleted flag
    follow.isDeleted = true;
    await follow.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("UNFOLLOWED_USER_SUCCESSFULLY"),
    });
  } catch (error: any) {
    logger.error(`Error unfollowing user: ${error.message}`, {
      service: "social-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_UNFOLLOW_USER"),
      error: error.message,
    });
  }
};

/**
 * Get the current user's followers
 * @param req - Express request object
 * @param res - Express response object
 */
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Find all users who are following the current user
    const followers = await Follow.find({
      following: userId,
      status: "accepted",
      isDeleted: false,
    })
      .populate("follower", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({
      following: userId,
      status: "accepted",
      isDeleted: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("FOLLOWERS_RETRIEVED_SUCCESSFULLY"),
      data: {
        followers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error retrieving followers: ${error.message}`, {
      service: "social-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RETRIEVE_FOLLOWERS"),
      error: error.message,
    });
  }
};

/**
 * Get users the current user is following
 * @param req - Express request object
 * @param res - Express response object
 */
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Find all users the current user is following
    const following = await Follow.find({
      follower: userId,
      status: "accepted",
      isDeleted: false,
    })
      .populate("following", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({
      follower: userId,
      status: "accepted",
      isDeleted: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("FOLLOWING_RETRIEVED_SUCCESSFULLY"),
      data: {
        following,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error retrieving following: ${error.message}`, {
      service: "social-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RETRIEVE_FOLLOWING"),
      error: error.message,
    });
  }
};

/**
 * Get pending follow requests for the current user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Find all pending follow requests for the current user
    const pendingRequests = await Follow.find({
      following: userId,
      status: "pending",
      isDeleted: false,
    })
      .populate("follower", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({
      following: userId,
      status: "pending",
      isDeleted: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("PENDING_REQUESTS_RETRIEVED_SUCCESSFULLY"),
      data: {
        pendingRequests,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error retrieving pending requests: ${error.message}`, {
      service: "social-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RETRIEVE_PENDING_REQUESTS"),
      error: error.message,
    });
  }
};

/**
 * Get social stats for a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUserSocialStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_USER_ID"),
      });
    }

    // Count the number of followers (users who are following this user)
    const followersCount = await Follow.countDocuments({
      following: userId,
      status: "accepted",
    });

    // Count the number of users this user is following
    const followingCount = await Follow.countDocuments({
      follower: userId,
      status: "accepted",
    });

    // Check if the current user is following the target user
    let isFollowing = false;
    let followStatus: string | null = null;

    if (req.user && req.user._id !== userId) {
      const follow = await Follow.findOne({
        follower: req.user._id,
        following: userId,
      });

      if (follow) {
        isFollowing = follow.status === "accepted";
        followStatus = follow.status;
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("USER_SOCIAL_STATS_RETRIEVED_SUCCESSFULLY"),
      data: {
        followers: followersCount,
        following: followingCount,
        isFollowing,
        followStatus,
      },
    });
  } catch (error: any) {
    logger.error(`Error retrieving user social stats: ${error.message}`, {
      service: "social-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RETRIEVE_USER_SOCIAL_STATS"),
      error: error.message,
    });
  }
};
