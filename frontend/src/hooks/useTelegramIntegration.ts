// ==================================================
// src/hooks/useTelegramIntegration.ts
// Custom hook for Telegram WebApp integration
// ==================================================

import { useState, useEffect } from 'react';
import { TelegramWebApp, TelegramUser } from '../types/telegram';

interface UseTelegramIntegrationResult {
  telegramWebApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
}

export const useTelegramIntegration = (): UseTelegramIntegrationResult => {
  const [telegramWebApp, setTelegramWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Expand to full height
      tg.expand();
      
      // Set theme
      updateTheme(tg);
      
      // Get user data
      const telegramUser = tg.initDataUnsafe?.user;
      
      setTelegramWebApp(tg);
      setUser(telegramUser || null);
      setIsReady(true);
      
      // Notify Telegram that the app is ready
      tg.ready();
    } else {
      // For development/testing without Telegram
      setIsReady(true);
    }
  }, []);

  const updateTheme = (tg: TelegramWebApp) => {
    const root = document.documentElement;
    const isDark = tg.colorScheme === 'dark';
    
    root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || (isDark ? '#212121' : '#ffffff'));
    root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || (isDark ? '#ffffff' : '#000000'));
    root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || (isDark ? '#707579' : '#999999'));
    root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
  };

  return {
    telegramWebApp,
    user,
    isReady
  };
};
