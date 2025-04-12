import { User } from '../models/User';
import { PROMPTS } from '../constants';
import { Prompt, PromptType } from '../types';
import { logger } from '../utils/logger';

export class PromptService {
  private promptHistory: Record<PromptType, string[]> = {
    self_awareness: [],
    connections: []
  };

  /**
   * Get a random prompt of the specified type
   */
  private getRandomPrompt(type: PromptType): string {
    const prompts = PROMPTS[type];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Get a prompt of a specific type, avoiding repetition if possible
   */
  private getPromptByType(type: PromptType): string {
    // Initialize history for this type if not exists
    if (!this.promptHistory[type]) {
      this.promptHistory[type] = [];
    }
    
    // Filter out prompts that have been used
    const availablePrompts = PROMPTS[type].filter(
      prompt => !this.promptHistory[type].includes(prompt)
    );
    
    // If all prompts have been used, reset history
    if (availablePrompts.length === 0) {
      logger.info(`All prompts of type ${type} have been used, resetting history`);
      this.promptHistory[type] = [];
      return this.getRandomPrompt(type);
    }
    
    const prompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    
    // Add to history
    this.promptHistory[type].push(prompt);
    
    return prompt;
  }

  /**
   * Get a prompt of a specific type requested by the user
   */
  async getPromptBySpecificType(userId: string, type: PromptType): Promise<Prompt> {
    try {
      // Get user from database to update the prompt count
      let user = await User.findOne({ id: userId });
      let promptCount = 1;
      
      if (user) {
        // Increment prompt count
        promptCount = (user.promptCount || 0) + 1;
        user.promptCount = promptCount;
        await user.save();
      } else {
        // Create new user with count = 1
        user = new User({
          id: userId,
          createdAt: new Date(),
          promptCount: 1
        });
        await user.save();
      }
      
      // Get prompt of the requested type
      const promptText = this.getPromptByType(type);
      
      return {
        text: promptText,
        type: type,
        count: promptCount
      };
    } catch (error) {
      logger.error(`Error getting specific prompt for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get the next prompt for a user based on their prompt count
   */
  async getNextPromptForUser(userId: string): Promise<Prompt> {
    try {
      // Get user from database
      let user = await User.findOne({ id: userId });
      let promptCount = 1;
      
      if (user) {
        // Increment prompt count
        promptCount = (user.promptCount || 0) + 1;
        user.promptCount = promptCount;
        await user.save();
      } else {
        // Create new user with count = 1
        user = new User({
          id: userId,
          createdAt: new Date(),
          promptCount: 1
        });
        await user.save();
      }
      
      // Determine prompt type based on count
      // Odd numbers (including 1) get self-awareness
      // Even numbers get connections
      const promptType: PromptType = promptCount % 2 === 1 ? 'self_awareness' : 'connections';
      
      // Get prompt of determined type
      const promptText = this.getPromptByType(promptType);
      
      return {
        text: promptText,
        type: promptType,
        count: promptCount
      };
    } catch (error) {
      logger.error(`Error getting next prompt for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a journal entry object
   */
  createJournalEntry(prompt: string, response: string, promptType: PromptType): {
    prompt: string;
    response: string;
    promptType: PromptType;
    timestamp: Date;
  } {
    return {
      prompt,
      response,
      promptType,
      timestamp: new Date()
    };
  }
}

// Create and export a singleton instance
export const promptService = new PromptService();