import { Request, Response } from "express";
import mongoose from "mongoose";
import Goal from "../models/Goal";
import { StatusCodes } from "http-status-codes";
import logger from "../../../shared/services/logger.service";
import { emailSender } from "../../../shared/services/sendMail.service";
import { EMAIL_CONSTANT } from "../../../auth-ms/src/constant/emailContant";
import { NotificationService } from "../../../notification-ms/src/services/notification.service";
import { NOTIFICATION_TYPES } from "../../../notification-ms/src/constant/notificationConstant";

/**
 * Create a new goal
 * @param req - Express request object
 * @param res - Express response object
 */
export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { title, description, frequency, privacy = "followers" } = req.body;

    const newGoal = new Goal({
      title,
      description,
      frequency,
      privacy,
      userId,
    });

    await newGoal.save();

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: req.__("GOAL_CREATED_SUCCESSFULLY"),
      data: newGoal,
    });
  } catch (error: any) {
    logger.error(`Error creating goal: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_CREATE_GOAL"),
      error: error.message,
    });
  }
};

/**
 * Get all goals for the current user or all goals if filter is specified
 * @param req - Express request object
 * @param res - Express response object
 */
export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, filter, frequency } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    // Handle different filters for goals
    if (filter === "my") {
      // Show only the user's own goals
      query.userId = userId;
    } else if (filter === "all") {
      // For 'all' filter, show:
      // 1. Public goals from everyone
      // 2. User's own goals (regardless of privacy)
      // 3. Goals with "followers" privacy where the user follows the creator
      query.$or = [
        { privacy: "public" },
        { userId: userId },
        // For now, show all 'followers' goals in development mode
        // In production, you would filter by followed users
        { privacy: "followers" },
      ];
    } else {
      // Default behavior - show:
      // 1. User's own goals (regardless of privacy)
      // 2. Public goals from others
      // 3. Goals with "followers" privacy where the user follows the creator
      query.$or = [
        { userId: userId },
        { privacy: "public", userId: { $ne: userId } },
        // For now, show all 'followers' goals in development mode
        // In production, you would filter by followed users
        { privacy: "followers" },
      ];
    }

    // Filter by frequency if specified
    if (frequency) {
      query.frequency = frequency;
    }

    // First get goals without population to avoid errors
    const goals = await Goal.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Safely populate user data
    const populatedGoals: any[] = []; // Use any[] to allow adding user property
    for (const goal of goals) {
      try {
        // Convert Mongoose document to plain object
        const goalObj: any = goal.toObject(); // Use any to allow adding user property
        // Try to fetch user data
        if (goalObj.userId) {
          const userData = await mongoose
            .model("Users")
            .findById(goalObj.userId)
            .select("firstName lastName email profileImage")
            .lean();

          if (userData) {
            goalObj.user = userData;
          } else {
            goalObj.user = {
              firstName: "Unknown",
              lastName: "User",
              email: "",
              profileImage: null,
            };
          }
        }
        populatedGoals.push(goalObj);
      } catch (err: any) {
        // If population fails, add the goal without user data
        logger.error(`Error populating user data: ${err.message}`);
        populatedGoals.push(goal.toObject());
      }
    }

    const total = await Goal.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("GOALS_RETRIEVED_SUCCESSFULLY"),
      data: {
        goals: populatedGoals,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error(`Error retrieving goals: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RETRIEVE_GOALS"),
      error: error.message,
    });
  }
};

/**
 * Helper function to check if a user can see goals with 'followers' privacy
 * @param viewerId - The ID of the user trying to view the goal
 * @param creatorId - The ID of the goal creator
 * @returns Promise<boolean> - Whether the viewer can see the goal
 */
const canViewFollowersGoal = async (
  viewerId: string,
  creatorId: string
): Promise<boolean> => {
  try {
    // In a real app, you would check if viewerId follows creatorId
    // This is a placeholder implementation
    // You would need to implement your social relationship checks here

    // Example implementation (uncomment when you have a social relationship service):
    // const isFollowing = await SocialService.checkFollowing(viewerId, creatorId);
    // return isFollowing;

    // For development, we'll just return true to allow access
    return true;
  } catch (error: unknown) {
    // Safe error message extraction
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(`Error checking followers relationship: ${errorMessage}`);
    // Default to false for security if there's an error
    return false;
  }
};

