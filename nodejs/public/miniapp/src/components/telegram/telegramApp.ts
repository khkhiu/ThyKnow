// File: public/miniapp/src/components/telegram/telegramApp.ts
// Telegram Web App integration utilities

import type { TelegramWebApp } from '../../types/miniapp';

/**
 * Initialize the Telegram Web App integration
 * @returns The Telegram WebApp instance
 */
export function initTelegramApp(): TelegramWebApp {
    // Check if Telegram WebApp is available
    if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
        console.warn('Telegram WebApp not available, using fallback');
        return createFallbackTelegramApp();
    }

    const tg = window.Telegram.WebApp;
    
    // Initialize WebApp
    tg.ready();
    tg.expand();
    
    // Set theme colors to match modern UI
    try {
        tg.setHeaderColor('#3B82F6');
        tg.setBackgroundColor('#F8FAFC');
    } catch (error) {
        console.warn('Could not set Telegram theme colors:', error);
    }
    
    // Enable closing confirmation for safety
    tg.enableClosingConfirmation();
    
    console.log('✅ Telegram WebApp initialized');
    console.debug('Telegram Init Data:', tg.initData);
    console.debug('User:', tg.initDataUnsafe?.user);
    
    return tg;
}

/**
 * Provide haptic feedback if supported by the device
 * @param tg - Telegram WebApp instance
 * @param type - Type of haptic feedback
 */
export function provideHapticFeedback(
    tg: TelegramWebApp, 
    type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'
): void {
    try {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(type);
            console.debug(`Haptic feedback provided: ${type}`);
        }
    } catch (error) {
        console.debug('Haptic feedback not available:', error);
    }
}

/**
 * Provide notification haptic feedback
 * @param tg - Telegram WebApp instance
 * @param type - Type of notification
 */
export function provideNotificationFeedback(
    tg: TelegramWebApp,
    type: 'error' | 'success' | 'warning'
): void {
    try {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred(type);
            console.debug(`Notification feedback provided: ${type}`);
        }
    } catch (error) {
        console.debug('Notification feedback not available:', error);
    }
}

/**
 * Provide selection changed haptic feedback
 * @param tg - Telegram WebApp instance
 */
export function provideSelectionFeedback(tg: TelegramWebApp): void {
    try {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.selectionChanged();
            console.debug('Selection feedback provided');
        }
    } catch (error) {
        console.debug('Selection feedback not available:', error);
    }
}

/**
 * Notify Telegram that the Mini App is ready
 * @param tg - Telegram WebApp instance
 */
export function notifyAppReady(tg: TelegramWebApp): void {
    try {
        tg.ready();
        console.log('✅ Notified Telegram that the Mini App is ready');
    } catch (error) {
        console.error('Error notifying Telegram app ready:', error);
    }
}

/**
 * Setup main button with custom configuration
 * @param tg - Telegram WebApp instance
 * @param config - Button configuration
 */
export function setupMainButton(
    tg: TelegramWebApp,
    config: {
        text: string;
        onClick: () => void;
        color?: string;
        textColor?: string;
        show?: boolean;
        enable?: boolean;
    }
): void {
    try {
        const { text, onClick, color, textColor, show = true, enable = true } = config;
        
        tg.MainButton.setText(text);
        
        if (color) tg.MainButton.color = color;
        if (textColor) tg.MainButton.textColor = textColor;
        
        // Clear existing listeners and add new one
        tg.MainButton.offClick(onClick);
        tg.MainButton.onClick(onClick);
        
        if (show) tg.MainButton.show();
        else tg.MainButton.hide();
        
        if (enable) tg.MainButton.enable();
        else tg.MainButton.disable();
        
        console.debug('Main button configured:', { text, show, enable });
    } catch (error) {
        console.error('Error setting up main button:', error);
    }
}

/**
 * Setup back button
 * @param tg - Telegram WebApp instance
 * @param onClick - Click handler
 */
export function setupBackButton(tg: TelegramWebApp, onClick: () => void): void {
    try {
        // Clear existing listeners and add new one
        tg.BackButton.offClick(onClick);
        tg.BackButton.onClick(onClick);
        tg.BackButton.show();
        
        console.debug('Back button configured');
    } catch (error) {
        console.error('Error setting up back button:', error);
    }
}

/**
 * Hide back button
 * @param tg - Telegram WebApp instance
 */
export function hideBackButton(tg: TelegramWebApp): void {
    try {
        tg.BackButton.hide();
    } catch (error) {
        console.error('Error hiding back button:', error);
    }
}

