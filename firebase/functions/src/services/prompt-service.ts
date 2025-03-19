import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { JournalEntry, Prompt, PromptType } from '../types';
import { PROMPTS } from '../constants';

class PromptService {
  private db: Firestore;
  private promptHistory: Record<PromptType, string[]> = {
    self_awareness: [],
    connections: []
  };
  private userPromptCounts: Record<string, number> = {};

  constructor(db: Firestore) {
    this.db = db;
  }

  private getRandomPrompt(type: PromptType): string {
    const prompts = PROMPTS[type];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

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
      console.log(`All prompts of type ${type} have been used, resetting history`);
      this.promptHistory[type] = [];
      return this.getRandomPrompt(type);
    }
    
    const prompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    
    // Add to history
    this.promptHistory[type].push(prompt);
    
    return prompt;
  }

  async getNextPromptForUser(userId: string): Promise<Prompt> {
    // Get user from database
    const userRef = this.db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    let promptCount = 0;
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      promptCount = (userData?.promptCount || 0) + 1;
      
      // Update user's prompt count
      await userRef.update({ promptCount });
    } else {
      // Create new user
      promptCount = 1;
      await userRef.set({ 
        id: userId, 
        createdAt: Timestamp.now(),
        promptCount: 1
      });
    }
    
    // Store count locally too
    this.userPromptCounts[userId] = promptCount;
    
    // Determine prompt type based on count (odd: self-awareness, even: connections)
    const promptType: PromptType = promptCount % 2 === 1 ? 'self_awareness' : 'connections';
    const promptText = this.getPromptByType(promptType);
    
    return {
      text: promptText,
      type: promptType,
      count: promptCount
    };
  }

  createJournalEntry(prompt: string, response: string, promptType: PromptType): JournalEntry {
    return {
      prompt,
      response,
      promptType,
      timestamp: Timestamp.now()
    };
  }
}

export default PromptService;