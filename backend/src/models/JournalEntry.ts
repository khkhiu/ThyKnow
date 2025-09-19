// File: src/models/JournalEntry.ts
// JournalEntry Model for PostgreSQL

import { query } from '../database';
import { PromptType } from '../types';
import { logger } from '../utils/logger';

// Journal entry interface
export interface IJournalEntry {
  id: number;
  userId: string;
  prompt: string;
  promptType: PromptType;
  response: string;
  timestamp: Date;
}

export class JournalEntry {
  /**
   * Create a new journal entry
   */
  static async create(data: {
    userId: string;
    prompt: string;
    promptType: PromptType;
    response: string;
    timestamp?: Date;
  }): Promise<IJournalEntry> {
    try {
      const result = await query<IJournalEntry>(`
        INSERT INTO journal_entries (
          user_id, 
          prompt, 
          prompt_type, 
          response, 
          timestamp
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING 
          id, 
          user_id AS "userId", 
          prompt, 
          prompt_type AS "promptType", 
          response, 
          timestamp
      `, [
        String(data.userId),  // Ensure userId is a string
        data.prompt,
        data.promptType,
        data.response,
        data.timestamp || new Date()
      ]);

      return result[0];
    } catch (error) {
      logger.error(`Error creating journal entry for user ${data.userId}:`, error);
      throw error;
    }
  }

  /**
   * Find entries for a user
   */
  static async findByUserId(userId: string, limit: number = 5): Promise<IJournalEntry[]> {
    try {
      return await query<IJournalEntry>(`
        SELECT 
          id, 
          user_id AS "userId", 
          prompt, 
          prompt_type AS "promptType", 
          response, 
          timestamp
        FROM journal_entries
        WHERE user_id = $1
        ORDER BY timestamp DESC
        LIMIT $2
      `, [String(userId), limit]);  // Ensure userId is a string
    } catch (error) {
      logger.error(`Error finding journal entries for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find a specific journal entry by ID
   */
  static async findById(id: number): Promise<IJournalEntry | null> {
    try {
      const entries = await query<IJournalEntry>(`
        SELECT 
          id, 
          user_id AS "userId", 
          prompt, 
          prompt_type AS "promptType", 
          response, 
          timestamp
        FROM journal_entries
        WHERE id = $1
      `, [id]);

      if (entries.length === 0) {
        return null;
      }

      return entries[0];
    } catch (error) {
      logger.error(`Error finding journal entry with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a journal entry
   */
  static async update(id: number, data: { response?: string }): Promise<IJournalEntry | null> {
    try {
      if (!data.response) {
        // Nothing to update
        return await JournalEntry.findById(id);
      }

      const result = await query<IJournalEntry>(`
        UPDATE journal_entries
        SET response = $1
        WHERE id = $2
        RETURNING 
          id, 
          user_id AS "userId", 
          prompt, 
          prompt_type AS "promptType", 
          response, 
          timestamp
      `, [data.response, id]);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      logger.error(`Error updating journal entry with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a journal entry
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await query(`
        DELETE FROM journal_entries
        WHERE id = $1
        RETURNING id
      `, [id]);

      return result.length > 0;
    } catch (error) {
      logger.error(`Error deleting journal entry with ID ${id}:`, error);
      throw error;
    }
  }
}