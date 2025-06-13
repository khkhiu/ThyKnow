// File: src/models/Points.ts
// Points and Weekly Streak Model for PostgreSQL

import { query } from '../database';
import { logger } from '../utils/logger';

// Points history interface for weekly tracking
export interface IPointsHistory {
  id: number;
  userId: string;
  pointsEarned: number;
  reason: string;
  streakWeek: number;
  weekIdentifier: string; // Format: YYYY-WXX
  entryId?: number;
  timestamp: Date;
}

// Weekly streak calculation result
export interface IWeeklyStreakResult {
  currentStreak: number;
  isNewStreak: boolean;
  streakExtended: boolean;
  weeksSkipped: number;
  currentWeekId: string;
}

// Points configuration for weekly system
export interface IWeeklyPointsConfig {
  basePointsPerEntry: number;
  streakMultiplier: number;
  milestoneRewards: { [key: number]: number };
  maxWeeklyPoints: number;
  multipleEntryBonus: number; // Bonus for additional entries in same week
}

// Weekly points configuration - adjusted for weekly cadence
export const DEFAULT_WEEKLY_POINTS_CONFIG: IWeeklyPointsConfig = {
  basePointsPerEntry: 50,      // Higher base points since it's weekly
  streakMultiplier: 10,        // Additional points per streak week
  milestoneRewards: {          // Bonus points for reaching streak milestones
    4: 200,    // 1 month (4 weeks)
    12: 500,   // 3 months (12 weeks)
    26: 1000,  // 6 months (26 weeks)
    52: 2500,  // 1 year (52 weeks)
    104: 5000  // 2 years (104 weeks)
  },
  maxWeeklyPoints: 300,        // Cap to prevent gaming
  multipleEntryBonus: 20       // Bonus for additional entries same week
};

