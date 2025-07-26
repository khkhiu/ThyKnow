// src/services/promptService.ts (Updated with proper typing)
import { User } from '../models/User';
import { PROMPTS } from '../constants/prompts'; // ✅ Fixed: Import from prompts.ts instead of index.ts
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
      userId = String(userId);
      
      // Get user from database
      let user = await User.findOne(userId);
      let promptCount = 1;
      
      if (user) {
        // Increment prompt count
        const oldCount = user.promptCount || 0;
        promptCount = oldCount + 1;
        
        // DEBUG: Log the prompt count change
        logger.info(`🔄 Prompt rotation debug - User ${userId}: ${oldCount} → ${promptCount}`);
        
        await User.update(userId, { promptCount });
      } else {
        // Create new user with count = 1
        logger.info(`🔄 New user ${userId}: promptCount = 1`);
        await User.create({
          id: userId,
          createdAt: new Date(),
          promptCount: 1
        });
      }
      
      // Determine prompt type based on count or use specified type
      let selectedPromptType: PromptType;
      
      if (promptType) {
        selectedPromptType = promptType;
        logger.info(`🎯 User ${userId}: Using chosen type: ${selectedPromptType}`);
      } else {
        // Otherwise, alternate based on prompt count
        selectedPromptType = promptCount % 2 === 1 ? 'self_awareness' : 'connections';
        logger.info(`🔄 User ${userId}: Count ${promptCount} → Type: ${selectedPromptType} (${promptCount % 2 === 1 ? 'ODD' : 'EVEN'})`);
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
   * Fixed: Added proper type for prompt parameter
   */
  createJournalEntry(
    prompt: string, 
    response: string, 
    promptType: PromptType
  ): {
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

  /**
   * Generate a prompt for a specific user (considering their history)
   */
  async generatePrompt(userId: string): Promise<{ text: string; type: PromptType; count: number }> {
    try {
      // Get the user's next prompt using existing logic
      const prompt = await this.getNextPromptForUser(userId);
      
      return {
        text: prompt.text,
        type: prompt.type,
        count: prompt.count
      };
    } catch (error) {
      logger.error(`Error generating prompt for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Process prompt response (if this is the function causing the typing error)
   * Fixed: Added proper type for prompt parameter
   */
  processPrompt(prompt: { text: string; type: PromptType; response?: string }): {
    processed: boolean;
    type: PromptType;
    hasResponse: boolean;
  } {
    return {
      processed: true,
      type: prompt.type,
      hasResponse: Boolean(prompt.response)
    };
  }
}

// Create and export a singleton instance
export const promptService = new PromptService();