/**
 * Get a specific goal by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getGoalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_GOAL_ID"),
      });
    }

    // Find goal without population first
    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("GOAL_NOT_FOUND"),
      });
    }

    // Convert to object for manipulation
    const goalObj: any = goal.toObject(); // Use any to allow adding user property

    // Try to fetch and add user data
    try {
      if (goalObj.userId) {
        const userData = await mongoose
          .model("Users")
          .findById(goalObj.userId)
          .select("firstName lastName email profileImage")
          .lean();

        if (userData) {
          goalObj.user = userData;
        } else {
          goalObj.user = {
            firstName: "Unknown",
            lastName: "User",
            email: "",
            profileImage: null,
          };
        }
      }
    } catch (err: any) {
      // Continue even if user data fetch fails
      logger.error(`Error fetching user data: ${err.message}`);
    }

    // Check if the user has permission to view this goal based on privacy
    const isOwner = goalObj.userId.toString() === userId.toString();

    if (!isOwner) {
      // If not the owner, check privacy settings
      if (goalObj.privacy === "private") {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: req.__("NOT_AUTHORIZED_TO_VIEW_GOAL"),
        });
      }

      if (goalObj.privacy === "followers") {
        const canView = await canViewFollowersGoal(
          userId.toString(),
          goalObj.userId.toString()
        );
        if (!canView) {
          return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: req.__("MUST_FOLLOW_USER_TO_VIEW_GOAL"),
          });
        }
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("GOAL_RETRIEVED_SUCCESSFULLY"),
      data: goalObj,
    });
  } catch (error: any) {
    logger.error(`Error retrieving goal: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RETRIEVE_GOAL"),
      error: error.message,
    });
  }
};

/**
 * Update a goal
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, description, frequency, privacy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_GOAL_ID"),
      });
    }

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("GOAL_NOT_FOUND"),
      });
    }

    // Check if the user is the owner of the goal
    if (goal.userId.toString() !== userId.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: req.__("NOT_AUTHORIZED_TO_UPDATE_GOAL"),
      });
    }

    // Update the goal
    const updatedGoal = await Goal.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title || goal.title,
          description: description || goal.description,
          frequency: frequency || goal.frequency,
          privacy: privacy || goal.privacy,
        },
      },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("GOAL_UPDATED_SUCCESSFULLY"),
      data: updatedGoal,
    });
  } catch (error: any) {
    logger.error(`Error updating goal: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_UPDATE_GOAL"),
      error: error.message,
    });
  }
};

/**
 * Delete a goal (soft delete)
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_GOAL_ID"),
      });
    }

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("GOAL_NOT_FOUND"),
      });
    }

    // Check if the user is the owner of the goal
    if (goal.userId.toString() !== userId.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: req.__("NOT_AUTHORIZED_TO_DELETE_GOAL"),
      });
    }

    // Soft delete by setting isDeleted to true
    await Goal.findByIdAndUpdate(id, { $set: { isDeleted: true } });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("GOAL_DELETED_SUCCESSFULLY"),
    });
  } catch (error: any) {
    logger.error(`Error deleting goal: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_DELETE_GOAL"),
      error: error.message,
    });
  }
};

/**
 * Like a goal
 * @param req - Express request object
 * @param res - Express response object
 */
export const likeGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_GOAL_ID"),
      });
    }

    const goal = await Goal.findById(new mongoose.Types.ObjectId(id));

    if (!goal) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("GOAL_NOT_FOUND"),
      });
    }

    // Check if the user has already liked or disliked this goal
    const isLiked = goal.likes.some(
      (id) => id.toString() === userId.toString()
    );

    const isDisliked = goal.thumbsDown.some(
      (id) => id.toString() === userId.toString()
    );

    let message;

    if (isLiked) {
      // If already liked, remove the like (toggle off)
      await Goal.findByIdAndUpdate(id, {
        $pull: { likes: userId },
      });
      message = req.__("LIKE_REMOVED_SUCCESSFULLY");
    } else {
      // If not liked yet, add the like
      // Also remove from thumbsDown if it exists
      await Goal.findByIdAndUpdate(id, {
        $addToSet: { likes: userId },
        $pull: { thumbsDown: userId },
      });

      message = isDisliked
        ? req.__("DISLIKE_REMOVED_AND_LIKED_SUCCESSFULLY")
        : req.__("GOAL_LIKED_SUCCESSFULLY");
    }

    const updatedGoal = await Goal.findById(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data: {
        likes: updatedGoal?.likes.length,
        thumbsDown: updatedGoal?.thumbsDown.length,
        isLiked: !isLiked, // Toggle the like status
        isThumbsDown: false, // Can't be both liked and thumbs down
      },
    });
  } catch (error: any) {
    logger.error(`Error liking goal: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_LIKE_GOAL"),
      error: error.message,
    });
  }
};

/**
 * Thumbs down a goal
 * @param req - Express request object
 * @param res - Express response object
 */
export const thumbsDownGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_GOAL_ID"),
      });
    }

    const goal = await Goal.findById(new mongoose.Types.ObjectId(id));

    if (!goal) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("GOAL_NOT_FOUND"),
      });
    }

    // Check if the user has already liked or disliked this goal
    const isThumbsDown = goal.thumbsDown.some(
      (id) => id.toString() === userId.toString()
    );

    const isLiked = goal.likes.some(
      (id) => id.toString() === userId.toString()
    );

    let message;

    if (isThumbsDown) {
      // If already disliked, remove the dislike (toggle off)
      await Goal.findByIdAndUpdate(id, {
        $pull: { thumbsDown: userId },
      });
      message = req.__("THUMBS_DOWN_REMOVED_SUCCESSFULLY");
    } else {
      // If not disliked yet, add the dislike
      // Also remove from likes if it exists
      await Goal.findByIdAndUpdate(id, {
        $addToSet: { thumbsDown: userId },
        $pull: { likes: userId },
      });

      message = isLiked
        ? req.__("LIKE_REMOVED_AND_DISLIKED_SUCCESSFULLY")
        : req.__("GOAL_THUMBS_DOWN_SUCCESSFULLY");
    }

    const updatedGoal = await Goal.findById(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data: {
        likes: updatedGoal?.likes.length,
        thumbsDown: updatedGoal?.thumbsDown.length,
        isLiked: false, // Can't be both liked and thumbs down
        isThumbsDown: !isThumbsDown, // Toggle the thumbs down status
      },
    });
  } catch (error: any) {
    logger.error(`Error thumbs down goal: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_THUMBS_DOWN_GOAL"),
      error: error.message,
    });
  }
};

