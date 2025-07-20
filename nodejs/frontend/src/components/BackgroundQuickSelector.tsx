// src/components/BackgroundQuickSelector.tsx
import React from 'react';
import { useBackground } from '../context/BackgroundContext';
import { DEFAULT_BACKGROUNDS } from './BackgroundWrapper';

// Define background themes for quick selection
const BACKGROUND_THEMES = {
  CALM: ['thyknow-default', 'gradient-ocean', 'solid-light'],
  ENERGETIC: ['gradient-sunset', 'gradient-nature', 'solid-dark'],
  MINIMAL: ['solid-light', 'solid-dark', 'gradient-ocean']
} as const;

interface BackgroundQuickSelectorProps {
  theme?: keyof typeof BACKGROUND_THEMES;
  className?: string;
}

export const BackgroundQuickSelector: React.FC<BackgroundQuickSelectorProps> = ({ 
  theme = 'CALM', 
  className = "" 
}) => {
  const { currentBackgroundId, setBackgroundId } = useBackground();
  const themeBackgrounds = BACKGROUND_THEMES[theme];

  // Helper function to get background by ID
  const getBackgroundById = (id: string) => {
    return DEFAULT_BACKGROUNDS.find(bg => bg.id === id);
  };

  // Helper function to get a preview style for quick selector
  const getBackgroundPreview = (backgroundId: string): string => {
    const background = getBackgroundById(backgroundId);
    if (!background) return '#gray';
    
    switch (background.type) {
      case 'gradient':
        return background.value;
      case 'color':
        return background.value;
      case 'image':
        return `url('${background.value}')`;
      default:
        return '#gray';
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {themeBackgrounds.map((backgroundId) => {
        const isActive = currentBackgroundId === backgroundId;
        const background = getBackgroundById(backgroundId);
        
        return (
          <button
            key={backgroundId}
            onClick={() => setBackgroundId(backgroundId)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              isActive 
                ? 'border-blue-500 scale-110' 
                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
            } cursor-pointer`}
            style={{
              background: getBackgroundPreview(backgroundId),
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            title={background?.name || backgroundId}
          />
        );
      })}
    </div>
  );
};

export default BackgroundQuickSelector;