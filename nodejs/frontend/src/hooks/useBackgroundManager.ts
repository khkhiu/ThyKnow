// src/hooks/useBackgroundManager.ts
import { useState, useCallback } from 'react';
import { useBackground } from '../context/BackgroundContext';
import { ALL_BACKGROUNDS, getBackgroundsByCategory, getBackgroundById } from '../config/backgrounds';

export const useBackgroundManager = () => {
  const { currentBackgroundId, setBackgroundId, availableBackgrounds } = useBackground();
  const [isChanging, setIsChanging] = useState(false);

  // Change background with loading state
  const changeBackground = useCallback(async (backgroundId: string) => {
    setIsChanging(true);
    try {
      await setBackgroundId(backgroundId);
      // Add a small delay for visual feedback
      setTimeout(() => setIsChanging(false), 300);
    } catch (error) {
      console.error('Failed to change background:', error);
      setIsChanging(false);
    }
  }, [setBackgroundId]);

  // Get current background details
  const getCurrentBackground = useCallback(() => {
    return getBackgroundById(currentBackgroundId);
  }, [currentBackgroundId]);

  // Get backgrounds by category
  const getBackgroundsByCategory = useCallback((category: string) => {
    return ALL_BACKGROUNDS.filter(bg => bg.category === category);
  }, []);

  // Check if user has premium backgrounds unlocked
  const canUsePremium = useCallback((userLevel: number = 1) => {
    return userLevel >= 5; // Example: unlock premium at level 5
  }, []);

  return {
    currentBackgroundId,
    changeBackground,
    getCurrentBackground,
    getBackgroundsByCategory,
    availableBackgrounds: ALL_BACKGROUNDS,
    isChanging,
    canUsePremium
  };
};
