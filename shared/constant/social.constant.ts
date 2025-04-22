export const FOLLOW_STATUSES = ['pending', 'accepted', 'rejected'] as const;

export const SOCIAL_VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  BIO_MAX_LENGTH: 500,
};

export const SOCIAL_ERROR_MESSAGES = {
  CANNOT_FOLLOW_YOURSELF: 'You cannot follow yourself.',
  FOLLOW_REQUEST_ALREADY_SENT: 'Follow request already sent.',
  ALREADY_FOLLOWING_USER: 'You are already following this user.',
  INVALID_FOLLOW_REQUEST_ID: 'Invalid follow request ID.',
  FOLLOW_REQUEST_NOT_FOUND: 'Follow request not found.',
  NOT_AUTHORIZED_TO_RESPOND: 'You are not authorized to respond to this follow request.',
  FOLLOW_REQUEST_ALREADY_PROCESSED: 'This follow request has already been processed.',
  USER_NOT_FOUND: 'User not found.',
};

export const SOCIAL_SUCCESS_MESSAGES = {
  FOLLOW_REQUEST_SENT: 'Follow request sent successfully.',
  FOLLOW_REQUEST_ACCEPTED: 'Follow request accepted successfully.',
  FOLLOW_REQUEST_REJECTED: 'Follow request rejected successfully.',
  UNFOLLOWED_SUCCESSFULLY: 'Unfollowed user successfully.',
  FOLLOWERS_RETRIEVED: 'Followers retrieved successfully.',
  FOLLOWING_RETRIEVED: 'Following retrieved successfully.',
  PENDING_REQUESTS_RETRIEVED: 'Pending requests retrieved successfully.',
  SOCIAL_STATS_RETRIEVED: 'Social statistics retrieved successfully.',
}; 