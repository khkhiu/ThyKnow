// public/miniapp/src/types/index.ts
export * from './telegramTypes';
export * from './promptTypes';
export * from './historyTypes';

// App configuration type
export interface AppConfig {
  appName: string;
  version: string;
  timezone: string;
  features: {
    selfAwareness: boolean;
    connections: boolean;
    history: boolean;
    affirmations: boolean;
    pet: boolean;
  };
}

// User data type
export interface UserData {
  userId: string;
  preferences: Record<string, any>;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Dino message/affirmation
export interface DinoAffirmation {
  text: string;
  author: string;
}