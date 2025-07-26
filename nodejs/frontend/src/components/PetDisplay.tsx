
import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Trophy } from 'lucide-react';

interface PetDisplayProps {
  petHealth: number;
  petHappiness: number;
  petLevel: number;
  completedHabitsToday: number;
  equippedAccessories: string[];
}

const PetDisplay = ({ 
  petHealth, 
  petHappiness, 
  petLevel, 
  completedHabitsToday,
  equippedAccessories 
}: PetDisplayProps) => {
  const [petAnimation, setPetAnimation] = useState('idle');

  useEffect(() => {
    if (completedHabitsToday > 0) {
      setPetAnimation('happy');
      const timer = setTimeout(() => setPetAnimation('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [completedHabitsToday]);

  const getPetImage = () => {
    if (petLevel >= 10) return '🦕'; // Brontosaurus
    if (petLevel >= 7) return '🦖'; // T-Rex
    if (petLevel >= 4) return '🐉'; // Dragon (dinosaur-like)
    return '🥚'; // Dinosaur egg
  };

  const getPetMood = () => {
    if (petHappiness >= 80) return 'Roaring with joy!';
    if (petHappiness >= 60) return 'Happy dino';
    if (petHappiness >= 40) return 'Content';
    if (petHappiness >= 20) return 'Okay';
    return 'Grumpy dino';
  };

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

  return (
    <div className="bg-gradient-to-br from-green-100 to-amber-100 rounded-3xl p-6 text-center relative overflow-hidden">
      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/80 rounded-full px-2 py-1">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-bold text-gray-700">{petLevel}</span>
      </div>
      
      <div className={`text-8xl mb-4 transition-transform duration-500 relative ${
        petAnimation === 'happy' ? 'animate-bounce' : ''
      }`}>
        {getPetImage()}
        {/* Display equipped accessories */}
        <div className="absolute inset-0 flex items-center justify-center">
          {equippedAccessories.map((accessoryId, index) => (
            <span 
              key={accessoryId}
              className="absolute text-4xl"
              style={{
                top: accessoryId.includes('hat') ? '-10px' : 
                     accessoryId.includes('glasses') ? '10px' : '20px',
                left: accessoryId.includes('necklace') || accessoryId.includes('crown') ? '0px' : 
                      accessoryId.includes('glasses') ? '5px' : '10px',
                transform: accessoryId.includes('necklace') ? 'rotate(-15deg)' : 'none'
              }}
            >
              {getAccessoryEmoji(accessoryId)}
            </span>
          ))}
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your Dino Pal</h2>
      <p className="text-lg text-gray-600 mb-4">{getPetMood()}</p>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Health</span>
          </div>
          <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${petHealth}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-gray-700">{petHealth}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Happiness</span>
          </div>
          <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${petHappiness}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-gray-700">{petHappiness}%</span>
        </div>
      </div>
      
      {petAnimation === 'happy' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-2xl animate-ping">🌿</div>
          <div className="absolute top-6 right-6 text-2xl animate-ping animation-delay-300">🦴</div>
          <div className="absolute bottom-8 left-8 text-2xl animate-ping animation-delay-600">⭐</div>
        </div>
      )}
    </div>
  );
};

export default PetDisplay;
