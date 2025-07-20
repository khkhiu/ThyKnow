// src/components/BackgroundWrapper.tsx - Improved version
import React, { useState, useEffect } from 'react';

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'image' | 'gradient' | 'color';
  value: string;
  preview?: string;
  premium?: boolean;
  category?: string;
}

interface BackgroundWrapperProps {
  children: React.ReactNode;
  backgroundId?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
  fallbackBackground?: string;
}

// Updated backgrounds with better fallbacks
export const DEFAULT_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'thyknow-default',
    name: 'ThyKnow Default',
    type: 'image',
    value: '/images/ThyKnow_background.png'
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)'
  },
  {
    id: 'gradient-nature',
    name: 'Nature Green',
    type: 'gradient',
    value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  {
    id: 'gradient-purple',
    name: 'Purple Dream',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'solid-dark',
    name: 'Dark Theme',
    type: 'color',
    value: '#1a1a1a'
  },
  {
    id: 'solid-light',
    name: 'Light Theme',
    type: 'color',
    value: '#ffffff'
  },
  {
    id: 'solid-blue',
    name: 'Calm Blue',
    type: 'color',
    value: '#3B82F6'
  }
];

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  children, 
  backgroundId = 'thyknow-default',
  overlay = true, 
  overlayOpacity = 0.1,
  className = "",
  fallbackBackground = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Find the selected background
  const selectedBackground = DEFAULT_BACKGROUNDS.find(bg => bg.id === backgroundId) || DEFAULT_BACKGROUNDS[0];
  
  // Preload image if it's an image type
  useEffect(() => {
    if (selectedBackground.type === 'image') {
      setImageLoaded(false);
      setImageError(false);
      
      const img = new Image();
      img.onload = () => {
        console.log('✅ Background image loaded:', selectedBackground.value);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error('❌ Background image failed to load:', selectedBackground.value);
        setImageError(true);
      };
      img.src = selectedBackground.value;
    }
  }, [selectedBackground]);

  // Generate background style based on type
  const getBackgroundStyle = () => {
    switch (selectedBackground.type) {
      case 'image':
        if (imageError) {
          // Fallback to gradient if image fails
          console.log('Using fallback background due to image error');
          return { background: fallbackBackground };
        }
        return {
          backgroundImage: `url('${selectedBackground.value}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll', // Changed from 'fixed' for better mobile support
        };
      case 'gradient':
        return {
          background: selectedBackground.value
        };
      case 'color':
        return {
          backgroundColor: selectedBackground.value
        };
      default:
        return {
          background: fallbackBackground
        };
    }
  };

  // Get overlay color based on background type
  const getOverlayColor = () => {
    if (selectedBackground.type === 'color' && selectedBackground.value === '#1a1a1a') {
      // For dark backgrounds, use light overlay
      return `rgba(255, 255, 255, ${overlayOpacity * 0.5})`;
    }
    // For light backgrounds and images, use white overlay
    return `rgba(255, 255, 255, ${overlayOpacity})`;
  };

  return (
    <div 
      className={`min-h-screen relative transition-all duration-500 ease-in-out ${className}`}
      style={getBackgroundStyle()}
    >
      {/* Loading indicator for images */}
      {selectedBackground.type === 'image' && !imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Optional overlay for better text readability */}
      {overlay && (imageLoaded || selectedBackground.type !== 'image') && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundColor: getOverlayColor()
          }}
        />
      )}
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 bg-black text-white p-2 rounded text-xs z-50 max-w-xs">
          <div>Background: {selectedBackground.name}</div>
          <div>Type: {selectedBackground.type}</div>
          {selectedBackground.type === 'image' && (
            <>
              <div>Loaded: {imageLoaded ? '✅' : '❌'}</div>
              <div>Error: {imageError ? '❌' : '✅'}</div>
              <div className="break-all">URL: {selectedBackground.value}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundWrapper;