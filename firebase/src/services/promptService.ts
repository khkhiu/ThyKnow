// src/services/promptService.ts
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
   * Get the next prompt for a user based on their prompt count
   * If promptType is provided, use that specific type instead of alternating
   */
  async getNextPromptForUser(userId: string, promptType?: PromptType): Promise<Prompt> {
    try {
      // Get user from database - fixed to pass userId as string
      let user = await User.findOne(userId);
      let promptCount = 1;
      
      if (user) {
        // Increment prompt count
        promptCount = (user.promptCount || 0) + 1;
        
        // Update the user with the new prompt count
        await User.update(userId, { promptCount });
      } else {
        // Create new user with count = 1
        user = await User.create({
          id: userId,
          createdAt: new Date(),
          promptCount: 1
        });
      }
      
      // Determine prompt type based on count or use specified type
      let selectedPromptType: PromptType;
      
      if (promptType) {
        // If a specific type was requested, use that
        selectedPromptType = promptType;
      } else {
        // Otherwise, alternate based on prompt count
        // Odd numbers (including 1) get self-awareness
        // Even numbers get connections
        selectedPromptType = promptCount % 2 === 1 ? 'self_awareness' : 'connections';
      }
      
      // Get prompt of determined type
      const promptText = this.getPromptByType(selectedPromptType);
      
      return {
        text: promptText,
        type: selectedPromptType,
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