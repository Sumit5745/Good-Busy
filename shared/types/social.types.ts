export enum FollowStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface IFollowResponse {
  _id: string;
  follower: string;
  following: string;
  status: FollowStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISocialStats {
  followers: number;
  following: number;
  pendingRequests: number;
  totalConnections: number;
}

export interface IUserSocialProfile {
  userId: string;
  username: string;
  followers: number;
  following: number;
  goals: number;
  completedGoals: number;
  completionRate: number;
}