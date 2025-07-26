// components/Navigation/MiniAppNav.tsx
import React from 'react';
import { Home, Settings, Award, Heart } from 'lucide-react';

interface MiniAppNavProps {
  currentPage: 'home' | 'pet' | 'settings' | 'achievements';
}

const MiniAppNav: React.FC<MiniAppNavProps> = ({ currentPage }) => {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/miniapp',
      emoji: '🏠'
    },
    {
      id: 'pet',
      label: 'Dino Friend',
      icon: Heart,
      href: '/miniapp/pet',
      emoji: '🦕'
    },
    {
      id: 'achievements',
      label: 'Awards',
      icon: Award,
      href: '/miniapp/achievements',
      emoji: '🏆'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/miniapp/settings',
      emoji: '⚙️'
    }
  ];

  const handleNavClick = (href: string) => {
    // In a real implementation, you'd use React Router or Next.js router
    // For now, we'll use window.location
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="max-w-screen-sm mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-xl
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-green-100 text-green-600 scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                  min-w-[60px] min-h-[60px]
                `}
                aria-label={item.label}
              >
                {/* Use emoji for more character */}
                <span className={`text-xl mb-1 ${isActive ? 'animate-bounce' : ''}`}>
                  {item.emoji}
                </span>
                
                {/* Label */}
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MiniAppNav;