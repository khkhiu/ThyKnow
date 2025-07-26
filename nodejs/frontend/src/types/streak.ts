// ==================================================
// src/types/streak.ts
// TypeScript interfaces for streak data
// ==================================================

export interface WeeklyStreakData {
  current: number;
  longest: number;
  weeksUntilNextMilestone: number;
  nextMilestoneReward: number;
  hasEntryThisWeek: boolean;
  currentWeekId: string;
}

export interface PointsData {
  total: number;
  recentHistory: Array<{
    points: number;
    reason: string;
    streakWeek: number;
    weekId: string;
    date: string;
  }>;
}

export interface StreakApiResponse {
  streak: WeeklyStreakData;
  points: PointsData;
  milestones: Record<string, string>;
}

export interface WeeklyRewardsResponse {
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean;
  isMultipleEntry: boolean;
  weekId: string;
}