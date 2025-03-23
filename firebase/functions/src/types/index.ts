import { Timestamp } from 'firebase-admin/firestore';

export type PromptType = 'self_awareness' | 'connections';

export interface LastPrompt {
  text: string;
  type: PromptType;
  timestamp: Timestamp;
}

export interface User {
  id: string;
  createdAt: Timestamp;
  promptCount: number;
  lastPrompt?: LastPrompt;
}

export interface JournalEntry {
  prompt: string;
  promptType: PromptType;
  response: string;
  timestamp: Timestamp;
}

export interface Prompt {
  text: string;
  type: PromptType;
  count: number;
}

export interface PromptsCollection {
  self_awareness: string[];
  connections: string[];
}