/**
 * Mark a goal as completed for today
 * @param req - Express request object
 * @param res - Express response object
 */
export const completeGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("INVALID_GOAL_ID"),
      });
    }

    const goal = await Goal.findById(id);

    if (!goal) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("GOAL_NOT_FOUND"),
      });
    }

    // Check if the user is the owner of the goal
    if (goal.userId.toString() !== userId.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: req.__("NOT_AUTHORIZED_TO_COMPLETE_GOAL"),
      });
    }

    // Check if goal already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isCompletedToday = goal.completionDates.some((date) => {
      const completedDate = new Date(date);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });

    if (isCompletedToday) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("GOAL_ALREADY_COMPLETED_TODAY"),
      });
    }

    // Add today to completionDates
    await Goal.findByIdAndUpdate(id, {
      $push: { completionDates: new Date() },
    });

    const updatedGoal = await Goal.findById(id);

    // Get user details to send notification
    const user = await mongoose.model("Users").findById(userId);

    // Send in-app notification
    try {
      await NotificationService.createAndSendNotification(
        userId.toString(),
        undefined,
        NOTIFICATION_TYPES.GOAL_COMPLETED,
        { goalId: id }
      );

      // Send email notification for goal completion
      await emailSender(
        user.email,
        EMAIL_CONSTANT.GOAL_COMPLETED_EMAIL.subject,
        {
          firstName: user.firstName,
          goalTitle: goal.title,
          goalDescription: goal.description,
        },
        EMAIL_CONSTANT.GOAL_COMPLETED_EMAIL.templateName
      );

      logger.info(`Goal completion notification sent to user ${userId}`, {
        service: "goal-ms",
        goalId: id,
      });
    } catch (notificationError: any) {
      // Log error but don't fail the completion process
      logger.error(
        `Error sending goal completion notification: ${notificationError.message}`,
        {
          service: "goal-ms",
          error: notificationError,
        }
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("GOAL_MARKED_AS_COMPLETE"),
      data: updatedGoal,
    });
  } catch (error: any) {
    logger.error(`Error completing goal: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_COMPLETE_GOAL"),
      error: error.message,
    });
  }
};

/**
 * Get goal statistics
 * @param req - Express request object
 * @param res - Express response object
 */
export const getGoalStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Total goals created by the user
    const totalGoals = await Goal.countDocuments({ userId, isDeleted: false });

    // Total goals completed at least once
    const completedGoals = await Goal.countDocuments({
      userId,
      isDeleted: false,
      completionDates: { $exists: true, $ne: [] },
    });

    // Goals completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await Goal.countDocuments({
      userId,
      isDeleted: false,
      completionDates: {
        $elemMatch: {
          $gte: today,
          $lt: tomorrow,
        },
      },
    });

    // Completion rate
    const completionRate =
      totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Streak calculation - days in a row with completed goals
    let currentStreak = 0;
    let maxStreak = 0;

    // Get all the user's goals
    const userGoals = await Goal.find({ userId, isDeleted: false });

    // Collect all completion dates and sort them
    const allCompletionDates = userGoals.reduce((dates: Date[], goal) => {
      return [...dates, ...goal.completionDates];
    }, []);

    if (allCompletionDates.length > 0) {
      // Convert to date strings (YYYY-MM-DD) for easy comparison
      const dateStrings = allCompletionDates.map((date: Date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      });

      // Get unique dates
      const uniqueDates = [...new Set(dateStrings)].sort();

      // Calculate streak
      let streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const prevDate = new Date(uniqueDates[i - 1]);

        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streak++;
        } else {
          maxStreak = Math.max(maxStreak, streak);
          streak = 1;
        }
      }

      maxStreak = Math.max(maxStreak, streak);

      // Check if the last date is today to determine current streak
      const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
      const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

      if (uniqueDates[uniqueDates.length - 1] === todayStr) {
        currentStreak = streak;
      } else {
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak = streak;
        } else {
          currentStreak = 0;
        }
      }
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("GOAL_STATISTICS_RETRIEVED_SUCCESSFULLY"),
      data: {
        totalGoals,
        completedGoals,
        completedToday,
        completionRate: Math.round(completionRate),
        currentStreak,
        maxStreak,
      },
    });
  } catch (error: any) {
    logger.error(`Error retrieving goal statistics: ${error.message}`, {
      service: "goal-ms",
      error,
    });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("FAILED_TO_RETRIEVE_GOAL_STATISTICS"),
      error: error.message,
    });
  }
};
