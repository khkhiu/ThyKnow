// public/miniapp/js/pet/theme.ts
import { TelegramWebApp } from '../../types/miniapp';

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
    
    console.log(`Theme set to ${isDarkMode ? 'dark' : 'light'} mode`);
}

/**
 * Toggle between light and dark theme (for testing without Telegram)
 * Updates both the visual theme and the toggle button
 */
export function toggleTheme(): void {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    // Update toggle button if it exists
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
    
    console.log(`Theme manually toggled to ${isDark ? 'dark' : 'light'} mode`);
}