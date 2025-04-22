export enum GoalFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
  }
  
  export enum GoalStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    MISSED = 'missed'
  }
  
  export interface IGoalStats {
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    missedGoals: number;
    completionRate: number;
    likes: number;
    thumbsDown: number;
  }
  
  export interface IGoalResponse {
    _id: string;
    title: string;
    description: string;
    frequency: GoalFrequency;
    userId: string;
    status: GoalStatus;
    completionDates: Date[];
    likes: string[];
    thumbsDown: string[];
    createdAt: Date;
    updatedAt: Date;
  }