// src/components/BackgroundWrapper.tsx
import React from 'react';

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'image' | 'gradient' | 'color';
  value: string; // URL for image, CSS gradient for gradient, hex/rgb for color
  preview?: string; // Optional smaller preview image
  premium?: boolean; // For premium backgrounds
  category?: string; // For organizing backgrounds
}

interface BackgroundWrapperProps {
  children: React.ReactNode;
  backgroundId?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
  fallbackBackground?: string;
}

// Default background options - you can move this to a separate config file
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
  }
];

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  children, 
  backgroundId = 'thyknow-default',
  overlay = true, 
  overlayOpacity = 0.1,
  className = "",
  fallbackBackground = '/images/ThyKnow_background.png'
}) => {
  // Find the selected background
  const selectedBackground = DEFAULT_BACKGROUNDS.find(bg => bg.id === backgroundId) || DEFAULT_BACKGROUNDS[0];
  
  // Generate background style based on type
  const getBackgroundStyle = () => {
    switch (selectedBackground.type) {
      case 'image':
        return {
          backgroundImage: `url('${selectedBackground.value}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
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
          backgroundImage: `url('${fallbackBackground}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
    }
  };

  return (
    <div 
      className={`min-h-screen relative transition-all duration-500 ease-in-out ${className}`}
      style={getBackgroundStyle()}
    >
      {/* Optional overlay for better text readability */}
      {overlay && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`
          }}
        />
      )}
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;