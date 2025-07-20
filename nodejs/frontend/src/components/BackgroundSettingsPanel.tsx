// src/components/BackgroundSettingsPanel.tsx
import React, { useState } from 'react';
import { useBackground } from '../context/BackgroundContext';
import { DEFAULT_BACKGROUNDS } from './BackgroundWrapper';

// Define categories locally
const BACKGROUND_CATEGORIES = {
  DEFAULT: 'default',
  GRADIENTS: 'gradients',
  SOLID: 'solid'
} as const;

type CategoryType = typeof BACKGROUND_CATEGORIES[keyof typeof BACKGROUND_CATEGORIES];

interface BackgroundSettingsPanelProps {
  userLevel?: number;
  className?: string;
}

export const BackgroundSettingsPanel: React.FC<BackgroundSettingsPanelProps> = ({ 
  userLevel = 1,
  className = "" 
}) => {
  const { currentBackgroundId, setBackgroundId } = useBackground();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('default');
  
  // Helper function to get backgrounds by category
  const getBackgroundsByCategory = (category: CategoryType) => {
    switch (category) {
      case 'gradients':
        return DEFAULT_BACKGROUNDS.filter(bg => bg.type === 'gradient');
      case 'solid':
        return DEFAULT_BACKGROUNDS.filter(bg => bg.type === 'color');
      case 'default':
      default:
        return DEFAULT_BACKGROUNDS.filter(bg => bg.type === 'image' || !bg.type);
    }
  };

  // Check if user can use premium backgrounds
  const canUsePremium = (level: number) => {
    return level >= 5; // Example: unlock premium at level 5
  };

  const isPremiumUnlocked = canUsePremium(userLevel);
  const categories = Object.values(BACKGROUND_CATEGORIES);
  const categoryBackgrounds = getBackgroundsByCategory(activeCategory);

  // Helper function to get preview style
  const getPreviewStyle = (background: any) => {
    switch (background.type) {
      case 'image':
        return {
          backgroundImage: `url('${background.value}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'gradient':
        return { background: background.value };
      case 'color':
        return { backgroundColor: background.value };
      default:
        return { backgroundColor: '#gray' };
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backgrounds</h3>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Background Grid */}
      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {categoryBackgrounds.map((background) => {
          const isActive = currentBackgroundId === background.id;
          const isLocked = background.premium && !isPremiumUnlocked;
          
          return (
            <div
              key={background.id}
              className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-blue-500' : 'hover:scale-105'
              } ${isLocked ? 'opacity-50' : ''}`}
              onClick={() => !isLocked && setBackgroundId(background.id)}
            >
              {/* Background Preview */}
              <div 
                className="w-full h-full"
                style={getPreviewStyle(background)}
              />
              
              {/* Premium Badge */}
              {background.premium && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Selection indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-xs text-center">Unlock at Level 5</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Premium Upsell */}
      {!isPremiumUnlocked && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Reach Level 5 to unlock premium backgrounds!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSettingsPanel;