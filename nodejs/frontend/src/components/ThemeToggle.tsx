// src/components/ThemeToggle.tsx
import React from 'react';
import { useTelegram } from '../hooks/useTelegram';

export const ThemeToggle: React.FC = () => {
  const { colorScheme } = useTelegram();

  const toggleTheme = () => {
    // Theme is controlled by Telegram WebApp
    // This is just a visual indicator
    console.log('Current theme:', colorScheme);
  };

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {colorScheme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};