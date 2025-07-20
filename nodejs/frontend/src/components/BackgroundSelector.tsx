// src/components/BackgroundSelector.tsx
import React from 'react';
import { useBackground } from '../context/BackgroundContext';

interface BackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
  isOpen, 
  onClose, 
  className = "" 
}) => {
  const { currentBackgroundId, setBackgroundId, availableBackgrounds } = useBackground();

  if (!isOpen) return null;

  const handleBackgroundSelect = (backgroundId: string) => {
    setBackgroundId(backgroundId);
    onClose();
  };

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
        return {};
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 max-w-md mx-auto max-h-[80vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Background
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Personalize your ThyKnow experience
          </p>
        </div>

        {/* Background Options */}
        <div className="p-4 overflow-y-auto max-h-96">
          <div className="grid grid-cols-2 gap-3">
            {availableBackgrounds.map((background) => (
              <div
                key={background.id}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                  currentBackgroundId === background.id 
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' 
                    : 'hover:scale-105 hover:shadow-md'
                }`}
                onClick={() => handleBackgroundSelect(background.id)}
              >
                {/* Preview */}
                <div 
                  className="aspect-video w-full"
                  style={getPreviewStyle(background)}
                >
                  {/* Overlay for better text visibility */}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Selection indicator */}
                  {currentBackgroundId === background.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Premium badge */}
                  {background.premium && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-white">Pro</span>
                    </div>
                  )}
                </div>

                {/* Background name */}
                <div className="p-2 bg-white dark:bg-gray-700">
                  <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
                    {background.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default BackgroundSelector;