/**
 * Get user information from Telegram
 * @param tg - Telegram WebApp instance
 * @returns User information or fallback
 */
export function getTelegramUser(tg: TelegramWebApp) {
    const user = tg.initDataUnsafe?.user;
    
    if (!user) {
        console.warn('No Telegram user data available, using fallback');
        return {
            id: 999999,
            first_name: 'Demo User',
            username: 'demo_user',
            language_code: 'en'
        };
    }
    
    return user;
}

/**
 * Get platform information
 * @param tg - Telegram WebApp instance
 * @returns Platform details
 */
export function getPlatformInfo(tg: TelegramWebApp) {
    return {
        platform: tg.platform || 'unknown',
        version: tg.version || 'unknown',
        colorScheme: tg.colorScheme || 'light',
        isExpanded: tg.isExpanded || false,
        viewportHeight: tg.viewportHeight || window.innerHeight,
        viewportStableHeight: tg.viewportStableHeight || window.innerHeight
    };
}

/**
 * Show Telegram popup
 * @param tg - Telegram WebApp instance
 * @param config - Popup configuration
 */
export function showTelegramPopup(
    tg: TelegramWebApp,
    config: {
        title: string;
        message: string;
        buttons?: Array<{ id: string; type: 'default' | 'destructive'; text: string }>;
    }
): Promise<string> {
    return new Promise((resolve) => {
        try {
            const { title, message, buttons = [{ id: 'ok', type: 'default', text: 'OK' }] } = config;
            
            tg.showPopup({
                title,
                message,
                buttons
            }, (buttonId) => {
                resolve(buttonId || 'dismissed');
            });
        } catch (error) {
            console.error('Error showing Telegram popup:', error);
            // Fallback to browser alert
            alert(`${config.title}\n\n${config.message}`);
            resolve('ok');
        }
    });
}

/**
 * Show Telegram alert
 * @param tg - Telegram WebApp instance
 * @param message - Alert message
 */
export function showTelegramAlert(tg: TelegramWebApp, message: string): Promise<void> {
    return new Promise((resolve) => {
        try {
            tg.showAlert(message, () => {
                resolve();
            });
        } catch (error) {
            console.error('Error showing Telegram alert:', error);
            alert(message);
            resolve();
        }
    });
}

/**
 * Show Telegram confirmation
 * @param tg - Telegram WebApp instance
 * @param message - Confirmation message
 */
export function showTelegramConfirm(tg: TelegramWebApp, message: string): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            tg.showConfirm(message, (confirmed) => {
                resolve(confirmed);
            });
        } catch (error) {
            console.error('Error showing Telegram confirm:', error);
            const result = confirm(message);
            resolve(result);
        }
    });
}

/**
 * Send data to the bot
 * @param tg - Telegram WebApp instance
 * @param data - Data to send
 */
export function sendDataToBot(tg: TelegramWebApp, data: any): void {
    try {
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        tg.sendData(dataString);
        console.debug('Data sent to bot:', data);
    } catch (error) {
        console.error('Error sending data to bot:', error);
    }
}

/**
 * Generate authentication headers for API requests
 * @param tg - Telegram WebApp instance
 * @returns Headers object
 */
export function getTelegramAuthHeaders(tg: TelegramWebApp): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    
    if (tg.initData) {
        headers['X-Telegram-Init-Data'] = tg.initData;
    }
    
    return headers;
}

/**
 * Create fallback Telegram app for development/testing
 */
