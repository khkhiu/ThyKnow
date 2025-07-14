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

  // Get dino image based on level and state
  const getDinoImage = () => {
    if (petLevel >= 10) return '🦕'; // Brontosaurus
    if (petLevel >= 7) return '🦖'; // T-Rex
    if (petLevel >= 4) return '🐉'; // Dragon (dinosaur-like)
    return '🥚'; // Dinosaur egg
  };

  // Get dino size based on level
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
          className={`
            relative cursor-pointer transition-all duration-200 ease-in-out
            hover:scale-105 active:scale-95 select-none
            ${getDinoSize()}
            ${isBlinking ? 'animate-pulse' : ''}
            filter drop-shadow-lg
          `}
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
          {getDinoImage()}
          
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
                  className="h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${petHealth}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 min-w-[35px]">
                {petHealth}%
              </span>
            </div>
          </div>
          
          {/* Happiness Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500 text-lg">✨</span>
              <span className="text-sm font-medium text-gray-700">Happiness</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${petHappiness}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 min-w-[35px]">
                {petHappiness}%
              </span>
            </div>
          </div>
          
          {/* Habits Today */}
          <div className="flex items-center justify-center pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              <span className="font-medium">{completedHabitsToday}</span> habits completed today
            </span>
          </div>
        </div>
      </div>

      {/* Happiness Animation Effects */}
      {petHappiness >= 80 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-3xl animate-ping">🌿</div>
          <div className="absolute top-6 right-6 text-3xl animate-ping animation-delay-300">🦴</div>
          <div className="absolute bottom-8 left-8 text-3xl animate-ping animation-delay-600">⭐</div>
        </div>
      )}
    </div>
  );
};

export default DinoContainer;