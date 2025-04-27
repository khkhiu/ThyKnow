// File: src/services/userService.ts
// User service with PostgreSQL support

import { User, IUser, ISchedulePreference, ILastPrompt } from '../models/User';
import { JournalEntry, IJournalEntry } from '../models/JournalEntry';
import { Prompt, PromptType } from '../types';
import { logger } from '../utils/logger';

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
        const updateData: { promptCount?: number; schedulePreference?: Partial<ISchedulePreference> } = {};
        
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
  async saveLastPrompt(userId: string, prompt: Prompt): Promise<void> {
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
      return await User.find();
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const userService = new UserService();