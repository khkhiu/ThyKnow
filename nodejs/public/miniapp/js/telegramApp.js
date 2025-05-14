// telegramApp.js - Telegram Web App integration

/**
 * Initialize the Telegram Web App integration
 * @returns {Object} The Telegram WebApp instance
 */
export function initTelegramApp() {
    // Get the Telegram WebApp instance from the global window object
    const tg = window.Telegram.WebApp;
    
    // Expand the WebApp to full height
    tg.expand();
    
    // Log initialization
    console.log("Telegram WebApp initialized");
    console.debug("Telegram Init Data:", tg.initData);
    
    return tg;
}

/**
 * Provide haptic feedback if supported by the device
 * @param {Object} tg - Telegram WebApp instance
 * @param {string} type - Type of haptic feedback ('light', 'medium', 'heavy', etc.)
 */
export function provideHapticFeedback(tg, type = 'light') {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(type);
        console.debug(`Haptic feedback provided: ${type}`);
    }
}

/**
 * Notify Telegram that the Mini App is ready
 * @param {Object} tg - Telegram WebApp instance
 */
export function notifyAppReady(tg) {
    tg.ready();
    console.log("Notified Telegram that the Mini App is ready");
}