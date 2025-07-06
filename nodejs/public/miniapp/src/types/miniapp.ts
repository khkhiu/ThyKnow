// File: public/miniapp/src/types/miniapp.ts
// Enhanced type definitions

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat?: any;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: any, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: any, callback?: (text: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (granted: boolean) => void) => void;
  MainButton: TelegramMainButton;
  BackButton: TelegramBackButton;
  SettingsButton: TelegramSettingsButton;
  HapticFeedback: TelegramHapticFeedback;
  CloudStorage: TelegramCloudStorage;
  BiometricManager: TelegramBiometricManager;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
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
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

export interface TelegramSettingsButton {
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

export interface TelegramCloudStorage {
  setItem: (key: string, value: string, callback?: (error: string | null, success: boolean) => void) => void;
  getItem: (key: string, callback: (error: string | null, value: string) => void) => void;
  getItems: (keys: string[], callback: (error: string | null, values: Record<string, string>) => void) => void;
  removeItem: (key: string, callback?: (error: string | null, success: boolean) => void) => void;
  removeItems: (keys: string[], callback?: (error: string | null, success: boolean) => void) => void;
  getKeys: (callback: (error: string | null, keys: string[]) => void) => void;
}

export interface TelegramBiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
  init: (callback?: () => void) => void;
  requestAccess: (params: { reason?: string }, callback?: (granted: boolean) => void) => void;
  authenticate: (params: { reason?: string }, callback?: (success: boolean, token?: string) => void) => void;
  updateBiometricToken: (token: string, callback?: (success: boolean) => void) => void;
  openSettings: () => void;
}

// Application Data Types
export interface PromptData {
  id: string;
  type: string;
  text: string;
  hint?: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface JournalEntry {
  id: string;
  userId: number;
  promptId: string;
  promptText: string;
  promptType: string;
  response: string;
  timestamp: string;
  points?: number;
  wordCount?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface UserData {
  id: number;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  streak: {
    current: number;
    longest: number;
    lastEntryDate?: string;
  };
  points: {
    total: number;
    history?: PointsHistory[];
  };
  level: number;
  preferences?: UserPreferences;
  achievements?: Achievement[];
  createdAt: string;
  lastActive: string;
}

export interface PointsHistory {
  id: string;
  points: number;
  reason: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface UserPreferences {
  promptTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface PetState {
  character: string;
  mood: string;
  health: number;
  happiness: number;
  level: number;
  streak: number;
  points: number;
  accessories?: string[];
  lastInteraction?: string;
}

export interface CareActivity {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: string;
  healthBoost: number;
  happinessBoost: number;
  cooldown: number;
  available: boolean;
  lastUsed?: string;
}

export interface StatsData {
  totalReflections: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  petLevel: number;
  averageResponseLength: number;
  reflectionsByType: Record<string, number>;
  streakHistory: StreakDay[];
  weeklyActivity: number[];
  monthlyGrowth: MonthlyStats[];
}

export interface StreakDay {
  date: string;
  hasEntry: boolean;
  points: number;
}

export interface MonthlyStats {
  month: string;
  reflections: number;
  points: number;
  streaks: number;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SubmitResponseResult {
  success: boolean;
  points?: number;
  newStreak?: number;
  achievement?: Achievement;
  levelUp?: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
  hasEntryToday: boolean;
  lastEntryDate?: string;
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  reached: boolean;
  reward: number;
}

// Component Props Types
export interface TabProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

export interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  animated?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Event Types
export interface AppEvent {
  type: string;
  data?: any;
  timestamp: string;
}

export interface UserAction extends AppEvent {
  userId: number;
  action: 'submit_response' | 'view_history' | 'care_pet' | 'view_achievements';
}

// Extend Window interface
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
    originalFetch: typeof fetch;
    thyKnowApp?: {
      version: string;
      initialized: boolean;
      state: any;
    };
  }
}

// Export default types for convenience
export type {
  TelegramWebApp as Telegram,
  PromptData as Prompt,
  JournalEntry as Entry,
  UserData as User,
  PetState as Pet
};