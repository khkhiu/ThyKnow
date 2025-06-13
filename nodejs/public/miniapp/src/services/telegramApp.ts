// nodejs/public/miniapp/src/services/telegramApp.ts
import { TelegramWebApp, TelegramUser } from '../types/miniapp';

/**
 * Initialize Telegram WebApp
 * @returns The Telegram WebApp instance
 */
export function initTelegramApp(): TelegramWebApp {
  const tg = window.Telegram.WebApp;
  
  // Expand the WebApp to full height
  tg.expand();
  
  // Create a global fetch wrapper that includes Telegram init data
  wrapFetchWithTelegramData(tg);
  
  // Log initialization data for debugging
  console.debug('Telegram Init Data:', tg.initData);
  
  return tg;
}

/**
 * Wrap the fetch function to include Telegram init data
 * @param tg - Telegram WebApp instance
 */
function wrapFetchWithTelegramData(tg: TelegramWebApp): void {
  window.originalFetch = window.fetch;
  window.fetch = function(url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> {
    // Create new options object to avoid modifying the original
    const newOptions: RequestInit = { ...options };
    
    // Initialize headers if not present
    newOptions.headers = newOptions.headers || {};
    
    // Add Telegram init data to headers
    if (tg.initData) {
      newOptions.headers = {
        ...newOptions.headers,
        'X-Telegram-Init-Data': tg.initData
      };
    }
    
    // Call original fetch with updated options
    return window.originalFetch(url, newOptions);
  };
}

/**
 * Get user data from Telegram WebApp
 * @param tg - Telegram WebApp instance
 * @returns User data or null if unavailable
 */
export function getTelegramUser(tg: TelegramWebApp): TelegramUser | null {
  return tg.initDataUnsafe?.user || null;
}

/**
 * Set up the back button handler
 * @param tg - Telegram WebApp instance
 * @param callback - Callback function
 */
export function setupBackButton(tg: TelegramWebApp, callback: () => void): void {
  tg.BackButton.onClick(callback);
}

/**
 * Provide haptic feedback
 * @param tg - Telegram WebApp instance
 * @param type - Feedback type ('success', 'error', 'warning', etc.)
 */
export function provideHapticFeedback(tg: TelegramWebApp, type: 'success' | 'error' | 'warning' = 'success'): void {
  if (tg.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred(type);
  }
}

/**
 * Notify Telegram that the Mini App is ready
 * @param tg - Telegram WebApp instance
 */
export function notifyAppReady(tg: TelegramWebApp): void {
  tg.ready();
}

/**
 * Close the Mini App
 * @param tg - Telegram WebApp instance
 */
export function closeMiniApp(tg: TelegramWebApp): void {
  tg.close();
}