function createFallbackTelegramApp(): TelegramWebApp {
    console.warn('Using fallback Telegram WebApp for development');
    
    const fallback: TelegramWebApp = {
        initData: '',
        initDataUnsafe: {
            user: {
                id: 999999,
                first_name: 'Demo User',
                username: 'demo_user',
                language_code: 'en'
            }
        },
        version: '6.0',
        platform: 'web',
        colorScheme: 'light',
        themeParams: {},
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        ready: () => console.log('Fallback: ready'),
        expand: () => console.log('Fallback: expand'),
        close: () => console.log('Fallback: close'),
        setHeaderColor: (color: string) => console.log('Fallback: setHeaderColor', color),
        setBackgroundColor: (color: string) => console.log('Fallback: setBackgroundColor', color),
        enableClosingConfirmation: () => console.log('Fallback: enableClosingConfirmation'),
        disableClosingConfirmation: () => console.log('Fallback: disableClosingConfirmation'),
        onEvent: (eventType: string, callback: () => void) => console.log('Fallback: onEvent', eventType),
        offEvent: (eventType: string, callback: () => void) => console.log('Fallback: offEvent', eventType),
        sendData: (data: string) => console.log('Fallback: sendData', data),
        switchInlineQuery: (query: string) => console.log('Fallback: switchInlineQuery', query),
        openLink: (url: string) => window.open(url, '_blank'),
        openTelegramLink: (url: string) => console.log('Fallback: openTelegramLink', url),
        openInvoice: (url: string) => console.log('Fallback: openInvoice', url),
        showPopup: (params: any, callback?: (buttonId: string) => void) => {
            alert(params.message);
            callback?.('ok');
        },
        showAlert: (message: string, callback?: () => void) => {
            alert(message);
            callback?.();
        },
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => {
            const result = confirm(message);
            callback(result);
        },
        showScanQrPopup: () => console.log('Fallback: showScanQrPopup'),
        closeScanQrPopup: () => console.log('Fallback: closeScanQrPopup'),
        readTextFromClipboard: () => console.log('Fallback: readTextFromClipboard'),
        requestWriteAccess: () => console.log('Fallback: requestWriteAccess'),
        requestContact: () => console.log('Fallback: requestContact'),
        MainButton: {
            text: '',
            color: '#3390ec',
            textColor: '#ffffff',
            isVisible: false,
            isActive: true,
            isProgressVisible: false,
            setText: (text: string) => console.log('Fallback MainButton: setText', text),
            onClick: (callback: () => void) => console.log('Fallback MainButton: onClick'),
            offClick: (callback: () => void) => console.log('Fallback MainButton: offClick'),
            show: () => console.log('Fallback MainButton: show'),
            hide: () => console.log('Fallback MainButton: hide'),
            enable: () => console.log('Fallback MainButton: enable'),
            disable: () => console.log('Fallback MainButton: disable'),
            showProgress: () => console.log('Fallback MainButton: showProgress'),
            hideProgress: () => console.log('Fallback MainButton: hideProgress'),
            setParams: () => console.log('Fallback MainButton: setParams')
        },
        BackButton: {
            isVisible: false,
            onClick: (callback: () => void) => console.log('Fallback BackButton: onClick'),
            offClick: (callback: () => void) => console.log('Fallback BackButton: offClick'),
            show: () => console.log('Fallback BackButton: show'),
            hide: () => console.log('Fallback BackButton: hide')
        },
        SettingsButton: {
            isVisible: false,
            onClick: (callback: () => void) => console.log('Fallback SettingsButton: onClick'),
            offClick: (callback: () => void) => console.log('Fallback SettingsButton: offClick'),
            show: () => console.log('Fallback SettingsButton: show'),
            hide: () => console.log('Fallback SettingsButton: hide')
        },
        HapticFeedback: {
            impactOccurred: (style: string) => console.log('Fallback HapticFeedback: impactOccurred', style),
            notificationOccurred: (type: string) => console.log('Fallback HapticFeedback: notificationOccurred', type),
            selectionChanged: () => console.log('Fallback HapticFeedback: selectionChanged')
        },
        CloudStorage: {
            setItem: (key: string, value: string, callback?: any) => {
                localStorage.setItem(key, value);
                callback?.(null, true);
            },
            getItem: (key: string, callback: any) => {
                const value = localStorage.getItem(key) || '';
                callback(null, value);
            },
            getItems: (keys: string[], callback: any) => {
                const result: Record<string, string> = {};
                keys.forEach(key => {
                    result[key] = localStorage.getItem(key) || '';
                });
                callback(null, result);
            },
            removeItem: (key: string, callback?: any) => {
                localStorage.removeItem(key);
                callback?.(null, true);
            },
            removeItems: (keys: string[], callback?: any) => {
                keys.forEach(key => localStorage.removeItem(key));
                callback?.(null, true);
            },
            getKeys: (callback: any) => {
                const keys = Object.keys(localStorage);
                callback(null, keys);
            }
        },
        BiometricManager: {
            isInited: false,
            isBiometricAvailable: false,
            biometricType: 'unknown' as const,
            isAccessRequested: false,
            isAccessGranted: false,
            isBiometricTokenSaved: false,
            deviceId: 'fallback-device',
            init: () => console.log('Fallback BiometricManager: init'),
            requestAccess: () => console.log('Fallback BiometricManager: requestAccess'),
            authenticate: () => console.log('Fallback BiometricManager: authenticate'),
            updateBiometricToken: () => console.log('Fallback BiometricManager: updateBiometricToken'),
            openSettings: () => console.log('Fallback BiometricManager: openSettings')
        }
    };
    
    return fallback;
}