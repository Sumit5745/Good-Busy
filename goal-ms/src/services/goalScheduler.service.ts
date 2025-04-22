import cron from "node-cron";
import mongoose from "mongoose";
import Goal from "../models/Goal";
import logger from "../../../shared/services/logger.service";
import { emailSender } from "../../../shared/services/sendMail.service";
import { EMAIL_CONSTANT } from "../../../auth-ms/src/constant/emailContant";
import { NotificationService } from "../../../notification-ms/src/services/notification.service";
import { NOTIFICATION_TYPES } from "../../../notification-ms/src/constant/notificationConstant";

/**
 * Calculate streak for a goal based on completion dates
 * @param completionDates Array of dates when the goal was completed
 * @returns Current streak count
 */
const calculateStreak = (completionDates: Date[]): number => {
  if (!completionDates.length) return 0;

  // Sort dates in descending order
  const sortedDates = [...completionDates].sort(
    (a, b) => b.getTime() - a.getTime()
  );

  let streak = 1;
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Start from the most recent date
  let currentDate = new Date(sortedDates[0]);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);

    // Check if the previous date is exactly one day before current date
    const diffDays = (currentDate.getTime() - prevDate.getTime()) / oneDayMs;

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      // Streak is broken
      break;
    }
  }

  return streak;
};

/**
 * Send goal reminders to users
 */
const sendGoalReminders = async () => {
  try {
    logger.info("Starting daily goal reminders job", { service: "goal-ms" });

    // Get all active users who have goals
    const usersWithGoals = await Goal.find({ isDeleted: false }).distinct(
      "userId"
    );

    // For each user, get their active goals and send a reminder
    for (const userId of usersWithGoals) {
      try {
        // Get user details
        const user = await mongoose.model("Users").findById(userId);
        if (!user || user.status !== "active") continue;

        // Get active goals for this user
        const goals = await Goal.find({
          userId,
          isDeleted: false,
        });

        if (!goals.length) continue;

        // Transform goals for email template
        const goalsForEmail = goals.map((goal) => {
          const currentStreak = calculateStreak(goal.completionDates);
          return {
            title: goal.title,
            description: goal.description,
            frequency: goal.frequency,
            currentStreak,
          };
        });

        // Send email reminder
        await emailSender(
          user.email,
          EMAIL_CONSTANT.GOAL_REMINDER_EMAIL.subject,
          {
            firstName: user.firstName,
            goals: goalsForEmail,
          },
          EMAIL_CONSTANT.GOAL_REMINDER_EMAIL.templateName
        );

        logger.info(`Goal reminder email sent to ${user.email}`, {
          service: "goal-ms",
          userId: user._id,
        });
      } catch (userError: any) {
        logger.error(
          `Error sending goal reminder to user ${userId}: ${userError.message}`,
          {
            service: "goal-ms",
            error: userError,
          }
        );
        // Continue with next user
      }
    }

    logger.info("Daily goal reminders job completed", { service: "goal-ms" });
  } catch (error: any) {
    logger.error(`Error in goal reminder job: ${error.message}`, {
      service: "goal-ms",
      error,
    });
  }
};

/**
 * Check for goal streaks and send streak notifications
 */
const checkAndSendStreakNotifications = async () => {
  try {
    logger.info("Starting goal streak check job", { service: "goal-ms" });

    // Get all active goals
    const goals = await Goal.find({
      isDeleted: false,
      completionDates: { $exists: true, $not: { $size: 0 } },
    });

    // Key streak milestones to notify about
    const streakMilestones = [7, 14, 30, 60, 90, 180, 365];

    for (const goal of goals) {
      try {
        // Calculate current streak
        const streak = calculateStreak(goal.completionDates);

        // Check if this streak matches any of our milestone values
        if (streak > 0 && streakMilestones.includes(streak)) {
          // Get user details
          const user = await mongoose.model("Users").findById(goal.userId);
          if (!user || user.status !== "active") continue;

          // Send streak achievement email
          await emailSender(
            user.email,
            EMAIL_CONSTANT.GOAL_STREAK_EMAIL.subject,
            {
              firstName: user.firstName,
              goalTitle: goal.title,
              streakDays: streak,
            },
            EMAIL_CONSTANT.GOAL_STREAK_EMAIL.templateName
          );

          // Also send in-app notification
          await NotificationService.createAndSendNotification(
            user._id.toString(),
            undefined,
            "GOAL_STREAK" as any, // This might need to be added to notification constants
            {
              goalId: goal._id.toString(),
              streak: streak,
            }
          );

          logger.info(
            `Streak notification sent for goal ${goal._id}, streak: ${streak}`,
            {
              service: "goal-ms",
              userId: user._id,
            }
          );
        }
      } catch (goalError: any) {
        logger.error(
          `Error processing streak for goal ${goal._id}: ${goalError.message}`,
          {
            service: "goal-ms",
            error: goalError,
          }
        );
        // Continue with next goal
      }
    }

    logger.info("Goal streak check job completed", { service: "goal-ms" });
  } catch (error: any) {
    logger.error(`Error in goal streak job: ${error.message}`, {
      service: "goal-ms",
      error,
    });
  }
};

/**
 * Initialize all goal-related scheduled jobs
 */
export const initGoalScheduler = () => {
  // Run daily at 8:00 AM
  cron.schedule("0 8 * * *", sendGoalReminders);

  // Run daily at midnight to check streaks
  cron.schedule("0 0 * * *", checkAndSendStreakNotifications);

  logger.info("Goal scheduler initialized", { service: "goal-ms" });
};
