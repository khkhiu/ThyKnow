import { User, IUser, ILastPrompt } from '../models/User';
import { JournalEntry, IJournalEntry } from '../models/JournalEntry';
import { Prompt, PromptType } from '../types';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Get a user by Telegram ID
   */
  async getUser(userId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ id: userId });
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
      // Check if user exists
      let user = await User.findOne({ id: userId });
      
      if (!user) {
        // Create new user
        user = new User({
          id: userId,
          createdAt: new Date(),
          promptCount: 0,
          ...data
        });
        await user.save();
        logger.info(`Created new user with ID: ${userId}`);
      } else if (Object.keys(data).length > 0) {
        // Update existing user
        Object.assign(user, data);
        await user.save();
        logger.info(`Updated user with ID: ${userId}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`Error creating/updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Save the last prompt sent to a user
   */
  async saveLastPrompt(userId: string, prompt: Prompt): Promise<void> {
    try {
      const lastPrompt: ILastPrompt = {
        text: prompt.text,
        type: prompt.type,
        timestamp: new Date()
      };
      
      await this.createOrUpdateUser(userId, { lastPrompt });
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
      const journalEntry = new JournalEntry({
        userId,
        ...entry
      });
      
      await journalEntry.save();
      // Cast the _id to string directly to avoid type issues
      return String(journalEntry._id);
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
      return await JournalEntry.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
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