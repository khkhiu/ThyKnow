// src/types/index.ts
// Define prompt types
export type PromptType = 'self_awareness' | 'connections';

// Prompt structure
export interface Prompt {
  text: string;
  type: PromptType;
  count: number;
}

// Prompts collection
export interface PromptsCollection {
  self_awareness: string[];
  connections: string[];
}

// Last prompt interface
export interface LastPrompt {
  text: string;
  type: PromptType;
  timestamp: Date;
}

// User with last prompt interface - used to ensure type safety
export interface UserWithLastPrompt {
  id: string;
  createdAt: Date;
  promptCount: number;
  schedulePreference: {
    day: number;
    hour: number;
    enabled: boolean;
  };
  lastPrompt: LastPrompt;
}