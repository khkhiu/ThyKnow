// src/types/index.ts - Updated with SchedulePreference
import { Timestamp } from 'firebase-admin/firestore';

export type PromptType = 'self_awareness' | 'connections';

export interface LastPrompt {
  text: string;
  type: PromptType;
  timestamp: Timestamp;
}

export interface SchedulePreference {
  enabled: boolean;             // Whether automatic prompts are enabled
  dayOfWeek: number;            // 0-6, where 0 is Sunday
  hour: number;                 // 0-23
  minute: number;               // 0-59
  lastUpdated?: Timestamp;      // When preferences were last updated
}

export interface UserPreferences {
  // User customization preferences
  theme?: string;               // UI theme (default, dinosaur, etc.)
  reminderEnabled?: boolean;    // Whether to send reminder notifications
  reminderHour?: number;        // Hour of day for reminders (0-23)
  language?: string;            // Preferred language for prompts
  promptCategories?: PromptType[]; // Which categories they want to receive
  schedule?: SchedulePreference;  // Schedule preferences for receiving prompts
}

export interface User {
  id: string;                   // Telegram user ID
  createdAt: Timestamp;         // Account creation timestamp
  lastActive?: Timestamp;       // Last interaction timestamp
  promptCount: number;          // Number of prompts received
  lastPrompt?: LastPrompt;      // The last prompt sent to the user
  preferences?: UserPreferences; // User preferences
  stats?: UserStats;            // User engagement statistics
  schedulePreference?: SchedulePreference; // Schedule preferences (to support existing code)
}

export interface UserStats {
  // Statistics about user engagement
  totalResponses: number;       // Total responses submitted
  streakDays: number;           // Current streak of consecutive days journaling
  longestStreak: number;        // Longest streak ever achieved
  averageResponseLength: number; // Average length of responses in characters
  promptsThisWeek: number;      // Prompts responded to this week
  favoriteCount: number;        // Number of entries marked as favorite
}

export interface JournalEntry {
  id?: string;                  // Document ID
  prompt: string;               // The question asked
  promptType: PromptType;       // 'self_awareness' or 'connections'
  response: string;             // User's response
  timestamp: Timestamp;         // When the response was saved
  isFavorite?: boolean;         // Whether the user marked this as a favorite
  tags?: string[];              // User-defined tags for this entry
  metrics?: {                   // Optional metrics
    responseTime: number;       // Time taken to respond in seconds
    characterCount: number;     // Length of response
    wordCount: number;          // Number of words in response
  };
}

export interface Prompt {
  text: string;                 // The prompt text
  type: PromptType;             // Category of the prompt
  count: number;                // Sequence number for this user
}

export interface PromptsCollection {
  self_awareness: string[];
  connections: string[];
}

export interface PromptMetrics {
  // Analytics for prompts
  promptId: string;             // Unique ID for the prompt
  text: string;                 // Prompt text
  type: PromptType;             // Category
  timesUsed: number;            // How many times this prompt has been sent
  responseRate: number;         // Percentage of users who responded
  averageResponseLength: number; // Average length of responses
  userRatings: number[];        // Array of user ratings (1-5)
}

export interface WeeklyPromptResult {
  userId: string;
  success: boolean;
  error?: string;
  promptType?: PromptType;
  timestamp: Timestamp;
}