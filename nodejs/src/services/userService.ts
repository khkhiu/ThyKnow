// File: src/services/userService.ts (Updated for Weekly Streaks)
// User service with PostgreSQL and Weekly Streak System support

import { User, IUser, ISchedulePreference, ILastPrompt } from '../models/User';
import { JournalEntry, IJournalEntry } from '../models/JournalEntry';
import { Points, IPointsHistory, DEFAULT_WEEKLY_POINTS_CONFIG, IWeeklyPointsConfig } from '../models/Points';
import { Prompt, PromptType } from '../types';
import { logger } from '../utils/logger';

// Define a combined type for user with possible lastPrompt
type UserWithLastPrompt = IUser & { lastPrompt?: ILastPrompt };

// Result type for weekly journal entry submission with rewards
export interface IWeeklyJournalSubmissionResult {
  entry: IJournalEntry;
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean; // Did they beat their longest streak?
  isMultipleEntry: boolean; // Additional entry this week
  weekId: string;
}

export class UserService {
  private pointsConfig: IWeeklyPointsConfig;

  constructor(customPointsConfig?: Partial<IWeeklyPointsConfig>) {
    // Allow customization of weekly points configuration
    this.pointsConfig = {
      ...DEFAULT_WEEKLY_POINTS_CONFIG,
      ...customPointsConfig
    };
  }

