// public/miniapp/js/app/ui/theme.ts
import { TelegramWebApp } from '../../../src/types/miniapp';

/**
 * Update theme based on Telegram color scheme
 * @param tg - Telegram WebApp instance
 */
export function updateTheme(tg: TelegramWebApp): void {
  const isDarkMode = tg.colorScheme === 'dark';
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

/**
 * Toggle theme (for manual testing)
 */
export function toggleTheme(): void {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  
  const toggleIcon = document.querySelector('.theme-toggle i');
  const toggleLabel = document.querySelector('.toggle-label');
  
  if (toggleIcon instanceof HTMLElement && toggleLabel instanceof HTMLElement) {
    if (isDark) {
      toggleIcon.className = 'fas fa-sun';
      toggleLabel.textContent = 'Light Mode';
    } else {
      toggleIcon.className = 'fas fa-moon';
      toggleLabel.textContent = 'Dark Mode';
    }
  }
}

/**
 * Set up theme change listener
 * @param tg - Telegram WebApp instance
 */
export function setupThemeListener(tg: TelegramWebApp): void {
  tg.onEvent('themeChanged', () => updateTheme(tg));
}