// src/types/miniapp.ts
// Type definitions for the ThyKnow Mini App

// Prompt data structure
export interface PromptData {
  type: string;
  typeLabel: string;
  text: string;
  hint: string;
}

// Journal entry structure
export interface JournalEntry {
  id: number;
  date: string;
  promptType: string;
  prompt: string;
  response: string;
}

// User data structure
export interface UserData {
  userId: string;
  preferences?: {
    [key: string]: any;
  };
}

// Response data structure
export interface ResponseData {
  success: boolean;
  message: string;
  entryId?: string | number;
  needsNewPrompt?: boolean;
}

// App configuration
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

// Affirmation structure
export interface Affirmation {
  text: string;
  author: string;
}

// Dino message structure
export interface DinoMessage {
  message: string;
}

// Telegram WebApp interfaces
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    start_param?: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  expand: () => void;
  close: () => void;
  ready: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  MainButton: TelegramMainButton;
  BackButton: TelegramBackButton;
  HapticFeedback: TelegramHapticFeedback;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive: boolean) => void;
  hideProgress: () => void;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

export interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

// Extend Window interface to include Telegram
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
    originalFetch: typeof fetch;
  }
}

// API constants
export interface ApiEndpoints {
  CONFIG: string;
  USER: string;
  TODAYS_PROMPT: string;
  NEW_PROMPT: string;
  HISTORY: string;
  RESPONSES: string;
  RANDOM_AFFIRMATION: string;
  RANDOM_MESSAGE: string;
}

// Settings for UI elements
export interface ElementIds {
  LOADING: string;
  CONTENT: string;
  ERROR: string;
  PROMPT_TYPE: string;
  PROMPT_TEXT: string;
  PROMPT_HINT: string;
  RESPONSE_FIELD: string;
  SUBMIT_BUTTON: string;
  NEW_PROMPT_BUTTON: string;
  HISTORY_ENTRIES: string;
  EMPTY_HISTORY: string;
  NOTIFICATION_CONTAINER: string;
  RETRY_BUTTON: string;
  DATE_FILTER: string;
  CUSTOM_DATE_CONTAINER: string;
  CUSTOM_DATE: string;
  APPLY_DATE: string;
}

// Timing constants
export interface TimingConstants {
  NOTIFICATION_DURATION: number;
  PULSE_DURATION: number;
  SCROLL_DURATION: number;
}

// Fallback data
export interface Fallbacks {
  PROMPT: PromptData;
  HISTORY: JournalEntry[];
}