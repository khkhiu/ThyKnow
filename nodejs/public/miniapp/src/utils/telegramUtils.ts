// public/miniapp/src/utils/telegramUtils.ts
/**
 * Telegram WebApp utilities
 */
import { TelegramWebApp } from '../types';

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp(): TelegramWebApp {
  return window.Telegram.WebApp;
}

/**
 * Update theme based on Telegram color scheme
 */
export function updateTheme(): void {
  const tg = getTelegramWebApp();
  const isDarkMode = tg.colorScheme === 'dark';
  
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

/**
 * Initialize Telegram WebApp
 */
export function initializeTelegram(): void {
  const tg = getTelegramWebApp();
  
  // Expand the WebApp to full height
  tg.expand();
  
  // Set the theme
  updateTheme();
  
  // Create a global fetch wrapper that includes Telegram init data
  window.originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Create new options object to avoid modifying the original
    const newInit: RequestInit = init ? { ...init } : {};
    
    // Initialize headers if not present
    newInit.headers = newInit.headers || {};
    
    // Add Telegram init data to headers
    if (tg.initData) {
      newInit.headers = {
        ...newInit.headers,
        'X-Telegram-Init-Data': tg.initData
      };
    }
    
    // Call original fetch with updated options
    return window.originalFetch(input, newInit);
  };
  
  // Listen for theme changes
  tg.onEvent('themeChanged', updateTheme);
}

/**
 * Provide haptic feedback
 */
export function hapticFeedback(type: 'success' | 'error' | 'warning'): void {
  const tg = getTelegramWebApp();
  
  if (tg.HapticFeedback) {
    tg.HapticFeedback.notificationOccurred(type);
  }
}

/**
 * Get user ID from Telegram WebApp
 */
export function getUserId(): string | null {
  const tg = getTelegramWebApp();
  const telegramUser = tg.initDataUnsafe?.user;
  
  if (!telegramUser || !telegramUser.id) {
    console.warn('No user data available from Telegram');
    return null;
  }
  
  return telegramUser.id.toString();
}

/**
 * Setup back button handler
 */
export function setupBackButton(callback: () => void): void {
  const tg = getTelegramWebApp();
  tg.BackButton.onClick(callback);
}