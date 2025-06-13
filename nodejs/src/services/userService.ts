// File: src/services/userService.ts
// User service with PostgreSQL support and weekly streak functionality

import { User, IUser, ISchedulePreference, ILastPrompt } from '../models/User';
import { JournalEntry, IJournalEntry } from '../models/JournalEntry';
import { Points, IPointsHistory } from '../models/Points';
import { PromptType } from '../types';
import { logger } from '../utils/logger';

// Define interfaces for missing types
interface IStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  hasEntryThisWeek: boolean;
  currentWeekId: string;
  weeksUntilNextMilestone: number;
  nextMilestoneReward: number;
  pointsHistory: IPointsHistory[];
}

interface ILeaderboardEntry {
  rank: number;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
}

interface ISystemStats {
  totalActiveStreaks: number;
  totalUsers: number;
  weeklyEntriesCount: number;
  averageStreak: number;
}

interface ISubmissionResult {
  entry: IJournalEntry;
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean;
  isMultipleEntry: boolean;
  weekId: string;
  user: IUser;
}

// Define a combined type for user with possible lastPrompt
type UserWithLastPrompt = IUser & { lastPrompt?: ILastPrompt };

export class UserService {
  /**
   * Get a user by Telegram ID
   */
  async getUser(userId: string): Promise<UserWithLastPrompt | null> {
    try {
      // Ensure userId is a string
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
      // Ensure userId is a string
      userId = String(userId);
      
      // Check if user exists
      let user = await User.findOne(userId);
      
      if (!user) {
        // Create new user with default schedule preferences
        const userData = {
          id: userId,
          createdAt: new Date(),
          promptCount: 0,
          ...data
        };
        
        user = await User.create(userData);
        logger.info(`Created new user with ID: ${userId}`);
      } else if (Object.keys(data).length > 0) {
        // Update existing user
        const updateData: { 
          promptCount?: number; 
          schedulePreference?: Partial<ISchedulePreference>;
        } = {};
        
        if (data.promptCount !== undefined) {
          updateData.promptCount = data.promptCount;
        }
        
        if (data.schedulePreference) {
          updateData.schedulePreference = data.schedulePreference;
        }
        
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
   * Update a user's schedule preferences
   */
  async updateSchedulePreference(
    userId: string, 
    preferences: Partial<ISchedulePreference>
  ): Promise<void> {
    try {
      // Ensure userId is a string
      userId = String(userId);
      
      const user = await User.findOne(userId);
      
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      await User.update(userId, { schedulePreference: preferences });
      logger.info(`Updated schedule preferences for user ${userId}`);
    } catch (error) {
      logger.error(`Error updating schedule for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Save the last prompt sent to a user
   */
  async saveLastPrompt(userId: string, prompt: { text: string; type: PromptType; count?: number }): Promise<void> {
    try {
      // Ensure userId is a string
      userId = String(userId);
      
      await User.saveLastPrompt(userId, {
        text: prompt.text,
        type: prompt.type
      });
    } catch (error) {
      logger.error(`Error saving last prompt for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Save a user's response to a prompt
   */
  async saveResponse(userId: string, entry: {
    prompt: string;
    response: string;
    promptType: PromptType;
    timestamp: Date;
  }): Promise<string> {
    try {
      // Ensure userId is a string
      userId = String(userId);
      
      const journalEntry = await JournalEntry.create({
        userId,
        ...entry
      });
      
      // Return the ID as a string to maintain compatibility with existing code
      return String(journalEntry.id);
    } catch (error) {
      logger.error(`Error saving response for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get recent journal entries for a user
   */
  async getRecentEntries(userId: string, limit: number = 5): Promise<IJournalEntry[]> {
    try {
      // Ensure userId is a string
      userId = String(userId);
      
      return await JournalEntry.findByUserId(userId, limit);
    } catch (error) {
      logger.error(`Error getting recent entries for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.getAllUsers();
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  // WEEKLY STREAK METHODS (Missing implementations)

  /**
   * Get comprehensive streak statistics for a user
   */
  async getStreakStats(userId: string): Promise<IStreakStats> {
    try {
      userId = String(userId);
      
      const user = await User.findOne(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const currentWeekId = this.getCurrentWeekId();
      const hasEntryThisWeek = await User.hasEntryThisWeek(userId);
      const pointsHistory = await Points.getUserPointsHistory(userId, 10);

      // Calculate next milestone
      const nextMilestone = this.getNextMilestone(user.currentStreak);
      const weeksUntilNextMilestone = nextMilestone - user.currentStreak;
      const nextMilestoneReward = this.getMilestoneReward(nextMilestone);

      return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalPoints: user.totalPoints,
        hasEntryThisWeek,
        currentWeekId,
        weeksUntilNextMilestone,
        nextMilestoneReward,
        pointsHistory
      };
    } catch (error) {
      logger.error(`Error getting streak stats for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get current week identifier
   */
  getCurrentWeekId(): string {
    return Points.getWeekIdentifier();
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit: number = 10): Promise<ILeaderboardEntry[]> {
    try {
      return await User.getWeeklyLeaderboard(limit);
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Submit a journal entry and process weekly rewards
   */
  async submitJournalEntry(
    userId: string,
    prompt: string,
    promptType: PromptType,
    response: string
  ): Promise<ISubmissionResult> {
    try {
      userId = String(userId);

      // Create the journal entry
      const entry = await JournalEntry.create({
        userId,
        prompt,
        response,
        promptType,
        timestamp: new Date()
      });

      // Get user's previous longest streak for isNewRecord calculation
      const userBefore = await User.findOne(userId);
      if (!userBefore) {
        throw new Error(`User ${userId} not found`);
      }

      // Process weekly rewards
      const rewardResult = await User.processWeeklyJournalEntryRewards(userId, entry.id);

      return {
        entry,
        pointsAwarded: rewardResult.pointsAwarded,
        newStreak: rewardResult.newStreak,
        totalPoints: rewardResult.user.totalPoints,
        milestoneReached: rewardResult.milestoneReached,
        streakBroken: rewardResult.streakBroken,
        isNewRecord: rewardResult.newStreak > userBefore.longestStreak,
        isMultipleEntry: rewardResult.isMultipleEntry,
        weekId: rewardResult.weekId,
        user: rewardResult.user
      };
    } catch (error) {
      logger.error(`Error submitting journal entry for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStats(): Promise<ISystemStats> {
    try {
      // You'll need to implement these queries based on your database schema
      const totalActiveStreaks = await Points.getTotalActiveStreaks();
      const totalUsers = await User.getTotalUserCount();
      const weeklyEntriesCount = await Points.getWeeklyEntriesCount();
      const averageStreak = await Points.getAverageStreakLength();

      return {
        totalActiveStreaks,
        totalUsers,
        weeklyEntriesCount,
        averageStreak
      };
    } catch (error) {
      logger.error('Error getting system stats:', error);
      throw error;
    }
  }

  /**
   * Generate motivational message based on submission result
   */
  generateMotivationalMessage(result: ISubmissionResult): string {
    if (result.milestoneReached) {
      return `🎉 Incredible! You've reached the ${result.milestoneReached}-week milestone! Your dedication is truly inspiring.`;
    }
    
    if (result.isNewRecord) {
      return `🔥 NEW PERSONAL RECORD! ${result.newStreak} weeks of consistent reflection. You're unstoppable!`;
    }
    
    if (result.streakBroken) {
      return `💪 Starting fresh is a sign of resilience! Every journey begins with a single step.`;
    }
    
    if (result.isMultipleEntry) {
      return `✨ Extra reflection this week! Your commitment to growth is remarkable.`;
    }
    
    return `🌟 Week ${result.newStreak} complete! Your reflection journey continues to flourish.`;
  }

  // HELPER METHODS

  private getNextMilestone(currentStreak: number): number {
    const milestones = [4, 12, 26, 52, 104];
    return milestones.find(milestone => milestone > currentStreak) || currentStreak + 52;
  }

  private getMilestoneReward(milestone: number): number {
    const rewards: { [key: number]: number } = {
      4: 500,    // 1 month
      12: 1500,  // 3 months
      26: 3000,  // 6 months
      52: 6000,  // 1 year
      104: 12000 // 2 years
    };
    return rewards[milestone] || 1000;
  }
}

// Create and export a singleton instance
export const userService = new UserService();