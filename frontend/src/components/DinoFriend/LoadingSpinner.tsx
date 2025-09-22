// components/DinoFriend/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated dino emoji */}
        <div className="text-8xl mb-4 animate-bounce">
          🥚
        </div>
        
        {/* Spinning loader */}
        <div className="relative mb-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-lg font-medium text-gray-700 animate-pulse">
          Hatching your dino friend...
        </p>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-4xl text-green-300 animate-ping animation-delay-1000">🌿</div>
          <div className="absolute top-1/3 right-1/4 text-3xl text-amber-300 animate-ping animation-delay-2000">⭐</div>
          <div className="absolute bottom-1/3 left-1/3 text-3xl text-green-300 animate-ping animation-delay-3000">🌱</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;