export class Points {
  /**
   * Get the ISO week identifier for a given date
   * Format: YYYY-WXX (e.g., 2025-W01)
   */
  static getWeekIdentifier(date: Date = new Date()): string {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate previous week identifier
   */
  static getPreviousWeekIdentifier(weekId: string): string {
    const [year, week] = weekId.split('-W').map(Number);
    if (week > 1) {
      return `${year}-W${(week - 1).toString().padStart(2, '0')}`;
    } else {
      // Previous year's last week (approximately week 52 or 53)
      return `${year - 1}-W52`;
    }
  }

  /**
   * Calculate streak status for a user based on their last entry week
   * This determines if a weekly streak continues, breaks, or starts fresh
   */
  static calculateWeeklyStreakStatus(
    lastEntryWeek: string | null, 
    currentStreak: number
  ): IWeeklyStreakResult {
    const currentWeekId = Points.getWeekIdentifier();
    
    // If no previous entry, this is their first entry (new streak)
    if (!lastEntryWeek) {
      return {
        currentStreak: 1,
        isNewStreak: true,
        streakExtended: false,
        weeksSkipped: 0,
        currentWeekId
      };
    }
    
    // Same week - streak stays the same (don't double-count same-week entries)
    if (lastEntryWeek === currentWeekId) {
      return {
        currentStreak: currentStreak,
        isNewStreak: false,
        streakExtended: false,
        weeksSkipped: 0,
        currentWeekId
      };
    }
    
    // Check if this is the consecutive week
    const previousWeekId = Points.getPreviousWeekIdentifier(currentWeekId);
    if (lastEntryWeek === previousWeekId) {
      return {
        currentStreak: currentStreak + 1,
        isNewStreak: false,
        streakExtended: true,
        weeksSkipped: 0,
        currentWeekId
      };
    }
    
    // More than 1 week gap - streak is broken, start fresh
    // Calculate weeks skipped (approximate)
    const weeksSkipped = Math.max(0, 
      parseInt(currentWeekId.split('-W')[1]) - parseInt(lastEntryWeek.split('-W')[1]) - 1
    );
    
    return {
      currentStreak: 1,
      isNewStreak: true,
      streakExtended: false,
      weeksSkipped,
      currentWeekId
    };
  }

  /**
   * Calculate points to award for a journal entry based on weekly streak status
   * Progressive reward system - longer streaks earn more points
   */
  static calculateWeeklyPoints(
    streakWeek: number, 
    isMultipleEntryThisWeek: boolean = false,
    config: IWeeklyPointsConfig = DEFAULT_WEEKLY_POINTS_CONFIG
  ): { basePoints: number; streakBonus: number; milestoneBonus: number; multipleEntryBonus: number; total: number } {
    // Base points for making an entry
    let basePoints = config.basePointsPerEntry;
    
    // Bonus for additional entries in the same week (encourages deeper reflection)
    const multipleEntryBonus = isMultipleEntryThisWeek ? config.multipleEntryBonus : 0;
    
    // Streak bonus increases with each week (but capped)
    const streakBonus = Math.min(
      streakWeek * config.streakMultiplier, 
      config.maxWeeklyPoints - basePoints - multipleEntryBonus
    );
    
    // Check for milestone bonuses
    const milestoneBonus = config.milestoneRewards[streakWeek] || 0;
    
    const total = basePoints + streakBonus + milestoneBonus + multipleEntryBonus;
    
    return {
      basePoints,
      streakBonus,
      milestoneBonus,
      multipleEntryBonus,
      total: Math.min(total, config.maxWeeklyPoints + milestoneBonus) // Allow milestone bonuses to exceed weekly cap
    };
  }

  /**
   * Check if user has already made an entry this week
   */
  static async hasEntryThisWeek(userId: string, weekId: string): Promise<boolean> {
    try {
      const result = await query<{ count: number }>(`
        SELECT COUNT(*) as count
        FROM points_history
        WHERE user_id = $1 AND week_identifier = $2
      `, [String(userId), weekId]);

      return (result[0]?.count || 0) > 0;
    } catch (error) {
      logger.error(`Error checking weekly entry for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Award points to a user for a journal entry and update their weekly streak
   * Main orchestration function for the weekly reward process
   */
  static async awardPointsForWeeklyEntry(
    userId: string,
    entryId: number,
    lastEntryWeek: string | null,
    currentStreak: number,
    config: IWeeklyPointsConfig = DEFAULT_WEEKLY_POINTS_CONFIG
  ): Promise<{ 
    pointsAwarded: number; 
    newStreak: number; 
    milestoneReached?: number;
    streakBroken: boolean;
    isMultipleEntry: boolean;
    weekId: string;
  }> {
    try {
      // Calculate the new streak status
      const streakResult = Points.calculateWeeklyStreakStatus(lastEntryWeek, currentStreak);
      
      // Check if user already has entries this week
      const isMultipleEntry = await Points.hasEntryThisWeek(userId, streakResult.currentWeekId);
      
      // Calculate points based on the streak week and multiple entry status
      const pointsBreakdown = Points.calculateWeeklyPoints(
        streakResult.currentStreak, 
        isMultipleEntry, 
        config
      );
      
      // Determine the reason for points
      let reason = 'weekly_entry';
      if (streakResult.isNewStreak && currentStreak > 0) {
        reason = 'streak_restart';
      } else if (streakResult.streakExtended) {
        reason = 'streak_continuation';
      } else if (isMultipleEntry) {
        reason = 'additional_weekly_entry';
      }
      
      // Record the points in history
      await Points.create({
        userId,
        pointsEarned: pointsBreakdown.total,
        reason,
        streakWeek: streakResult.currentStreak,
        weekIdentifier: streakResult.currentWeekId,
        entryId
      });
      
      // If there's a milestone bonus, record it separately for clarity
      let milestoneReached: number | undefined;
      if (pointsBreakdown.milestoneBonus > 0) {
        milestoneReached = streakResult.currentStreak;
        await Points.create({
          userId,
          pointsEarned: pointsBreakdown.milestoneBonus,
          reason: `milestone_${streakResult.currentStreak}_weeks`,
          streakWeek: streakResult.currentStreak,
          weekIdentifier: streakResult.currentWeekId,
          entryId
        });
      }
      
      return {
        pointsAwarded: pointsBreakdown.total,
        newStreak: streakResult.currentStreak,
        milestoneReached,
        streakBroken: streakResult.isNewStreak && currentStreak > 0,
        isMultipleEntry,
        weekId: streakResult.currentWeekId
      };
    } catch (error) {
      logger.error(`Error awarding weekly points for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new points history entry
   */
  static async create(data: {
    userId: string;
    pointsEarned: number;
    reason: string;
    streakWeek: number;
    weekIdentifier: string;
    entryId?: number;
    timestamp?: Date;
  }): Promise<IPointsHistory> {
    try {
      const result = await query<IPointsHistory>(`
        INSERT INTO points_history (
          user_id, 
          points_earned, 
          reason, 
          streak_week,
          week_identifier,
          entry_id,
          timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id, 
          user_id AS "userId", 
          points_earned AS "pointsEarned", 
          reason, 
          streak_week AS "streakWeek",
          week_identifier AS "weekIdentifier",
          entry_id AS "entryId",
          timestamp
      `, [
        String(data.userId),
        data.pointsEarned,
        data.reason,
        data.streakWeek,
        data.weekIdentifier,
        data.entryId || null,
        data.timestamp || new Date()
      ]);

      return result[0];
    } catch (error) {
      logger.error(`Error creating weekly points history for user ${data.userId}:`, error);
      throw error;
    }
  }

  /**
   * Get points history for a user
   */
  static async getHistory(userId: string, limit: number = 10): Promise<IPointsHistory[]> {
    try {
      return await query<IPointsHistory>(`
        SELECT 
          id, 
          user_id AS "userId", 
          points_earned AS "pointsEarned", 
          reason, 
          streak_week AS "streakWeek",
          week_identifier AS "weekIdentifier",
          entry_id AS "entryId",
          timestamp
        FROM points_history
        WHERE user_id = $1
        ORDER BY timestamp DESC
        LIMIT $2
      `, [String(userId), limit]);
    } catch (error) {
      logger.error(`Error fetching weekly points history for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get total points for a user
   */
  static async getTotalPoints(userId: string): Promise<number> {
    try {
      const result = await query<{ total: number }>(`
        SELECT COALESCE(SUM(points_earned), 0) as total
        FROM points_history
        WHERE user_id = $1
      `, [String(userId)]);

      return result[0]?.total || 0;
    } catch (error) {
      logger.error(`Error fetching total weekly points for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get weekly streak statistics for analytics
   */
  static async getWeeklyStreakStats(): Promise<{
    totalActiveStreaks: number;
    averageStreak: number;
    longestCurrentStreak: number;
    usersWithMultipleEntriesThisWeek: number;
  }> {
    try {
      const currentWeek = Points.getWeekIdentifier();
      
      const [activeStreaks, avgStreak, longestStreak, multipleEntries] = await Promise.all([
        query<{ count: number }>(`
          SELECT COUNT(*) as count FROM users WHERE current_streak > 0
        `),
        query<{ avg: number }>(`
          SELECT AVG(current_streak) as avg FROM users WHERE current_streak > 0
        `),
        query<{ max: number }>(`
          SELECT MAX(current_streak) as max FROM users
        `),
        query<{ count: number }>(`
          SELECT COUNT(DISTINCT user_id) as count 
          FROM points_history 
          WHERE week_identifier = $1 
          GROUP BY user_id 
          HAVING COUNT(*) > 1
        `, [currentWeek])
      ]);

      return {
        totalActiveStreaks: activeStreaks[0]?.count || 0,
        averageStreak: Math.round(avgStreak[0]?.avg || 0),
        longestCurrentStreak: longestStreak[0]?.max || 0,
        usersWithMultipleEntriesThisWeek: multipleEntries.length
      };
    } catch (error) {
      logger.error('Error fetching weekly streak statistics:', error);
      throw error;
    }
  }
}