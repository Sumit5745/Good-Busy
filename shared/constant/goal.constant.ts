export const GOAL_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
export const GOAL_STATUSES = ['active', 'completed', 'missed'] as const;

export const GOAL_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,
};

export const GOAL_ERROR_MESSAGES = {
  INVALID_FREQUENCY: 'Invalid frequency. Must be daily, weekly, or monthly.',
  TITLE_REQUIRED: 'Title is required.',
  DESCRIPTION_REQUIRED: 'Description is required.',
  FREQUENCY_REQUIRED: 'Frequency is required.',
  GOAL_NOT_FOUND: 'Goal not found.',
  NOT_AUTHORIZED: 'You are not authorized to perform this action.',
  ALREADY_COMPLETED: 'Goal is already completed for today.',
};

export const GOAL_SUCCESS_MESSAGES = {
  CREATED: 'Goal created successfully.',
  UPDATED: 'Goal updated successfully.',
  DELETED: 'Goal deleted successfully.',
  COMPLETED: 'Goal marked as complete for today.',
  LIKED: 'Goal liked successfully.',
  THUMBS_DOWN: 'Goal thumbs down recorded successfully.',
}; 