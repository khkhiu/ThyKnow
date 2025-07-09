// src/types/miniapp.ts

// Telegram WebApp Types
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: TelegramChat;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  HapticFeedback: TelegramHapticFeedback;
  CloudStorage: TelegramCloudStorage;
  BiometricManager: TelegramBiometricManager;

  // Methods
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  showPopup(params: TelegramPopupParams, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: TelegramScanQrPopupParams, callback?: (text: string) => void): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (granted: boolean) => void): void;
  ready(): void;
  expand(): void;
  close(): void;
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

export interface TelegramChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface TelegramBackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

export interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isProgressVisible: boolean;
  isActive: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: TelegramMainButtonParams): void;
}

export interface TelegramMainButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  is_active?: boolean;
  is_visible?: boolean;
}

export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

export interface TelegramCloudStorage {
  setItem(key: string, value: string, callback?: (error: string | null, success: boolean) => void): void;
  getItem(key: string, callback: (error: string | null, value: string | null) => void): void;
  getItems(keys: string[], callback: (error: string | null, values: Record<string, string>) => void): void;
  removeItem(key: string, callback?: (error: string | null, success: boolean) => void): void;
  removeItems(keys: string[], callback?: (error: string | null, success: boolean) => void): void;
  getKeys(callback: (error: string | null, keys: string[]) => void): void;
}

export interface TelegramBiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
  init(callback?: () => void): void;
  requestAccess(params: TelegramBiometricRequestAccessParams, callback?: (granted: boolean) => void): void;
  authenticate(params: TelegramBiometricAuthParams, callback?: (success: boolean, token?: string) => void): void;
  updateBiometricToken(token: string, callback?: (success: boolean) => void): void;
  openSettings(): void;
}

export interface TelegramBiometricRequestAccessParams {
  reason?: string;
}

export interface TelegramBiometricAuthParams {
  reason?: string;
}

export interface TelegramPopupParams {
  title?: string;
  message: string;
  buttons?: TelegramPopupButton[];
}

export interface TelegramPopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}

export interface TelegramScanQrPopupParams {
  text?: string;
}

// Note: Global Window.Telegram type should be declared elsewhere in your project
// If you need to declare it, do it in a separate telegram.d.ts file

// Application Types
export type PromptType = 
  | 'self-awareness'
  | 'emotional-intelligence'
  | 'relationships'
  | 'goal-setting'
  | 'mindfulness'
  | 'creativity'
  | 'problem-solving'
  | 'gratitude'
  | 'growth-mindset'
  | 'values-clarification';

export interface PromptData {
  id: string;
  prompt: string;
  type: PromptType;
  category?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ResponseData {
  id: string;
  userId: string | number;
  promptId: string;
  response: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface JournalEntry {
  id: string;
  userId: string | number;
  prompt: string;
  response: string;
  timestamp: string;
  type?: PromptType;
  category?: string;
  metadata?: Record<string, any>;
}

export interface UserData {
  id: string | number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  preferences?: UserPreferences;
  stats?: UserStats;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  promptFrequency: 'daily' | 'weekly' | 'custom';
  preferredPromptTypes: PromptType[];
  timezone: string;
}

export interface UserStats {
  totalResponses: number;
  currentStreak: number;
  longestStreak: number;
  favoritePromptType: PromptType;
  averageResponseLength: number;
  lastResponseDate: string;
}

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
    weeklyStreaks: boolean;
    reactUI: boolean;
  };
  apiEndpoints: {
    base: string;
    prompts: string;
    responses: string;
    history: string;
    streak: string;
    pet: string;
  };
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface AppError {
  message: string;
  type: 'network' | 'validation' | 'auth' | 'server' | 'unknown';
  details?: any;
}