export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_MODIFIED: "BOOKING_MODIFIED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_APPROVED: "BOOKING_APPROVED",
  BOOKING_REJECTED: "BOOKING_REJECTED",
  AFFILIATE_APPROVED: "AFFILIATE_APPROVED",
  AFFILIATE_REJECTED: "AFFILIATE_REJECTED",
  BOOKING_READY_FOR_PAYMENT: "BOOKING_READY_FOR_PAYMENT",
  BOOKING_COMPLETED: "BOOKING_COMPLETED",
  NEW_MESSAGE: "NEW_MESSAGE",
  GOAL_STREAK: "GOAL_STREAK",
  GOAL_REMINDER: "GOAL_REMINDER",
  GOAL_COMPLETED: "GOAL_COMPLETED",
} as const;

export const NOTIFICATION_MESSAGES = {
  [NOTIFICATION_TYPES.BOOKING_CREATED]: {
    header: "New Booking Request",
    content: "You have received a new booking request for your boat",
  },
  [NOTIFICATION_TYPES.BOOKING_MODIFIED]: {
    header: "Booking Modified",
    content: "A booking for your boat has been modified",
  },
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]: {
    header: "Booking Cancelled",
    content: "A booking for your boat has been cancelled",
  },
  [NOTIFICATION_TYPES.BOOKING_APPROVED]: {
    header: "Booking Approved",
    content: "Your booking request has been approved",
  },
  [NOTIFICATION_TYPES.BOOKING_REJECTED]: {
    header: "Booking Rejected",
    content: "Your booking request has been rejected",
  },
  [NOTIFICATION_TYPES.AFFILIATE_APPROVED]: {
    header: "Affiliate Application Approved",
    content: "Congratulations! Your affiliate application has been approved.",
  },
  [NOTIFICATION_TYPES.AFFILIATE_REJECTED]: {
    header: "Affiliate Application Update",
    content:
      "Your affiliate application has been reviewed and could not be approved at this time.",
  },
  [NOTIFICATION_TYPES.BOOKING_READY_FOR_PAYMENT]: {
    header: "Booking Ready for Payment",
    content: "Your booking is ready for payment",
  },
  [NOTIFICATION_TYPES.BOOKING_COMPLETED]: {
    header: "Booking Completed",
    content: "Your booking has been completed",
  },
  [NOTIFICATION_TYPES.NEW_MESSAGE]: {
    header: "New Message",
    content: (from: string) => `You have a new message from ${from}`,
  },
  [NOTIFICATION_TYPES.GOAL_STREAK]: {
    header: "Goal Streak Achievement",
    content: (days: string) =>
      `You've achieved a ${days}-day streak on your goal!`,
  },
  [NOTIFICATION_TYPES.GOAL_REMINDER]: {
    header: "Goal Reminder",
    content: "Don't forget to work on your goals today!",
  },
  [NOTIFICATION_TYPES.GOAL_COMPLETED]: {
    header: "Goal Completed",
    content: "Congratulations! You've completed your goal for today.",
  },
} as const;

export const NOTIFICATION_HEADERS = {
  [NOTIFICATION_TYPES.BOOKING_CREATED]: "New Booking Request",
  [NOTIFICATION_TYPES.BOOKING_MODIFIED]: "Booking Modified",
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]: "Booking Cancelled",
  [NOTIFICATION_TYPES.BOOKING_APPROVED]: "Booking Approved",
  [NOTIFICATION_TYPES.BOOKING_REJECTED]: "Booking Rejected",
  [NOTIFICATION_TYPES.AFFILIATE_APPROVED]: "Affiliate Application Approved",
  [NOTIFICATION_TYPES.AFFILIATE_REJECTED]: "Affiliate Application Update",
  [NOTIFICATION_TYPES.BOOKING_READY_FOR_PAYMENT]: "Booking Ready for Payment",
  [NOTIFICATION_TYPES.BOOKING_COMPLETED]: "Booking Completed",
  [NOTIFICATION_TYPES.NEW_MESSAGE]: "New Message",
  [NOTIFICATION_TYPES.GOAL_STREAK]: "Goal Streak Achievement",
  [NOTIFICATION_TYPES.GOAL_REMINDER]: "Goal Reminder",
  [NOTIFICATION_TYPES.GOAL_COMPLETED]: "Goal Completed",
} as const;
