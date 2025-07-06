// File: public/miniapp/src/utils/helpers.ts
// Utility functions for the modern app

/**
 * Format date for display
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    return getRelativeTime(dateObj);
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
    
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return formatDate(date, 'short');
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Animate a number from start to end
 */
export function animateNumber(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number = 1000,
  formatter?: (value: number) => string
): void {
  const startTime = performance.now();
  
  function update(currentTime: number): void {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = lerp(start, end, easedProgress);
    
    element.textContent = formatter ? formatter(currentValue) : Math.round(currentValue).toString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Get streak color based on length
 */
export function getStreakColor(streak: number): string {
  if (streak >= 30) return '#059669'; // Green
  if (streak >= 14) return '#3B82F6'; // Blue
  if (streak >= 7) return '#F59E0B'; // Orange
  if (streak >= 3) return '#8B5CF6'; // Purple
  return '#6B7280'; // Gray
}

/**
 * Get level progress percentage
 */
export function getLevelProgress(points: number, level: number): number {
  const currentLevelPoints = (level - 1) * 100;
  const nextLevelPoints = level * 100;
  const progressPoints = points - currentLevelPoints;
  
  return (progressPoints / 100) * 100;
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get sentiment emoji
 */
export function getSentimentEmoji(sentiment: 'positive' | 'neutral' | 'negative'): string {
  const emojis = {
    positive: '😊',
    neutral: '😐',
    negative: '😔'
  };
  return emojis[sentiment] || '😐';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (error) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

/**
 * Download data as file
 */
export function downloadAsFile(data: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get random element from array
 */
export function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options
  });
}

/**
 * Wait for specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await wait(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },
  
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/**
 * URL helpers
 */
export const url = {
  getQueryParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  },
  
  setQueryParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url.toString());
  },
  
  removeQueryParam(key: string): void {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url.toString());
  }
};

// File: public/miniapp/src/utils/telegram.ts
// Telegram-specific utilities

import type { TelegramWebApp } from '../types/miniapp';

/**
 * Get Telegram theme colors
 */
export function getTelegramTheme(tg: TelegramWebApp): Record<string, string> {
  return tg.themeParams || {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#3390ec',
    button_color: '#3390ec',
    button_text_color: '#ffffff'
  };
}

/**
 * Apply Telegram theme to CSS variables
 */
export function applyTelegramTheme(tg: TelegramWebApp): void {
  const theme = getTelegramTheme(tg);
  const root = document.documentElement;
  
  // Map Telegram theme colors to CSS variables
  const colorMappings = {
    '--tg-bg-color': theme.bg_color,
    '--tg-text-color': theme.text_color,
    '--tg-hint-color': theme.hint_color,
    '--tg-link-color': theme.link_color,
    '--tg-button-color': theme.button_color,
    '--tg-button-text-color': theme.button_text_color
  };
  
  Object.entries(colorMappings).forEach(([property, value]) => {
    if (value) {
      root.style.setProperty(property, value);
    }
  });
}

/**
 * Get user's language preference
 */
export function getUserLanguage(tg: TelegramWebApp): string {
  return tg.initDataUnsafe?.user?.language_code || 'en';
}

/**
 * Check if user is premium
 */
export function isUserPremium(tg: TelegramWebApp): boolean {
  return tg.initDataUnsafe?.user?.is_premium || false;
}

/**
 * Send data to bot
 */
export function sendDataToBot(tg: TelegramWebApp, data: any): void {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    tg.sendData(dataString);
  } catch (error) {
    console.error('Error sending data to bot:', error);
  }
}

/**
 * Set up main button
 */
export function setupMainButton(
  tg: TelegramWebApp,
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isVisible?: boolean;
    isActive?: boolean;
  }
): void {
  const { color, textColor, isVisible = true, isActive = true } = options || {};
  
  tg.MainButton.setText(text);
  
  if (color) tg.MainButton.color = color;
  if (textColor) tg.MainButton.textColor = textColor;
  
  tg.MainButton.onClick(onClick);
  
  if (isVisible) tg.MainButton.show();
  if (isActive) tg.MainButton.enable();
}

/**
 * Set up back button
 */
export function setupBackButton(tg: TelegramWebApp, onClick: () => void): void {
  tg.BackButton.onClick(onClick);
  tg.BackButton.show();
}

/**
 * Generate authentication hash for API requests
 */
export function generateAuthHash(tg: TelegramWebApp): string {
  // This would typically involve the bot token and proper hashing
  // For now, return the init data which should be validated on the server
  return tg.initData;
}

/**
 * Validate init data format
 */
export function validateInitData(initData: string): boolean {
  try {
    // Basic validation - in production, this should be more thorough
    return initData.length > 0 && initData.includes('user=');
  } catch (error) {
    return false;
  }
}