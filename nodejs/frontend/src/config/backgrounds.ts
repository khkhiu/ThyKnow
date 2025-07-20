// src/config/backgrounds.ts
import { BackgroundOption } from '../components/BackgroundWrapper';

// Centralized background configuration
export const BACKGROUND_CATEGORIES = {
  DEFAULT: 'default',
  NATURE: 'nature',
  ABSTRACT: 'abstract',
  GRADIENTS: 'gradients',
  SOLID: 'solid',
  PREMIUM: 'premium'
} as const;

export const ALL_BACKGROUNDS: BackgroundOption[] = [
  // Default backgrounds
  {
    id: 'thyknow-default',
    name: 'ThyKnow Default',
    type: 'image',
    value: '/images/ThyKnow_background.png',
    category: BACKGROUND_CATEGORIES.DEFAULT
  },
  
  // Nature backgrounds
  {
    id: 'nature-forest',
    name: 'Peaceful Forest',
    type: 'image',
    value: '/images/backgrounds/forest.jpg',
    category: BACKGROUND_CATEGORIES.NATURE
  },
  {
    id: 'nature-ocean',
    name: 'Ocean Waves',
    type: 'image',
    value: '/images/backgrounds/ocean.jpg',
    category: BACKGROUND_CATEGORIES.NATURE
  },
  {
    id: 'nature-mountains',
    name: 'Mountain View',
    type: 'image',
    value: '/images/backgrounds/mountains.jpg',
    category: BACKGROUND_CATEGORIES.NATURE,
    premium: true
  },
  
  // Abstract backgrounds
  {
    id: 'abstract-geometric',
    name: 'Geometric Shapes',
    type: 'image',
    value: '/images/backgrounds/geometric.png',
    category: BACKGROUND_CATEGORIES.ABSTRACT
  },
  {
    id: 'abstract-particles',
    name: 'Floating Particles',
    type: 'image',
    value: '/images/backgrounds/particles.png',
    category: BACKGROUND_CATEGORIES.ABSTRACT,
    premium: true
  },
  
  // Gradient backgrounds
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: BACKGROUND_CATEGORIES.GRADIENTS
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
    category: BACKGROUND_CATEGORIES.GRADIENTS
  },
  {
    id: 'gradient-purple',
    name: 'Purple Haze',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: BACKGROUND_CATEGORIES.GRADIENTS
  },
  {
    id: 'gradient-green',
    name: 'Nature Green',
    type: 'gradient',
    value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    category: BACKGROUND_CATEGORIES.GRADIENTS
  },
  
  // Solid colors
  {
    id: 'solid-dark',
    name: 'Dark Theme',
    type: 'color',
    value: '#1a1a1a',
    category: BACKGROUND_CATEGORIES.SOLID
  },
  {
    id: 'solid-light',
    name: 'Light Theme',
    type: 'color',
    value: '#ffffff',
    category: BACKGROUND_CATEGORIES.SOLID
  },
  {
    id: 'solid-blue',
    name: 'Calm Blue',
    type: 'color',
    value: '#3B82F6',
    category: BACKGROUND_CATEGORIES.SOLID
  },
  
  // Premium backgrounds
  {
    id: 'premium-aurora',
    name: 'Aurora Lights',
    type: 'image',
    value: '/images/backgrounds/aurora.jpg',
    category: BACKGROUND_CATEGORIES.PREMIUM,
    premium: true
  },
  {
    id: 'premium-space',
    name: 'Deep Space',
    type: 'image',
    value: '/images/backgrounds/space.jpg',
    category: BACKGROUND_CATEGORIES.PREMIUM,
    premium: true
  }
];

// Helper functions for background management
export const getBackgroundsByCategory = (category: string): BackgroundOption[] => {
  return ALL_BACKGROUNDS.filter(bg => bg.category === category);
};

export const getFreeBackgrounds = (): BackgroundOption[] => {
  return ALL_BACKGROUNDS.filter(bg => !bg.premium);
};

export const getPremiumBackgrounds = (): BackgroundOption[] => {
  return ALL_BACKGROUNDS.filter(bg => bg.premium);
};

export const getBackgroundById = (id: string): BackgroundOption | undefined => {
  return ALL_BACKGROUNDS.find(bg => bg.id === id);
};

// Default backgrounds for new users
export const DEFAULT_BACKGROUNDS = getFreeBackgrounds();

// Background themes for different moods/contexts
export const BACKGROUND_THEMES = {
  CALM: ['gradient-ocean', 'nature-forest', 'solid-blue'],
  ENERGETIC: ['gradient-sunset', 'abstract-geometric', 'premium-aurora'],
  MINIMAL: ['solid-light', 'solid-dark', 'gradient-purple'],
  NATURE: ['nature-forest', 'nature-ocean', 'nature-mountains']
} as const;