// File: public/miniapp/src/config/constants.ts
// Application constants and configuration

export const API_ENDPOINTS = {
  CONFIG: '/miniapp/config',
  USER: (userId: number) => `/api/miniapp/user/${userId}`,
  TODAYS_PROMPT: (userId: number) => `/api/miniapp/prompts/today/${userId}`,
  NEW_PROMPT: (userId: number) => `/api/miniapp/prompts/new/${userId}`,
  HISTORY: (userId: number) => `/api/miniapp/history/${userId}`,
  RESPONSES: (userId: number) => `/api/miniapp/responses/${userId}`,
  STREAK: (userId: number) => `/api/miniapp/streak/${userId}`,
  RANDOM_AFFIRMATION: '/api/miniapp/pet/random',
  RANDOM_MESSAGE: '/api/miniapp/affirmations/random'
};

export const ELEMENT_IDS = {
  LOADING: 'loading',
  CONTENT: 'content',
  ERROR: 'error',
  ERROR_TEXT: 'error-text',
  RETRY_BUTTON: 'retry-button',
  PROMPT_DISPLAY: 'prompt-display',
  RESPONSE_FIELD: 'response-field',
  SUBMIT_BUTTON: 'submit-button',
  NEW_PROMPT_BUTTON: 'new-prompt-button',
  USER_STREAK: 'user-streak',
  USER_POINTS: 'user-points',
  PET_DISPLAY: 'pet-display-container',
  ACHIEVEMENTS_GRID: 'achievements-grid',
  STATS_OVERVIEW: 'stats-overview',
  CARE_ACTIVITIES: 'care-activities',
  HISTORY_ENTRIES: 'history-entries',
  EMPTY_HISTORY: 'empty-history',
  NOTIFICATION_CONTAINER: 'notification-container'
};

export const TIMING_CONSTANTS = {
  NOTIFICATION_DURATION: 4000,
  ANIMATION_DURATION: 300,
  TYPING_DELAY: 50,
  AUTO_SAVE_DELAY: 2000,
  RETRY_DELAY: 1000
};

export const FALLBACKS = {
  PROMPT: {
    id: 'fallback-1',
    type: 'Self-Reflection',
    text: 'What is one thing you learned about yourself today?',
    hint: 'Consider moments of awareness, growth, or discovery throughout your day.',
    category: 'personal-growth'
  },
  HISTORY: [],
  USER_DATA: {
    id: 999999,
    streak: { current: 0, longest: 0 },
    points: { total: 0 },
    level: 1,
    achievements: []
  }
};

export const PET_CONSTANTS = {
  MAX_HEALTH: 100,
  MAX_HAPPINESS: 100,
  LEVEL_UP_THRESHOLD: 100,
  CARE_COOLDOWN: 300000, // 5 minutes
  DECAY_RATE: 0.5 // per day
};

export const ACHIEVEMENT_CATEGORIES = {
  BEGINNER: 'Beginner',
  CONSISTENCY: 'Consistency',
  GROWTH: 'Growth',
  DEDICATION: 'Dedication',
  MASTER: 'Master',
  MASTERY: 'Mastery'
};