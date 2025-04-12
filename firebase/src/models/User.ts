// File: src/models/User.ts
// User Model for PostgreSQL

import { query, transaction } from '../database';
import { PromptType } from '../types';
import { logger } from '../utils/logger';

// User interface
export interface IUser {
  id: string; // Telegram user ID
  createdAt: Date;
  promptCount: number;
  schedulePreference: ISchedulePreference;
}

// Last prompt interface
export interface ILastPrompt {
  userId: string;
  text: string;
  type: PromptType;
  timestamp: Date;
}

// Schedule preference interface
export interface ISchedulePreference {
  day: number; // 0-6 (Sunday to Saturday)
  hour: number; // 0-23
  enabled: boolean;
}

export class User {
  /**
   * Find a user by their Telegram ID
   */
  static async findOne(id: string): Promise<IUser | null> {
    try {
      const users = await query<IUser>(`
        SELECT 
          u.id, 
          u.created_at AS "createdAt", 
          u.prompt_count AS "promptCount",
          u.schedule_day AS "scheduleDay",
          u.schedule_hour AS "scheduleHour",
          u.schedule_enabled AS "scheduleEnabled"
        FROM users u
        WHERE u.id = $1
      `, [id]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];
      
      // Transform the flat data structure into the expected interface
      return {
        id: user.id,
        createdAt: user.createdAt,
        promptCount: user.promptCount,
        schedulePreference: {
          day: user.scheduleDay,
          hour: user.scheduleHour,
          enabled: user.scheduleEnabled
        }
      };
    } catch (error) {
      logger.error(`Error finding user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find a user by their Telegram ID along with their last prompt
   */
  static async findOneWithLastPrompt(id: string): Promise<(IUser & { lastPrompt?: ILastPrompt }) | null> {
    try {
      const result = await query(`
        SELECT 
          u.id, 
          u.created_at AS "createdAt", 
          u.prompt_count AS "promptCount",
          u.schedule_day AS "scheduleDay",
          u.schedule_hour AS "scheduleHour",
          u.schedule_enabled AS "scheduleEnabled",
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
      
      // Transform the flat data structure into the expected interface
      const user: IUser & { lastPrompt?: ILastPrompt } = {
        id: row.id,
        createdAt: row.createdAt,
        promptCount: row.promptCount,
        schedulePreference: {
          day: row.scheduleDay,
          hour: row.scheduleHour,
          enabled: row.scheduleEnabled
        }
      };

      // Add last prompt if it exists
      if (row.lastPromptText) {
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
   * Create a new user
   */
  static async create(data: {
    id: string;
    createdAt?: Date;
    promptCount?: number;
    schedulePreference?: Partial<ISchedulePreference>;
  }): Promise<IUser> {
    try {
      const schedulePreference = data.schedulePreference || {};
      
      const result = await query<IUser>(`
        INSERT INTO users (
          id, 
          created_at, 
          prompt_count, 
          schedule_day, 
          schedule_hour, 
          schedule_enabled
        )
        VALUES (
          $1, 
          $2, 
          $3, 
          $4, 
          $5, 
          $6
        )
        RETURNING 
          id, 
          created_at AS "createdAt", 
          prompt_count AS "promptCount",
          schedule_day AS "scheduleDay",
          schedule_hour AS "scheduleHour",
          schedule_enabled AS "scheduleEnabled"
      `, [
        data.id,
        data.createdAt || new Date(),
        data.promptCount || 0,
        schedulePreference.day !== undefined ? schedulePreference.day : 1,
        schedulePreference.hour !== undefined ? schedulePreference.hour : 9,
        schedulePreference.enabled !== undefined ? schedulePreference.enabled : true
      ]);

      const user = result[0];
      
      // Transform the flat data structure into the expected interface
      return {
        id: user.id,
        createdAt: user.createdAt,
        promptCount: user.promptCount,
        schedulePreference: {
          day: user.scheduleDay,
          hour: user.scheduleHour,
          enabled: user.scheduleEnabled
        }
      };
    } catch (error) {
      logger.error(`Error creating user ${data.id}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  static async update(
    id: string,
    data: {
      promptCount?: number;
      schedulePreference?: Partial<ISchedulePreference>;
    }
  ): Promise<IUser> {
    try {
      // Build the update parts dynamically based on what's provided
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
      
      // If there's nothing to update, just return the existing user
      if (updates.length === 0) {
        return await User.findOne(id) as IUser;
      }
      
      // Add the ID as the last parameter
      values.push(id);
      
      const result = await query<IUser>(`
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING 
          id, 
          created_at AS "createdAt", 
          prompt_count AS "promptCount",
          schedule_day AS "scheduleDay",
          schedule_hour AS "scheduleHour",
          schedule_enabled AS "scheduleEnabled"
      `, values);

      if (result.length === 0) {
        throw new Error(`User with ID ${id} not found`);
      }

      const user = result[0];
      
      // Transform the flat data structure into the expected interface
      return {
        id: user.id,
        createdAt: user.createdAt,
        promptCount: user.promptCount,
        schedulePreference: {
          day: user.scheduleDay,
          hour: user.scheduleHour,
          enabled: user.scheduleEnabled
        }
      };
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Save the last prompt for a user
   */
  static async saveLastPrompt(userId: string, prompt: { text: string; type: PromptType }): Promise<void> {
    try {
      await transaction(async (client) => {
        // Check if a last prompt already exists for this user
        const existingPrompt = await client.query(
          'SELECT user_id FROM last_prompts WHERE user_id = $1',
          [userId]
        );
        
        if (existingPrompt.rows.length > 0) {
          // Update existing last prompt
          await client.query(
            `UPDATE last_prompts 
             SET text = $1, type = $2, timestamp = NOW() 
             WHERE user_id = $3`,
            [prompt.text, prompt.type, userId]
          );
        } else {
          // Insert new last prompt
          await client.query(
            `INSERT INTO last_prompts (user_id, text, type, timestamp) 
             VALUES ($1, $2, $3, NOW())`,
            [userId, prompt.text, prompt.type]
          );
        }
      });
    } catch (error) {
      logger.error(`Error saving last prompt for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  static async find(): Promise<IUser[]> {
    try {
      const users = await query<any>(`
        SELECT 
          id, 
          created_at AS "createdAt", 
          prompt_count AS "promptCount",
          schedule_day AS "scheduleDay",
          schedule_hour AS "scheduleHour",
          schedule_enabled AS "scheduleEnabled"
        FROM users
      `);
      
      // Transform the flat data structure into the expected interface
      return users.map(user => ({
        id: user.id,
        createdAt: user.createdAt,
        promptCount: user.promptCount,
        schedulePreference: {
          day: user.scheduleDay,
          hour: user.scheduleHour,
          enabled: user.scheduleEnabled
        }
      }));
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }
}