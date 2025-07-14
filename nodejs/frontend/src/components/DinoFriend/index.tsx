// components/DinoFriend/index.tsx
import React, { useEffect, useState } from 'react';
import DinoContainer from './DinoContainer';
import LoadingSpinner from './LoadingSpinner';
import { useTelegramApp } from '../../hooks/useTelegramApp';

interface DinoFriendProps {
  petHealth: number;
  petHappiness: number;
  completedHabitsToday: number;
  equippedAccessories: string[];
}

const DinoFriend: React.FC<DinoFriendProps> = ({
  petHealth,
  petHappiness,
  completedHabitsToday,
  equippedAccessories
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const tg = useTelegramApp();

  useEffect(() => {
    // Initialize the component
    const initializeApp = async () => {
      try {
        // Simulate loading time and setup
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing DinoFriend:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-amber-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl">🌿</div>
        <div className="absolute top-20 right-16 text-4xl">🦴</div>
        <div className="absolute bottom-32 left-8 text-5xl">🌱</div>
        <div className="absolute bottom-20 right-12 text-3xl">⭐</div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Section - Made shorter */}
        <div className="text-center px-6 pt-4 pb-2 animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Meet Your Dino Friend
          </h1>
          <p className="text-sm text-gray-600 mb-1">
            Tap on your dino friend to make it blink!
          </p>
          <p className="text-xs text-green-600 flex items-center justify-center gap-1 animate-pulse">
            <span className="text-sm">👆</span>
            Tap to see different messages too!
          </p>
        </div>

        {/* Spacer to push dino toward bottom */}
        <div className="flex-grow" />

        {/* Dino Container */}
        <div className="px-6 pb-6">
          <DinoContainer
            petHealth={petHealth}
            petHappiness={petHappiness}
            completedHabitsToday={completedHabitsToday}
            equippedAccessories={equippedAccessories}
            tg={tg}
          />
        </div>

        {/* Navigation removed - tabs now serve this purpose */}
      </div>
    </div>
  );
};

export default DinoFriend;