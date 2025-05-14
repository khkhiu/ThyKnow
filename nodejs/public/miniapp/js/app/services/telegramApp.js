// telegramApp.js - Telegram WebApp integration

/**
 * Initialize Telegram WebApp
 * @returns {Object} The Telegram WebApp instance
 */
export function initTelegramApp() {
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
 * @param {Object} tg - Telegram WebApp instance
 */
function wrapFetchWithTelegramData(tg) {
  window.originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Create new options object to avoid modifying the original
    const newOptions = { ...options };
    
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
 * @param {Object} tg - Telegram WebApp instance
 * @returns {Object|null} User data or null if unavailable
 */
export function getTelegramUser(tg) {
  return tg.initDataUnsafe?.user || null;
}

/**
 * Set up the back button handler
 * @param {Object} tg - Telegram WebApp instance
 * @param {Function} callback - Callback function
 */
export function setupBackButton(tg, callback) {
  tg.BackButton.onClick(callback);
}

/**
 * Provide haptic feedback
 * @param {Object} tg - Telegram WebApp instance
 * @param {string} type - Feedback type ('success', 'error', 'warning', etc.)
 */
export function provideHapticFeedback(tg, type = 'success') {
  tg.HapticFeedback.notificationOccurred(type);
}

/**
 * Notify Telegram that the Mini App is ready
 * @param {Object} tg - Telegram WebApp instance
 */
export function notifyAppReady(tg) {
  tg.ready();
}

/**
 * Close the Mini App
 * @param {Object} tg - Telegram WebApp instance
 */
export function closeMiniApp(tg) {
  tg.close();
}