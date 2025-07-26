// components/hooks/useTelegramApp.ts
import { useEffect, useState } from 'react';
import { TelegramWebApp } from '@/types/telegram';

export const useTelegramApp = (): TelegramWebApp | null => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment and Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegramApp = window.Telegram.WebApp;
      
      try {
        // Initialize Telegram WebApp
        telegramApp.ready();
        telegramApp.expand();
        
        // Set the app instance
        setTg(telegramApp);
        setIsInitialized(true);
        
        console.log('Telegram WebApp initialized', {
          version: telegramApp.version,
          platform: telegramApp.platform,
          colorScheme: telegramApp.colorScheme
        });
        
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        // Still set tg even if initialization fails, so we can use fallbacks
        setTg(telegramApp);
        setIsInitialized(true);
      }
    } else {
      // Not in Telegram environment, still set initialized to true
      console.log('Not running in Telegram WebApp environment');
      setIsInitialized(true);
    }
  }, []);

  return tg;
};

// Helper hook for haptic feedback
export const useHapticFeedback = () => {
  const tg = useTelegramApp();

  const impactFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  };

  const notificationFeedback = (type: 'error' | 'success' | 'warning') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    }
  };

  const selectionFeedback = () => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  };

  return {
    impactFeedback,
    notificationFeedback,
    selectionFeedback,
    isAvailable: !!tg?.HapticFeedback
  };
};