// File: src/models/Feedback.ts
// Feedback Model for PostgreSQL

import { query } from '../database';
import { logger } from '../utils/logger';

// Feedback interface
export interface IFeedback {
  id: number;
  userId: string;
  content: string;
  timestamp: Date;
  isResolved: boolean;
}

export class Feedback {
  /**
   * Create a new feedback entry
   */
  static async create(data: {
    userId: string;
    content: string;
    timestamp?: Date;
  }): Promise<IFeedback> {
    try {
      const result = await query<IFeedback>(`
        INSERT INTO feedback (
          user_id, 
          content, 
          timestamp,
          is_resolved
        )
        VALUES ($1, $2, $3, $4)
        RETURNING 
          id, 
          user_id AS "userId", 
          content, 
          timestamp,
          is_resolved AS "isResolved"
      `, [
        String(data.userId),  // Ensure userId is a string
        data.content,
        data.timestamp || new Date(),
        false // Default to not resolved
      ]);

      return result[0];
    } catch (error) {
      logger.error(`Error creating feedback for user ${data.userId}:`, error);
      throw error;
    }
  }

  /**
   * Find feedback by user ID
   */
  static async findByUserId(userId: string, limit: number = 5): Promise<IFeedback[]> {
    try {
      return await query<IFeedback>(`
        SELECT 
          id, 
          user_id AS "userId", 
          content, 
          timestamp,
          is_resolved AS "isResolved"
        FROM feedback
        WHERE user_id = $1
        ORDER BY timestamp DESC
        LIMIT $2
      `, [String(userId), limit]);
    } catch (error) {
      logger.error(`Error finding feedback for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find all feedback entries with optional filters
   */
  static async findAll(options: {
    isResolved?: boolean,
    limit?: number
  } = {}): Promise<IFeedback[]> {
    try {
      let sql = `
        SELECT 
          id, 
          user_id AS "userId", 
          content, 
          timestamp,
          is_resolved AS "isResolved"
        FROM feedback
      `;
      
      const params: any[] = [];
      
      if (options.isResolved !== undefined) {
        sql += ` WHERE is_resolved = $1`;
        params.push(options.isResolved);
      }
      
      sql += ` ORDER BY timestamp DESC`;
      
      if (options.limit) {
        sql += ` LIMIT $${params.length + 1}`;
        params.push(options.limit);
      }
      
      return await query<IFeedback>(sql, params);
    } catch (error) {
      logger.error('Error finding all feedback:', error);
      throw error;
    }
  }

  /**
   * Mark feedback as resolved
   */
  static async markAsResolved(id: number, isResolved: boolean = true): Promise<IFeedback | null> {
    try {
      const result = await query<IFeedback>(`
        UPDATE feedback
        SET is_resolved = $1
        WHERE id = $2
        RETURNING 
          id, 
          user_id AS "userId", 
          content, 
          timestamp,
          is_resolved AS "isResolved"
      `, [isResolved, id]);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      logger.error(`Error updating feedback status with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a feedback entry
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await query(`
        DELETE FROM feedback
        WHERE id = $1
        RETURNING id
      `, [id]);

      return result.length > 0;
    } catch (error) {
      logger.error(`Error deleting feedback with ID ${id}:`, error);
      throw error;
    }
  }
}