// src/services/userAppUsageService.ts
// Track user app usage for progressive disclosure

import { query } from '../database';
import { logger } from '../utils/logger';
import { UserAppUsage } from '../types/botCommand';

export class UserAppUsageService {
  /**
   * Get user app usage statistics
   */
  async getUserAppUsage(userId: string): Promise<UserAppUsage> {
    try {
      const queryText = `
        SELECT 
          u.created_at as registration_date,
          u.last_miniapp_use,
          u.miniapp_usage_count,
          CASE 
            WHEN u.last_miniapp_use IS NOT NULL THEN true 
            ELSE false 
          END as has_used_miniapp,
          CASE 
            WHEN u.created_at > NOW() - INTERVAL '7 days' THEN true 
            ELSE false 
          END as is_new_user
        FROM users u 
        WHERE u.id = $1
      `;

      const result = await query<{
        registration_date: Date;
        last_miniapp_use: Date | null;
        miniapp_usage_count: number | null;
        has_used_miniapp: boolean;
        is_new_user: boolean;
      }>(queryText, [userId]);
      
      if (result.length === 0) {
        // Return default for new user
        return {
          hasUsedMiniapp: false,
          lastMiniappUse: null,
          miniappUsageCount: 0,
          isNewUser: true,
          registrationDate: new Date()
        };
      }

      const row = result[0];
      return {
        hasUsedMiniapp: row.has_used_miniapp,
        lastMiniappUse: row.last_miniapp_use,
        miniappUsageCount: row.miniapp_usage_count || 0,
        isNewUser: row.is_new_user,
        registrationDate: row.registration_date
      };
    } catch (error) {
      logger.error('Error getting user app usage:', error);
      // Return safe defaults
      return {
        hasUsedMiniapp: false,
        lastMiniappUse: null,
        miniappUsageCount: 0,
        isNewUser: true,
        registrationDate: new Date()
      };
    }
  }

  /**
   * Record miniapp usage
   */
  async recordMiniappUsage(userId: string): Promise<void> {
    try {
      const queryText = `
        UPDATE users 
        SET 
          last_miniapp_use = NOW(),
          miniapp_usage_count = COALESCE(miniapp_usage_count, 0) + 1
        WHERE id = $1
      `;

      await query(queryText, [userId]);
      logger.debug(`Recorded miniapp usage for user ${userId}`);
    } catch (error) {
      logger.error('Error recording miniapp usage:', error);
    }
  }

  /**
   * Check if user needs app promotion
   */
  async shouldPromoteApp(userId: string): Promise<boolean> {
    try {
      const usage = await this.getUserAppUsage(userId);
      
      // Promote if:
      // - Never used app
      // - Used app less than 3 times
      // - Haven't used app in over 7 days
      if (!usage.hasUsedMiniapp) return true;
      if (usage.miniappUsageCount < 3) return true;
      
      if (usage.lastMiniappUse) {
        const daysSinceLastUse = Math.floor(
          (Date.now() - usage.lastMiniappUse.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastUse > 7) return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error checking app promotion need:', error);
      return true; // Default to promoting
    }
  }

  /**
   * Get user engagement level
   */
  async getUserEngagementLevel(userId: string): Promise<'new' | 'casual' | 'active' | 'power'> {
    try {
      const usage = await this.getUserAppUsage(userId);
      
      if (usage.isNewUser || usage.miniappUsageCount === 0) {
        return 'new';
      }
      
      if (usage.miniappUsageCount < 5) {
        return 'casual';
      }
      
      if (usage.miniappUsageCount < 20) {
        return 'active';
      }
      
      return 'power';
    } catch (error) {
      logger.error('Error getting user engagement level:', error);
      return 'new';
    }
  }

  /**
   * Record bot command usage
   */
  async recordBotCommandUsage(userId: string, command: string): Promise<void> {
    try {
      const queryText = `
        INSERT INTO bot_command_usage (user_id, command, timestamp)
        VALUES (
          (SELECT id FROM users WHERE id = $1),
          $2,
          NOW()
        )
        ON CONFLICT DO NOTHING
      `;

      await query(queryText, [userId, command]);
    } catch (error) {
      logger.error('Error recording bot command usage:', error);
      // Don't throw - this is just analytics
    }
  }
}

export const userAppUsageService = new UserAppUsageService();