// js/app/ui/theme.js - Theme management

/**
 * Update theme based on Telegram color scheme
 * @param {Object} tg - Telegram WebApp instance
 */
export function updateTheme(tg) {
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
export function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  
  const toggleIcon = document.querySelector('.theme-toggle i');
  const toggleLabel = document.querySelector('.toggle-label');
  
  if (toggleIcon && toggleLabel) {
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
 * @param {Object} tg - Telegram WebApp instance
 */
export function setupThemeListener(tg) {
  tg.onEvent('themeChanged', () => updateTheme(tg));
}