// components/hooks/useDinoInteraction.ts
import { useState, useCallback } from 'react';
import { TelegramWebApp } from '@/types/telegram';

interface DinoState {
  eyesOpen: boolean;
  isBlinking: boolean;
}

export const useDinoInteraction = (tg: TelegramWebApp | null) => {
  const [dinoState, setDinoState] = useState<DinoState>({
    eyesOpen: true,
    isBlinking: false
  });

  const [isBlinking, setIsBlinking] = useState(false);

  const handleDinoTap = useCallback(() => {
    // Prevent multiple simultaneous blinks
    if (isBlinking) return;

    setIsBlinking(true);
    
    // Update dino state for blink animation
    setDinoState(prev => ({
      ...prev,
      isBlinking: true,
      eyesOpen: false
    }));

    // Provide haptic feedback
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }

    // Reset blink state after animation duration
    setTimeout(() => {
      setDinoState(prev => ({
        ...prev,
        isBlinking: false,
        eyesOpen: true
      }));
      setIsBlinking(false);
    }, 800); // 800ms matches the original blink duration

    console.log('Dino tapped! Blink animation triggered');
  }, [isBlinking, tg]);

  return {
    dinoState,
    isBlinking,
    handleDinoTap
  };
};