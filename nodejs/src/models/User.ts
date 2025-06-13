// File: src/models/User.ts (Updated for Weekly Streaks)
// User Model for PostgreSQL with Weekly Streak and Points Support

import { query, transaction } from '../database';
import { PromptType } from '../types';
import { logger } from '../utils/logger';
import { Points, IWeeklyPointsConfig, DEFAULT_WEEKLY_POINTS_CONFIG } from './Points';

// Updated User interface with weekly streak data
export interface IUser {
  id: string; // Telegram user ID
  createdAt: Date;
  promptCount: number;
  schedulePreference: ISchedulePreference;
  currentStreak: number;        // Weeks in current streak
  longestStreak: number;        // Longest weekly streak achieved
  totalPoints: number;
  lastEntryWeek: string | null; // Format: YYYY-WXX
}

// Last prompt interface (unchanged)
export interface ILastPrompt {
  userId: string;
  text: string;
  type: PromptType;
  timestamp: Date;
}

// Schedule preference interface (unchanged)
export interface ISchedulePreference {
  day: number; // 0-6 (Sunday to Saturday)
  hour: number; // 0-23
  enabled: boolean;
}

// Internal interface for database row structure (updated for weekly)
interface IUserRow {
  id: string;
  createdAt: Date;
  promptCount: number;
  scheduleDay: number;
  scheduleHour: number;
  scheduleEnabled: boolean;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastEntryWeek: string | null;
  lastPromptText?: string;
  lastPromptType?: string;
  lastPromptTimestamp?: Date;
}

