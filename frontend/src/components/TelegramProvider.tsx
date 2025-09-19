// components/TelegramProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTelegramIntegration } from '../hooks/useTelegramIntegration';
import { TelegramWebApp, TelegramUser } from '../types/telegram';

interface TelegramContextType {
  user: TelegramUser | null;
  webApp: TelegramWebApp | null;
  isReady: boolean;
  theme: 'light' | 'dark';
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => void;
  sendData: (data: any) => void;
  close: () => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};

interface TelegramProviderProps {
  children: React.ReactNode;
  fallbackUser?: TelegramUser;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ 
  children, 
  fallbackUser 
}) => {
  const { telegramWebApp, user, isReady } = useTelegramIntegration();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Update theme when webApp changes
  useEffect(() => {
    if (telegramWebApp) {
      setTheme(telegramWebApp.colorScheme);
    }
  }, [telegramWebApp]);

  const showAlert = (message: string, callback?: () => void) => {
    if (telegramWebApp) {
      telegramWebApp.showAlert(message, callback);
    } else {
      alert(message);
      callback?.();
    }
  };

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (telegramWebApp) {
      telegramWebApp.showConfirm(message, callback);
    } else {
      const confirmed = confirm(message);
      callback(confirmed);
    }
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    if (telegramWebApp?.HapticFeedback) {
      if (type === 'success' || type === 'error' || type === 'warning') {
        telegramWebApp.HapticFeedback.notificationOccurred(type);
      } else {
        telegramWebApp.HapticFeedback.impactOccurred(type);
      }
    }
  };

  const sendData = (data: any) => {
    if (telegramWebApp) {
      telegramWebApp.sendData(JSON.stringify(data));
    }
  };

  const close = () => {
    if (telegramWebApp) {
      telegramWebApp.close();
    }
  };

  const contextValue: TelegramContextType = {
    user: user || fallbackUser || null,
    webApp: telegramWebApp,
    isReady,
    theme,
    showAlert,
    showConfirm,
    hapticFeedback,
    sendData,
    close
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

// HOC for components that need Telegram integration
export const withTelegram = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const telegram = useTelegram();
    return <Component {...props} telegram={telegram} />;
  };
};

export default TelegramProvider;