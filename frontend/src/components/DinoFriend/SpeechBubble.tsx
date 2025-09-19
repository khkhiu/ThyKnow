// components/DinoFriend/SpeechBubble.tsx
import React from 'react';

interface SpeechBubbleProps {
  text: string;
  isVisible: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, isVisible }) => {
  return (
    <div
      className={`
        absolute top-[-80px] left-1/2 transform -translate-x-1/2 z-20
        bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 shadow-lg
        max-w-xs text-center transition-all duration-300 ease-in-out
        ${isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }
      `}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      {/* Speech bubble content */}
      <p className="text-sm font-medium text-gray-800 leading-relaxed">
        {text}
      </p>
      
      {/* Speech bubble tail */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white"></div>
        <div className="absolute top-[-14px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-gray-200"></div>
      </div>
      
      {/* Optional sparkle decoration */}
      <div className="absolute -top-1 -right-1 text-yellow-400 text-lg animate-pulse">
        ✨
      </div>
    </div>
  );
};

export default SpeechBubble;