export class User {
  /**
   * Find a user by their Telegram ID (updated to include weekly streak data)
   */
  static async findOne(id: string): Promise<IUser | null> {
    try {
      const users = await query<IUserRow>(`
        SELECT 
          u.id, 
          u.created_at AS "createdAt", 
          u.prompt_count AS "promptCount",
          u.schedule_day AS "scheduleDay",
          u.schedule_hour AS "scheduleHour",
          u.schedule_enabled AS "scheduleEnabled",
          u.current_streak AS "currentStreak",
          u.longest_streak AS "longestStreak",
          u.total_points AS "totalPoints",
          u.last_entry_week AS "lastEntryWeek"
        FROM users u
        WHERE u.id = $1
      `, [id]);

      if (users.length === 0) {
        return null;
      }

      const row = users[0];
      
      return {
        id: row.id,
        createdAt: row.createdAt,
        promptCount: row.promptCount,
        schedulePreference: {
          day: row.scheduleDay,
          hour: row.scheduleHour,
          enabled: row.scheduleEnabled
        },
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        totalPoints: row.totalPoints,
        lastEntryWeek: row.lastEntryWeek
      };
    } catch (error) {
      logger.error(`Error finding user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find a user with their last prompt (for existing compatibility)
   */
  static async findOneWithLastPrompt(id: string): Promise<IUser & { lastPrompt?: ILastPrompt } | null> {
    try {
      const result = await query<IUserRow & {
        lastPromptText?: string;
        lastPromptType?: string;
        lastPromptTimestamp?: Date;
      }>(`
        SELECT 
          u.id, 
          u.created_at AS "createdAt", 
          u.prompt_count AS "promptCount",
          u.schedule_day AS "scheduleDay",
          u.schedule_hour AS "scheduleHour",
          u.schedule_enabled AS "scheduleEnabled",
          u.current_streak AS "currentStreak",
          u.longest_streak AS "longestStreak",
          u.total_points AS "totalPoints",
          u.last_entry_week AS "lastEntryWeek",
          lp.text AS "lastPromptText",
          lp.type AS "lastPromptType",
          lp.timestamp AS "lastPromptTimestamp"
        FROM users u
        LEFT JOIN last_prompts lp ON u.id = lp.user_id
        WHERE u.id = $1
      `, [id]);

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      
      const user: IUser & { lastPrompt?: ILastPrompt } = {
        id: row.id,
        createdAt: row.createdAt,
        promptCount: row.promptCount,
        schedulePreference: {
          day: row.scheduleDay,
          hour: row.scheduleHour,
          enabled: row.scheduleEnabled
        },
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        totalPoints: row.totalPoints,
        lastEntryWeek: row.lastEntryWeek
      };

      // Add last prompt if it exists
      if (row.lastPromptText && row.lastPromptType && row.lastPromptTimestamp) {
        user.lastPrompt = {
          userId: row.id,
          text: row.lastPromptText,
          type: row.lastPromptType as PromptType,
          timestamp: row.lastPromptTimestamp
        };
      }

      return user;
    } catch (error) {
      logger.error(`Error finding user with last prompt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user with default weekly streak values
   */
  static async create(userData: {
    id: string;
    createdAt?: Date;
    promptCount?: number;
    schedulePreference?: Partial<ISchedulePreference>;
  }): Promise<IUser> {
    try {
      const defaultSchedule = {
        day: 0,      // Sunday
        hour: 10,    // 10 AM
        enabled: true,
        ...userData.schedulePreference
      };

      const result = await query<IUserRow>(`
        INSERT INTO users (
          id, 
          created_at, 
          prompt_count,
          schedule_day,
          schedule_hour,
          schedule_enabled,
          current_streak,
          longest_streak,
          total_points,
          last_entry_week
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
          id, 
          created_at AS "createdAt", 
          prompt_count AS "promptCount",
          schedule_day AS "scheduleDay",
          schedule_hour AS "scheduleHour",
          schedule_enabled AS "scheduleEnabled",
          current_streak AS "currentStreak",
          longest_streak AS "longestStreak",
          total_points AS "totalPoints",
          last_entry_week AS "lastEntryWeek"
      `, [
        userData.id,
        userData.createdAt || new Date(),
        userData.promptCount || 0,
        defaultSchedule.day,
        defaultSchedule.hour,
        defaultSchedule.enabled,
        0, // Initial current streak
        0, // Initial longest streak
        0, // Initial total points
        null // No last entry week initially
      ]);

      const row = result[0];
      
      return {
        id: row.id,
        createdAt: row.createdAt,
        promptCount: row.promptCount,
        schedulePreference: {
          day: row.scheduleDay,
          hour: row.scheduleHour,
          enabled: row.scheduleEnabled
        },
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        totalPoints: row.totalPoints,
        lastEntryWeek: row.lastEntryWeek
      };
    } catch (error) {
      logger.error(`Error creating user ${userData.id}:`, error);
      throw error;
    }
  }

  /**
   * Update user data including weekly streak and points information
   */
  static async update(
    id: string, 
    data: {
      promptCount?: number;
      schedulePreference?: Partial<ISchedulePreference>;
      currentStreak?: number;
      longestStreak?: number;
      totalPoints?: number;
      lastEntryWeek?: string | null; // <-- Add | null here to match IUser interface
    }
  ): Promise<IUser> {
    try {
      // Build dynamic update query based on provided data
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.promptCount !== undefined) {
        updates.push(`prompt_count = $${paramIndex++}`);
        values.push(data.promptCount);
      }

      if (data.schedulePreference) {
        if (data.schedulePreference.day !== undefined) {
          updates.push(`schedule_day = $${paramIndex++}`);
          values.push(data.schedulePreference.day);
        }
        if (data.schedulePreference.hour !== undefined) {
          updates.push(`schedule_hour = $${paramIndex++}`);
          values.push(data.schedulePreference.hour);
        }
        if (data.schedulePreference.enabled !== undefined) {
          updates.push(`schedule_enabled = $${paramIndex++}`);
          values.push(data.schedulePreference.enabled);
        }
      }

      if (data.currentStreak !== undefined) {
        updates.push(`current_streak = $${paramIndex++}`);
        values.push(data.currentStreak);
      }

      if (data.longestStreak !== undefined) {
        updates.push(`longest_streak = $${paramIndex++}`);
        values.push(data.longestStreak);
      }

      if (data.totalPoints !== undefined) {
        updates.push(`total_points = $${paramIndex++}`);
        values.push(data.totalPoints);
      }

      if (data.lastEntryWeek !== undefined) {
        updates.push(`last_entry_week = $${paramIndex++}`);
        values.push(data.lastEntryWeek); // This can now be string or null
      }

      if (updates.length === 0) {
        // No updates to make, just return current user
        return await User.findOne(id) as IUser;
      }

      values.push(id); // Add user ID for WHERE clause

      const result = await query<IUserRow>(`
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING 
          id, 
          created_at AS "createdAt", 
          prompt_count AS "promptCount",
          schedule_day AS "scheduleDay",
          schedule_hour AS "scheduleHour",
          schedule_enabled AS "scheduleEnabled",
          current_streak AS "currentStreak",
          longest_streak AS "longestStreak",
          total_points AS "totalPoints",
          last_entry_week AS "lastEntryWeek"
      `, values);

      if (result.length === 0) {
        throw new Error(`User ${id} not found for update`);
      }

      const row = result[0];
      
      return {
        id: row.id,
        createdAt: row.createdAt,
        promptCount: row.promptCount,
        schedulePreference: {
          day: row.scheduleDay,
          hour: row.scheduleHour,
          enabled: row.scheduleEnabled
        },
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        totalPoints: row.totalPoints,
        lastEntryWeek: row.lastEntryWeek // This matches IUser interface (string | null)
      };
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Process a journal entry and award points/update weekly streak
   * Main integration point between journal entries and the weekly streak system
   */
  static async processWeeklyJournalEntryRewards(
    userId: string,
    entryId: number,
    config: IWeeklyPointsConfig = DEFAULT_WEEKLY_POINTS_CONFIG
  ): Promise<{
    pointsAwarded: number;
    newStreak: number;
    milestoneReached?: number;
    streakBroken: boolean;
    isMultipleEntry: boolean;
    weekId: string;
    user: IUser;
  }> {
    // Use database transaction for consistency
    return await transaction(async (client) => {
      try {
        // Get current user data
        const user = await User.findOne(userId);
        if (!user) {
          throw new Error(`User ${userId} not found`);
        }

        // Award points and calculate new weekly streak
        const rewardResult = await Points.awardPointsForWeeklyEntry(
          userId,
          entryId,
          user.lastEntryWeek,
          user.currentStreak,
          config
        );

        // Calculate new total points
        const newTotalPoints = user.totalPoints + rewardResult.pointsAwarded;
        
        // Update longest streak if current streak is now longer
        const newLongestStreak = Math.max(user.longestStreak, rewardResult.newStreak);

        // Update user with new weekly streak and points data
        const updatedUser = await User.update(userId, {
          currentStreak: rewardResult.newStreak,
          longestStreak: newLongestStreak,
          totalPoints: newTotalPoints,
          lastEntryWeek: rewardResult.weekId,
          promptCount: user.promptCount + 1
        });

        logger.info(
          `User ${userId} awarded ${rewardResult.pointsAwarded} points for weekly entry. ` +
          `Week streak: ${rewardResult.newStreak}, Total points: ${newTotalPoints}` +
          (rewardResult.isMultipleEntry ? ' (Additional entry this week)' : '') +
          (rewardResult.milestoneReached ? ` (Milestone: ${rewardResult.milestoneReached} weeks!)` : '')
        );

        return {
          ...rewardResult,
          user: updatedUser
        };
      } catch (error) {
        logger.error(`Error processing weekly journal entry rewards for user ${userId}:`, error);
        throw error;
      }
    });
  }

  /**
   * Get leaderboard data for weekly streaks
   */
  static async getWeeklyLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    currentStreak: number;
    longestStreak: number;
    totalPoints: number;
    rank: number;
  }>> {
    try {
      return await query<{
        userId: string;
        currentStreak: number;
        longestStreak: number;
        totalPoints: number;
        rank: number;
      }>(`
        SELECT 
          id as "userId",
          current_streak as "currentStreak",
          longest_streak as "longestStreak", 
          total_points as "totalPoints",
          ROW_NUMBER() OVER (ORDER BY total_points DESC, current_streak DESC) as rank
        FROM users
        WHERE total_points > 0
        ORDER BY total_points DESC, current_streak DESC
        LIMIT $1
      `, [limit]);
    } catch (error) {
      logger.error('Error fetching weekly leaderboard:', error);
      throw error;
    }
  }

  /**
   * Check if user has made an entry this week
   */
  static async hasEntryThisWeek(userId: string): Promise<boolean> {
    try {
      const user = await User.findOne(userId);
      if (!user || !user.lastEntryWeek) {
        return false;
      }
      
      const currentWeek = Points.getWeekIdentifier();
      return user.lastEntryWeek === currentWeek;
    } catch (error) {
      logger.error(`Error checking this week's entry for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all users for scheduler functionality
   */
  static async getAllUsers(): Promise<IUser[]> {
    try {
      const users = await query<IUserRow>(`
        SELECT 
          id, 
          created_at AS "createdAt", 
          prompt_count AS "promptCount",
          schedule_day AS "scheduleDay",
          schedule_hour AS "scheduleHour",
          schedule_enabled AS "scheduleEnabled",
          current_streak AS "currentStreak",
          longest_streak AS "longestStreak",
          total_points AS "totalPoints",
          last_entry_week AS "lastEntryWeek"
        FROM users
        ORDER BY created_at DESC
      `);

      return users.map(row => ({
        id: row.id,
        createdAt: row.createdAt,
        promptCount: row.promptCount,
        schedulePreference: {
          day: row.scheduleDay,
          hour: row.scheduleHour,
          enabled: row.scheduleEnabled
        },
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        totalPoints: row.totalPoints,
        lastEntryWeek: row.lastEntryWeek
      }));
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }
}