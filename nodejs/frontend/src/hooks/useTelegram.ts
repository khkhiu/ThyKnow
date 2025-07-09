// src/hooks/useTelegram.ts
import { useState, useEffect } from 'react';
import { TelegramWebApp, TelegramUser } from '../types/miniapp';

interface UseTelegramReturn {
  tg: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
  colorScheme: 'light' | 'dark';
  viewportHeight: number;
}

export const useTelegram = (): UseTelegramReturn => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    // Initialize Telegram WebApp
    const initTelegram = () => {
      // Check if we're in Telegram WebApp environment
      // Type assertion to handle the conflicting declarations
      const telegramWebApp = (window as any).Telegram?.WebApp;
      
      if (telegramWebApp) {
        const webApp = telegramWebApp;
        
        // Set up the WebApp
        webApp.ready();
        webApp.expand();
        
        // Get user data
        const telegramUser = webApp.initDataUnsafe?.user;
        
        // Set states
        setTg(webApp);
        setUser(telegramUser || null);
        setColorScheme(webApp.colorScheme || 'light');
        setViewportHeight(webApp.viewportHeight || window.innerHeight);
        setIsReady(true);

        // Listen for theme changes
        webApp.onEvent('themeChanged', () => {
          setColorScheme(webApp.colorScheme || 'light');
        });

        // Listen for viewport changes
        webApp.onEvent('viewportChanged', () => {
          setViewportHeight(webApp.viewportHeight || window.innerHeight);
        });

        console.log('Telegram WebApp initialized:', {
          user: telegramUser,
          colorScheme: webApp.colorScheme,
          viewportHeight: webApp.viewportHeight
        });
      } else {
        // Fallback for development/testing outside Telegram
        console.warn('Telegram WebApp not available - using mock data');
        setUser({
          id: 999999,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser'
        });
        setIsReady(true);
      }
    };

    // Initialize immediately if Telegram is available, otherwise wait
    if ((window as any).Telegram?.WebApp) {
      initTelegram();
    } else {
      // Wait for Telegram script to load
      const checkTelegram = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          initTelegram();
          clearInterval(checkTelegram);
        }
      }, 100);

      // Cleanup after 5 seconds if still not available
      setTimeout(() => {
        clearInterval(checkTelegram);
        if (!isReady) {
          initTelegram(); // Initialize with fallback
        }
      }, 5000);

      return () => clearInterval(checkTelegram);
    }
  }, []);

  return {
    tg,
    user,
    isReady,
    colorScheme,
    viewportHeight
  };
};

// Helper hook for haptic feedback
export const useHapticFeedback = () => {
  const { tg } = useTelegram();

  const impactOccurred = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  };

  const notificationOccurred = (type: 'error' | 'success' | 'warning' = 'success') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    }
  };

  const selectionChanged = () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  };

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged
  };
};

// Helper hook for main button
export const useMainButton = () => {
  const { tg } = useTelegram();

  const showMainButton = (text: string, onClick: () => void) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  };

  const setMainButtonLoading = (loading: boolean) => {
    if (tg?.MainButton) {
      if (loading) {
        tg.MainButton.showProgress();
      } else {
        tg.MainButton.hideProgress();
      }
    }
  };

  return {
    showMainButton,
    hideMainButton,
    setMainButtonLoading
  };
};