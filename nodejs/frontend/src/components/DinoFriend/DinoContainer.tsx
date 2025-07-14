// components/DinoFriend/DinoContainer.tsx
import React, { useState, useEffect } from 'react';
import SpeechBubble from './SpeechBubble';
import { useDinoInteraction } from '../../hooks/useDinoInteraction';
import { useSpeechBubble } from '../../hooks/useSpeechBubble';
import { TelegramWebApp } from '@/types/telegram';

interface DinoContainerProps {
  petHealth: number;
  petHappiness: number;
  petLevel: number;
  completedHabitsToday: number;
  equippedAccessories: string[];
  tg: TelegramWebApp | null;
}

const DinoContainer: React.FC<DinoContainerProps> = ({
  petHealth,
  petHappiness,
  petLevel,
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

  // Get dino image path based on blinking state - using fallback for now
  const getDinoImagePath = () => {
    // For now, fallback to emoji until we fix the image loading
    return null; // This will make the component use emoji fallback
  };

  // Get dino emoji as fallback
  const getDinoEmoji = () => {
    if (petLevel >= 10) return '🦕'; // Brontosaurus
    if (petLevel >= 7) return '🦖'; // T-Rex
    if (petLevel >= 4) return '🐉'; // Dragon (dinosaur-like)
    return '🥚'; // Dinosaur egg
  };

  // Get dino size based on level - using text size for emoji
  const getDinoSize = () => {
    if (petLevel >= 10) return 'text-[200px]';
    if (petLevel >= 7) return 'text-[180px]';
    if (petLevel >= 4) return 'text-[160px]';
    return 'text-[140px]';
  };

  // Get accessory emoji
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
          className="relative cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 select-none"
          onClick={handleDinoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDinoClick();
            }
          }}
          aria-label="Interactive dinosaur. Tap to make it blink and show messages"
        >
          {/* Use emoji as fallback for now */}
          <div className={`
            ${getDinoSize()}
            text-center flex items-center justify-center
            transition-all duration-200 ease-in-out
            filter drop-shadow-lg
            ${isBlinking ? 'animate-pulse' : ''}
          `}>
            {getDinoEmoji()}
          </div>
          
          {/* Equipped Accessories */}
          <div className="absolute inset-0 flex items-center justify-center">
            {equippedAccessories.map((accessoryId, index) => (
              <span 
                key={accessoryId}
                className="absolute text-6xl pointer-events-none"
                style={{
                  top: accessoryId.includes('hat') ? '-30px' : 
                       accessoryId.includes('glasses') ? '20px' : '40px',
                  left: accessoryId.includes('necklace') || accessoryId.includes('crown') ? '0px' : 
                        accessoryId.includes('glasses') ? '10px' : '20px',
                  transform: accessoryId.includes('necklace') ? 'rotate(-15deg)' : 'none',
                  zIndex: accessoryId.includes('necklace') ? -1 : 1
                }}
              >
                {getAccessoryEmoji(accessoryId)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pet Stats Display */}
      <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 w-full max-w-sm shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 text-center mb-3">
          Your Dino Pal (Level {petLevel})
        </h3>
        
        <div className="space-y-3">
          {/* Health Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-lg">❤️</span>
              <span className="text-sm font-medium text-gray-700">Health</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${petHealth}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{petHealth}%</span>
            </div>
          </div>

          {/* Happiness Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500 text-lg">😊</span>
              <span className="text-sm font-medium text-gray-700">Happiness</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
                  style={{ width: `${petHappiness}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{petHappiness}%</span>
            </div>
          </div>

          {/* Today's Habits */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-lg">✅</span>
              <span className="text-sm font-medium text-gray-700">Today's Habits</span>
            </div>
            <span className="text-sm font-bold text-green-600">{completedHabitsToday}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DinoContainer;