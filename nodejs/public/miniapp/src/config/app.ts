// nodejs/public/miniapp/src/types/miniapp.ts
// Complete type definitions for the ThyKnow Mini App with weekly streak support

// ===========================================
// CORE DATA INTERFACES
// ===========================================

// Prompt data structure
export interface PromptData {
  type: string;
  typeLabel: string;
  text: string;
  hint: string;
}

// Journal entry structure (enhanced with weekly streak data)
export interface JournalEntry {
  id: number;
  date: string;
  promptType: string;
  prompt: string;
  response: string;
  // Weekly streak additions
  pointsEarned?: number;
  streakWeek?: number;
  weekId?: string;
  timestamp?: string;
}

// User data structure
export interface UserData {
  userId: string;
  preferences?: {
    [key: string]: any;
  };
}

// Response data structure (enhanced with weekly streak rewards)
export interface ResponseData {
  success: boolean;
  message: string;
  entryId?: string | number;
  needsNewPrompt?: boolean;
  // Weekly streak additions
  rewards?: WeeklyRewardData;
  motivationalMessage?: string;
  nextPromptHint?: string;
}

// ===========================================
// WEEKLY STREAK INTERFACES
// ===========================================

// Weekly streak data
export interface WeeklyStreakData {
  current: number;
  longest: number;
  weeksUntilNextMilestone: number;
  nextMilestoneReward: number;
  hasEntryThisWeek: boolean;
  currentWeekId: string;
}

// Points data
export interface PointsData {
  total: number;
  recentHistory: PointsHistoryEntry[];
}

// Points history entry
export interface PointsHistoryEntry {
  points: number;
  reason: string;
  streakWeek?: number;
  weekId?: string;
  date: string;
}

// Weekly rewards response
export interface WeeklyRewardData {
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean;
  isMultipleEntry: boolean;
  weekId: string;
}

// Weekly rewards API response
export interface WeeklyRewardsResponse {
  success: boolean;
  entry: {
    id: number;
    prompt: string;
    response: string;
    timestamp: string;
  };
  rewards: WeeklyRewardData;
  motivationalMessage: string;
  nextPromptHint?: string;
}

// Milestone data
export interface MilestoneData {
  name: string;
  reward: number;
}

// Weekly streak configuration
export interface WeeklyStreakConfig {
  BASE_POINTS: number;
  STREAK_BONUS_PER_WEEK: number;
  BONUS_ENTRY_POINTS: number;
  MILESTONES: Record<number, MilestoneData>;
  WEEK_START_DAY: number;
  TIMEZONE: string;
  MIN_RESPONSE_LENGTH: number;
  MAX_RESPONSE_LENGTH: number;
  CELEBRATION_DISPLAY_DURATION: number;
}

// Streak messages
export interface StreakMessages {
  FIRST_ENTRY: string;
  STREAK_CONTINUED: string;
  STREAK_BROKEN: string;
  NEW_RECORD: string;
  MILESTONE_REACHED: string;
  BONUS_ENTRY: string;
  POINTS_EARNED: string;
  ENCOURAGEMENT: string[];
}

// ===========================================
// APP CONFIGURATION INTERFACES
// ===========================================

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

// API endpoints (enhanced with weekly streak endpoints)
export interface ApiEndpoints {
  // Core endpoints
  CONFIG: string;
  USER: string;
  TODAYS_PROMPT: string;
  NEW_PROMPT: string;
  HISTORY: string;
  RESPONSES: string;
  RANDOM_AFFIRMATION: string;
  RANDOM_MESSAGE: string;
  // Weekly streak endpoints
  STREAK_INFO?: string;
  PROMPT_WITH_STREAK?: string;
  WEEKLY_HISTORY?: string;
  SYSTEM_STATS?: string;
  MILESTONES?: string;
}

// Element IDs (enhanced with weekly streak elements)
export interface ElementIds {
  // Core elements
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
  // Weekly streak elements
  STREAK_CONTAINER?: string;
  STREAK_NUMBER?: string;
  STREAK_FLAME?: string;
  POINTS_DISPLAY?: string;
  WEEKLY_STATUS?: string;
  MILESTONE_INFO?: string;
  POINTS_HISTORY?: string;
  MILESTONES_GRID?: string;
  PROGRESS_SECTION?: string;
  PROGRESS_CARDS?: string;
  THIS_WEEK_BADGE?: string;
  CELEBRATION_CONTENT?: string;
  WEEKLY_SCHEDULE_SECTION?: string;
  SCHEDULE_BREAKDOWN?: string;
  STREAK_NOTIFICATION?: string;
  MILESTONE_CELEBRATION?: string;
  POINTS_EARNED_DISPLAY?: string;
}

// Timing constants (enhanced with weekly streak timing)
export interface TimingConstants {
  // Core timing
  NOTIFICATION_DURATION: number;
  PULSE_DURATION: number;
  SCROLL_DURATION: number;
  // Weekly streak timing
  STREAK_ANIMATION_DURATION?: number;
  POINTS_COUNT_UP_DURATION?: number;
  MILESTONE_CELEBRATION_DURATION?: number;
  STREAK_PULSE_INTERVAL?: number;
  NOTIFICATION_FADE_DURATION?: number;
  SMOOTH_SCROLL_DURATION?: number;
}

// Fallback data (enhanced with weekly streak data)
export interface Fallbacks {
  PROMPT: PromptData;
  HISTORY: JournalEntry[];
  // Weekly streak fallbacks
  STREAK_DATA?: WeeklyStreakData;
  POINTS_DATA?: PointsData;
}

// ===========================================
// UTILITY INTERFACES
// ===========================================

// Weekly utility functions
export interface WeeklyUtils {
  getCurrentWeekId(): string;
  getWeekNumber(date: Date): number;
  formatPoints(points: number): string;
  getMilestoneName(weeks: number): string;
  formatMessage(template: string, data: Record<string, any>): string;
}

// ===========================================
// MISC INTERFACES
// ===========================================

// Affirmation structure
export interface Affirmation {
  text: string;
  author: string;
}

// Dino message structure
export interface DinoMessage {
  message: string;
}

// Prompt type
export type PromptType = 'self_awareness' | 'connections';

// ===========================================
// TELEGRAM WEBAPP INTERFACES
// ===========================================

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

// ===========================================
// GLOBAL DECLARATIONS
// ===========================================

// Extend Window interface to include Telegram
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
    originalFetch: typeof fetch;
  }
}