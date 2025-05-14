// theme.js - Theme management for ThyKnow dino friend page

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
    
    console.log(`Theme set to ${isDarkMode ? 'dark' : 'light'} mode`);
}

/**
 * Toggle between light and dark theme (for testing without Telegram)
 * Updates both the visual theme and the toggle button
 */
export function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    // Update toggle button if it exists
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
    
    console.log(`Theme manually toggled to ${isDark ? 'dark' : 'light'} mode`);
}