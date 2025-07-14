// nodejs/public/miniapp/src/components/pet/telegramApp.ts
import { TelegramWebApp } from '../../types/miniapp';

/**
 * Initialize the Telegram Web App integration
 * @returns The Telegram WebApp instance
 */
export function initTelegramApp(): TelegramWebApp {
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
 * @param tg - Telegram WebApp instance
 * @param type - Type of haptic feedback ('light', 'medium', 'heavy', etc.)
 */
export function provideHapticFeedback(tg: TelegramWebApp, type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(type);
        console.debug(`Haptic feedback provided: ${type}`);
    }
}

/**
 * Notify Telegram that the Mini App is ready
 * @param tg - Telegram WebApp instance
 */
export function notifyAppReady(tg: TelegramWebApp): void {
    tg.ready();
    console.log("Notified Telegram that the Mini App is ready");
}