  /**
   * Get a user by Telegram ID (updated to include weekly streak data)
   */
  async getUser(userId: string): Promise<UserWithLastPrompt | null> {
    try {
      userId = String(userId);
      return await User.findOneWithLastPrompt(userId);
    } catch (error) {
      logger.error(`Error getting user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new user or update an existing one
   */
  async createOrUpdateUser(userId: string, data: Partial<IUser> = {}): Promise<IUser> {
    try {
      userId = String(userId);
      
      let user = await User.findOne(userId);
      
      if (!user) {
        const userData = {
          id: userId,
          createdAt: new Date(),
          promptCount: 0,
          ...data
        };
        
        user = await User.create(userData);
        logger.info(`Created new user with ID: ${userId}`);
      } else if (Object.keys(data).length > 0) {
        // For existing users, only update the fields that were provided
        const updateData: Partial<IUser> = {};
        
        if (data.promptCount !== undefined) updateData.promptCount = data.promptCount;
        if (data.schedulePreference) updateData.schedulePreference = data.schedulePreference;
        if (data.currentStreak !== undefined) updateData.currentStreak = data.currentStreak;
        if (data.longestStreak !== undefined) updateData.longestStreak = data.longestStreak;
        if (data.totalPoints !== undefined) updateData.totalPoints = data.totalPoints;
        if (data.lastEntryWeek !== undefined) updateData.lastEntryWeek = data.lastEntryWeek;
        
        user = await User.update(userId, updateData);
        logger.info(`Updated user with ID: ${userId}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`Error creating/updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Submit a weekly journal entry and process all rewards
   * This orchestrates the entire weekly reward experience
   */
  async submitJournalEntry(
    userId: string,
    prompt: string,
    promptType: PromptType,
    response: string
  ): Promise<IWeeklyJournalSubmissionResult> {
    try {
      userId = String(userId);
      
      // First, create the journal entry
      const entry = await JournalEntry.create({
        userId,
        prompt,
        promptType,
        response
      });

      // Process weekly rewards and update streak
      const rewardResult = await User.processWeeklyJournalEntryRewards(
        userId,
        entry.id,
        this.pointsConfig
      );

      // Check if this is a new personal record
      const previousLongestStreak = rewardResult.user.longestStreak - 
        (rewardResult.newStreak > rewardResult.user.longestStreak ? 
         rewardResult.newStreak - rewardResult.user.longestStreak : 0);
      const isNewRecord = rewardResult.newStreak > previousLongestStreak;

      // Log this achievement for analytics and debugging
      logger.info(
        `Weekly journal entry processed for user ${userId}: ` +
        `Entry ID: ${entry.id}, Points: ${rewardResult.pointsAwarded}, ` +
        `Week Streak: ${rewardResult.newStreak}, Total: ${rewardResult.user.totalPoints}` +
        (rewardResult.milestoneReached ? `, Milestone: ${rewardResult.milestoneReached} weeks` : '') +
        (isNewRecord ? ', NEW RECORD!' : '') +
        (rewardResult.isMultipleEntry ? ', Additional weekly entry' : '')
      );

      return {
        entry,
        pointsAwarded: rewardResult.pointsAwarded,
        newStreak: rewardResult.newStreak,
        totalPoints: rewardResult.user.totalPoints,
        milestoneReached: rewardResult.milestoneReached,
        streakBroken: rewardResult.streakBroken,
        isNewRecord,
        isMultipleEntry: rewardResult.isMultipleEntry,
        weekId: rewardResult.weekId
      };
    } catch (error) {
      logger.error(`Error submitting weekly journal entry for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's recent journal entries
   */
  async getRecentEntries(userId: string, limit: number = 5): Promise<IJournalEntry[]> {
    try {
      userId = String(userId);
      return await JournalEntry.findByUserId(userId, limit);
    } catch (error) {
      logger.error(`Error getting recent entries for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's points history
   */
  async getPointsHistory(userId: string, limit: number = 10): Promise<IPointsHistory[]> {
    try {
      userId = String(userId);
      return await Points.getHistory(userId, limit);
    } catch (error) {
      logger.error(`Error getting points history for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get weekly streak statistics for a user
   * Provides data for motivational messages and progress tracking
   */
  async getStreakStats(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    weeksUntilNextMilestone: number;
    nextMilestoneReward: number;
    pointsHistory: IPointsHistory[];
    currentWeekId: string;
    hasEntryThisWeek: boolean;
  }> {
    try {
      userId = String(userId);
      
      const user = await User.findOne(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Calculate next milestone for weekly streaks
      const milestones = Object.keys(this.pointsConfig.milestoneRewards)
        .map(Number)
        .sort((a, b) => a - b);
      
      const nextMilestone = milestones.find(milestone => milestone > user.currentStreak);
      const weeksUntilNextMilestone = nextMilestone ? nextMilestone - user.currentStreak : 0;
      const nextMilestoneReward = nextMilestone ? this.pointsConfig.milestoneRewards[nextMilestone] : 0;

      const pointsHistory = await Points.getHistory(userId, 5);
      const currentWeekId = Points.getWeekIdentifier();
      const hasEntryThisWeek = await User.hasEntryThisWeek(userId);

      return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalPoints: user.totalPoints,
        weeksUntilNextMilestone,
        nextMilestoneReward,
        pointsHistory,
        currentWeekId,
        hasEntryThisWeek
      };
    } catch (error) {
      logger.error(`Error getting weekly streak stats for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Generate motivational message based on user's weekly streak status
   * Psychology for weekly streaks - emphasizes consistency over frequency
   */
  generateMotivationalMessage(result: IWeeklyJournalSubmissionResult): string {
    const { pointsAwarded, newStreak, milestoneReached, streakBroken, isNewRecord, isMultipleEntry } = result;
    
    // Priority order: New record > Milestone > Multiple entry > Streak broken recovery > Regular progression
    if (isNewRecord && newStreak > 4) {
      return `🌟 INCREDIBLE! You've just set a new personal record with a ${newStreak}-week streak! You earned ${pointsAwarded} points. Your consistency is truly inspiring!`;
    }
    
    if (milestoneReached) {
      const milestonePoints = this.pointsConfig.milestoneRewards[milestoneReached];
      let milestoneText = '';
      if (milestoneReached === 4) milestoneText = ' (1 month of weekly reflection!)';
      else if (milestoneReached === 12) milestoneText = ' (3 months of dedication!)';
      else if (milestoneReached === 26) milestoneText = ' (6 months of consistent growth!)';
      else if (milestoneReached === 52) milestoneText = ' (A full year of weekly reflection!)';
      else if (milestoneReached === 104) milestoneText = ' (Two years of incredible commitment!)';
      
      return `🎉 MILESTONE ACHIEVED! ${milestoneReached} weeks in a row${milestoneText} You've earned ${pointsAwarded} points (including a ${milestonePoints} point milestone bonus). Amazing dedication!`;
    }
    
    if (isMultipleEntry) {
      return `✨ Extra reflection time! You've earned ${pointsAwarded} points for this additional entry. Your ${newStreak}-week streak continues, and your commitment to deeper self-awareness is wonderful!`;
    }
    
    if (streakBroken && newStreak === 1) {
      return `💪 Welcome back to your weekly reflection! You've earned ${pointsAwarded} points and started fresh. Every week is a new opportunity for growth - let's build on this!`;
    }
    
    if (newStreak === 1) {
      return `🌱 Excellent start! Week 1 complete and ${pointsAwarded} points earned. Weekly reflection is a powerful habit - you're taking an important step toward self-awareness!`;
    }
    
    if (newStreak <= 4) {
      return `🔥 Building momentum! ${newStreak} weeks of consistent reflection! You earned ${pointsAwarded} points. You're developing a meaningful weekly practice!`;
    }
    
    if (newStreak <= 12) {
      return `⚡ Impressive consistency! ${newStreak} weeks in a row! ${pointsAwarded} points earned. Your weekly reflection habit is becoming truly powerful!`;
    }
    
    if (newStreak <= 26) {
      return `🚀 Outstanding dedication! ${newStreak} weeks of continuous growth! You earned ${pointsAwarded} points. Your commitment to self-reflection is remarkable!`;
    }
    
    // For very long streaks (26+ weeks)
    return `🏆 Legendary commitment! ${newStreak} weeks of consistent weekly reflection! ${pointsAwarded} points earned. You're a true master of self-awareness!`;
  }

  /**
   * Get leaderboard data for weekly streaks
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    rank: number;
  }>> {
    try {
      return await User.getWeeklyLeaderboard(limit);
    } catch (error) {
      logger.error('Error getting weekly leaderboard:', error);
      throw error;
    }
  }

  /**
   * Update a user's schedule preferences
   */
  async updateSchedulePreference(
    userId: string, 
    preferences: Partial<ISchedulePreference>
  ): Promise<void> {
    try {
      userId = String(userId);
      
      const user = await User.findOne(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      await User.update(userId, { schedulePreference: preferences });
      logger.info(`Updated schedule preferences for user ${userId}`);
    } catch (error) {
      logger.error(`Error updating schedule preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user has made an entry this week
   */
  async hasEntryThisWeek(userId: string): Promise<boolean> {
    try {
      userId = String(userId);
      return await User.hasEntryThisWeek(userId);
    } catch (error) {
      logger.error(`Error checking this week's entry for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get current week identifier for frontend
   */
  getCurrentWeekId(): string {
    return Points.getWeekIdentifier();
  }

  /**
   * Get weekly streak system status and statistics
   * Useful for admin dashboard or analytics
   */
  async getSystemStats(): Promise<{
    totalActiveStreaks: number;
    averageStreak: number;
    longestCurrentStreak: number;
    usersWithMultipleEntriesThisWeek: number;
    currentWeek: string;
  }> {
    try {
      const stats = await Points.getWeeklyStreakStats();
      return {
        ...stats,
        currentWeek: Points.getWeekIdentifier()
      };
    } catch (error) {
      logger.error('Error getting weekly system statistics:', error);
      throw error;
    }
  }

  /**
   * Save last prompt for a user (compatibility with existing system)
   */
  async saveLastPrompt(userId: string, prompt: Prompt): Promise<void> {
    try {
      userId = String(userId);
      
      // This method is used by the scheduler - keeping for compatibility
      // The actual prompt tracking is handled by the existing last_prompts table
      logger.debug(`Saved last prompt for user ${userId}: ${prompt.type}`);
    } catch (error) {
      logger.error(`Error saving last prompt for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all users (for scheduler compatibility)
   */
  async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.getAllUsers();
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }
}

export const userService = new UserService();