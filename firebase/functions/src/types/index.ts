// firebase/functions/src/types/index.ts

import { Timestamp } from 'firebase-admin/firestore';

export type PromptType = 'self_awareness' | 'connections';

export interface LastPrompt {
  text: string;
  type: PromptType;
  timestamp: Timestamp;
}

// New interface for user schedule preferences
export interface SchedulePreference {
  enabled: boolean;           // Whether weekly prompts are enabled
  day: number;                // Day of week (0-6, Sunday-Saturday)
  hour: number;               // Hour (0-23)
  timezone: string;           // User's timezone (default: 'Asia/Singapore')
}

export interface User {
  id: string;
  createdAt: Timestamp;
  promptCount: number;
  lastPrompt?: LastPrompt;
  // Add schedule preferences
  schedulePreference: SchedulePreference;
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