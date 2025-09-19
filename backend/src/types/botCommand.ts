// src/types/botCommand.ts
// New unified bot command response interface

export interface BotCommandResponse {
  messageText: string;           // Brief intro/context
  miniappButton: {              // Always present
    text: string;
    url: string;
    deepLink?: string;          // Direct to specific page
  };
  fallbackContent?: string;     // Optional preview in chat
  promotionMessage: string;     // Why the app is better
  parseMode?: 'Markdown' | 'HTML';
}

export interface UserAppUsage {
  hasUsedMiniapp: boolean;
  lastMiniappUse: Date | null;
  miniappUsageCount: number;
  isNewUser: boolean;
  registrationDate: Date;
}

export interface CommandContext {
  userId: string;
  userName: string;
  userAppUsage: UserAppUsage;
  commandName: string;
}

export enum PromotionLevel {
  SOFT = 'soft',           // Gentle nudges
  APP_FIRST = 'app_first', // Strong app promotion
  APP_ONLY = 'app_only'    // Only app buttons
}

export interface DeepLinkParams {
  page?: 'prompt' | 'history' | 'streak' | 'choose' | 'pet' | 'home';
  action?: 'new' | 'choose' | 'view';
  type?: string;
  ref?: string; // Reference for analytics
}