// src/contexts/BackgroundContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackgroundOption, DEFAULT_BACKGROUNDS } from '../components/BackgroundWrapper';

interface BackgroundContextType {
  currentBackgroundId: string;
  setBackgroundId: (id: string) => void;
  availableBackgrounds: BackgroundOption[];
  getCurrentBackground: () => BackgroundOption;
  isLoading: boolean;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

interface BackgroundProviderProps {
  children: React.ReactNode;
  userId?: string; // For saving user preferences
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [currentBackgroundId, setCurrentBackgroundId] = useState<string>('thyknow-default');
  const [isLoading, setIsLoading] = useState(true);

  // Load user's background preference from localStorage only
  useEffect(() => {
    const loadUserBackground = () => {
      try {
        const storageKey = userId ? `background-${userId}` : 'background-guest';
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
          // Verify the saved background still exists
          const backgroundExists = DEFAULT_BACKGROUNDS.find(bg => bg.id === saved);
          if (backgroundExists) {
            setCurrentBackgroundId(saved);
          } else {
            // If saved background doesn't exist anymore, reset to default
            console.log('Saved background no longer exists, resetting to default');
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.error('Failed to load background preference:', error);
        // Use default background
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to show loading state
    const timer = setTimeout(() => {
      loadUserBackground();
    }, 100);

    return () => clearTimeout(timer);
  }, [userId]);

  // Save background preference to localStorage only
  const setBackgroundId = (id: string) => {
    // Verify the background exists before setting it
    const backgroundExists = DEFAULT_BACKGROUNDS.find(bg => bg.id === id);
    if (!backgroundExists) {
      console.error(`Background with id "${id}" not found`);
      return;
    }

    setCurrentBackgroundId(id);
    
    try {
      const storageKey = userId ? `background-${userId}` : 'background-guest';
      localStorage.setItem(storageKey, id);
      console.log(`Background saved: ${id}`);
    } catch (error) {
      console.error('Failed to save background preference:', error);
    }
  };

  const getCurrentBackground = () => {
    return DEFAULT_BACKGROUNDS.find(bg => bg.id === currentBackgroundId) || DEFAULT_BACKGROUNDS[0];
  };

  const value: BackgroundContextType = {
    currentBackgroundId,
    setBackgroundId,
    availableBackgrounds: DEFAULT_BACKGROUNDS,
    getCurrentBackground,
    isLoading
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};

// Custom hook to use background context
export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export default BackgroundContext;