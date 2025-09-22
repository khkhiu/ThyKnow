// components/DinoFriend/DinoContainer.tsx
import React, { useState, useEffect } from 'react';
import SpeechBubble from './SpeechBubble';
import { useDinoInteraction } from '../../hooks/useDinoInteraction';
import { useSpeechBubble } from '../../hooks/useSpeechBubble';
import { TelegramWebApp } from '@/types/telegram';

interface DinoContainerProps {
  petHealth: number;
  petHappiness: number;
  completedHabitsToday: number;
  equippedAccessories: string[];
  tg: TelegramWebApp | null;
}

const DinoContainer: React.FC<DinoContainerProps> = ({
  petHealth,
  petHappiness,
  completedHabitsToday,
  equippedAccessories,
  tg
}) => {
  const { 
    dinoState, 
    handleDinoTap, 
    isBlinking 
  } = useDinoInteraction(tg);
  
  const { 
    speechBubbleText, 
    showSpeechBubble, 
    triggerSpeechBubble 
  } = useSpeechBubble();

  // Get dino image source based on blinking state
  const getDinoImageSrc = () => {
    return isBlinking ? '/images/ThyKnow_dino-eyes-close.png' : '/images/ThyKnow_dino-eyes-open.png';
  };

  // Get container classes with fixed size
  const getContainerClasses = () => {
    const baseClasses = `
      relative cursor-pointer transitionfblink-all duration-200 ease-in-out
      hover:scale-105 active:scale-95 select-none
      w-72 h-72}
    `;
    return baseClasses;
  };

  // Get accessory emoji
  /*
  const getAccessoryEmoji = (accessoryId: string) => {
    const accessories: Record<string, string> = {
      'explorer-hat': '🎩',
      'safari-hat': '👒',
      'leaf-necklace': '🍃',
      'flower-crown': '🌸',
      'prehistoric-glasses': '🕶️',
      'bone-glasses': '👓'
    };
    return accessories[accessoryId] || '';
  };
  */

  // Handle dino interaction
  const handleDinoClick = () => {
    handleDinoTap();
    triggerSpeechBubble();
    
    // Provide haptic feedback
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };

  // Show initial speech bubble after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerSpeechBubble();
    }, 1500);

    return () => clearTimeout(timer);
  }, [triggerSpeechBubble]);

  return (
    <div className="relative flex flex-col items-center justify-center pb-20">
      {/* Speech Bubble */}
      <SpeechBubble 
        text={speechBubbleText}
        isVisible={showSpeechBubble}
      />

      {/* Dino Container */}
      <div className="relative flex items-center justify-center">
        {/* Main Dino */}
        <div
          className={getContainerClasses()}
          onClick={handleDinoClick}
        >
          {/* Dino Image */}
          <img
            src={getDinoImageSrc()}
            className="w-full h-full object-contain drop-shadow-lg"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Accessories */}
          {equippedAccessories.map((accessoryId, index) => (
            <div
              key={accessoryId}
              className="absolute top-0 right-0 text-2xl transform translate-x-2 -translate-y-2"
              style={{
                transform: `translate(${index * 10}px, ${index * 10}px)`,
                zIndex: 10
              }}
            >
              {/*getAccessoryEmoji(accessoryId)*/}
            </div>
          ))}
        </div>
      </div>



      {/* Happiness Animation Effects */}
      {/**
      {petHappiness >= 80 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-3xl animate-ping">🌿</div>
          <div className="absolute top-6 right-6 text-3xl animate-ping animation-delay-300">🦴</div>
          <div className="absolute bottom-8 left-8 text-3xl animate-ping animation-delay-600">⭐</div>
        </div>
      )}
      */}
    </div>
  );
};

export default DinoContainer;