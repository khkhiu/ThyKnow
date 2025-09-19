// frontend/src/components/MiniApp/MiniAppMain.tsx
// Updated main miniapp component with deep link handling

import React, { useState, useEffect } from 'react';
import { useDeepLinkHandler } from '../../hooks/useDeepLink';
import MiniAppNav from '../Navigation/MiniAppNav';
import { Home, MessageCircle, BarChart3, Heart } from 'lucide-react';

interface MiniAppMainProps {
  currentPage?: 'home' | 'pet' | 'settings' | 'achievements';
}

const MiniAppMain: React.FC<MiniAppMainProps> = ({ currentPage = 'home' }) => {
  const [activePage, setActivePage] = useState(currentPage);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPromptChooser, setShowPromptChooser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const deepLink = useDeepLinkHandler();

  useEffect(() => {
    // Handle deep link navigation and actions
    deepLink.executeDeepLinkAction(
      (page) => {
        // Navigate to page
        const pageMap: Record<string, typeof activePage> = {
          '/miniapp': 'home',
          '/miniapp/pet': 'pet',
          '/miniapp/achievements': 'achievements',
          '/miniapp/settings': 'settings'
        };
        setActivePage(pageMap[page] || 'home');
      },
      (action, params) => {
        // Handle specific actions
        switch (action) {
          case 'new_prompt':
            // Show welcome for bot users getting new prompt
            if (deepLink.isFromBot) {
              setShowWelcome(true);
            }
            break;
          case 'show_prompt_chooser':
            setShowPromptChooser(true);
            break;
        }
      }
    );

    // Show welcome message for first-time bot users
    if (deepLink.isFromBot && deepLink.referenceSource?.includes('start')) {
      setShowWelcome(true);
    }

    setIsLoading(false);
  }, [deepLink]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  const handleClosePromptChooser = () => {
    setShowPromptChooser(false);
  };

  const handleNavigation = (page: typeof activePage) => {
    setActivePage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🦕</div>
          <p className="text-gray-600">Loading your ThyKnow space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Bot User Welcome Modal */}
      {showWelcome && deepLink.isFromBot && (
        <BotUserWelcomeModal 
          onClose={handleCloseWelcome}
          referenceSource={deepLink.referenceSource}
        />
      )}

      {/* Prompt Chooser Modal */}
      {showPromptChooser && (
        <PromptChooserModal onClose={handleClosePromptChooser} />
      )}

      {/* Main Content */}
      <div className="max-w-screen-sm mx-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🦕</span>
              <div>
                <h1 className="text-lg font-bold text-gray-800">ThyKnow</h1>
                <p className="text-xs text-gray-600">Your reflection companion</p>
              </div>
            </div>
            
            {/* Bot indicator */}
            {deepLink.isFromBot && (
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                From Bot
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          {activePage === 'home' && <HomePage deepLink={deepLink} />}
          {activePage === 'pet' && <PetPage />}
          {activePage === 'achievements' && <AchievementsPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Navigation */}
      <MiniAppNav currentPage={activePage} />
    </div>
  );
};

/**
 * Welcome modal for bot users
 */
const BotUserWelcomeModal: React.FC<{ onClose: () => void; referenceSource: string | null }> = ({ 
  onClose, 
  referenceSource 
}) => {
  const getWelcomeMessage = () => {
    if (referenceSource?.includes('start')) {
      return {
        title: "🎉 Welcome to ThyKnow!",
        message: "You've just unlocked your personal reflection space! Here you can get prompts, track progress, and interact with your dino friend.",
        cta: "Start Exploring"
      };
    }
    
    if (referenceSource?.includes('prompt')) {
      return {
        title: "✨ Your Prompt Awaits!",
        message: "Ready to reflect? Your personalized prompt is here, plus you can see your history and dino friend!",
        cta: "Get My Prompt"
      };
    }

    return {
      title: "🦕 Welcome Back!",
      message: "Your ThyKnow space has everything ready for you!",
      cta: "Continue"
    };
  };

  const welcome = getWelcomeMessage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-4">{welcome.title}</h2>
        <p className="text-gray-600 mb-6">{welcome.message}</p>
        <button
          onClick={onClose}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          {welcome.cta}
        </button>
      </div>
    </div>
  );
};

/**
 * Prompt chooser modal
 */
const PromptChooserModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const promptTypes = [
    { id: 'self_awareness', name: 'Self-Awareness', emoji: '🧠', description: 'Understand yourself better' },
    { id: 'connections', name: 'Connections', emoji: '💝', description: 'Explore relationships' },
    { id: 'growth', name: 'Growth', emoji: '🌱', description: 'Personal development' },
    { id: 'creativity', name: 'Creativity', emoji: '🎨', description: 'Express your thoughts' },
    { id: 'gratitude', name: 'Gratitude', emoji: '🙏', description: 'Appreciate life\'s gifts' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">🎯 Choose Your Prompt Style</h2>
        
        <div className="space-y-3">
          {promptTypes.map((type) => (
            <button
              key={type.id}
              className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              onClick={() => {
                // Handle prompt type selection
                console.log('Selected prompt type:', type.id);
                onClose();
              }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.emoji}</span>
                <div>
                  <h3 className="font-medium">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/**
 * Home page component
 */
const HomePage: React.FC<{ deepLink: any }> = ({ deepLink }) => {
  return (
    <div className="space-y-6">
      {/* Current prompt section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Today's Reflection</h2>
          <MessageCircle className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-700 mb-2">🧠 Self-Awareness</p>
          <p className="text-gray-800">What moment today made you feel most like yourself?</p>
        </div>
        
        <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors">
          Start Reflecting
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">7</p>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 text-center">
          <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">😊</p>
          <p className="text-sm text-gray-600">Dino Mood</p>
        </div>
      </div>

      {/* From bot indicator */}
      {deepLink.isFromBot && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            🤖 <strong>Tip:</strong> You can always return here through the bot using /miniapp!
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Placeholder components for other pages
 */
const PetPage: React.FC = () => (
  <div className="text-center py-12">
    <span className="text-6xl mb-4 block">🦕</span>
    <h2 className="text-xl font-bold mb-2">Your Dino Friend</h2>
    <p className="text-gray-600">Coming soon...</p>
  </div>
);

const AchievementsPage: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <span className="text-6xl mb-4 block">🏆</span>
      <h2 className="text-xl font-bold mb-2">Your Achievements</h2>
      <p className="text-gray-600 mb-6">Track your reflection journey milestones</p>
    </div>

    {/* Achievement cards */}
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 flex items-center space-x-4">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-xl">🥇</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">First Reflection</h3>
          <p className="text-sm text-gray-600">Completed your first daily reflection</p>
        </div>
        <div className="text-green-500 font-semibold">✓</div>
      </div>

      <div className="bg-white rounded-xl p-4 flex items-center space-x-4">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-xl">🔥</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">7-Day Streak</h3>
          <p className="text-sm text-gray-600">Maintain a week-long reflection habit</p>
        </div>
        <div className="text-green-500 font-semibold">✓</div>
      </div>

      <div className="bg-white rounded-xl p-4 flex items-center space-x-4 opacity-60">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-xl">📚</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">30 Reflections</h3>
          <p className="text-sm text-gray-600">Complete 30 total reflections</p>
        </div>
        <div className="text-gray-400">7/30</div>
      </div>
    </div>
  </div>
);

const SettingsPage: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <span className="text-6xl mb-4 block">⚙️</span>
      <h2 className="text-xl font-bold mb-2">Settings</h2>
      <p className="text-gray-600">Customize your ThyKnow experience</p>
    </div>

    {/* Settings sections */}
    <div className="space-y-4">
      {/* Notification settings */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-semibold mb-3">📱 Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Daily reminder</span>
            <button className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Achievement alerts</span>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy settings */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-semibold mb-3">🔒 Privacy</h3>
        <div className="space-y-3">
          <button className="w-full text-left text-sm py-2 border-b border-gray-100">
            Export my data
          </button>
          <button className="w-full text-left text-sm py-2 border-b border-gray-100">
            Delete all reflections
          </button>
          <button className="w-full text-left text-sm py-2 text-red-600">
            Delete account
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-semibold mb-3">ℹ️ About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>ThyKnow v1.0.0</p>
          <p>Your personal reflection companion</p>
          <button className="text-green-600 hover:underline">Privacy Policy</button>
        </div>
      </div>
    </div>
  </div>
);

export default MiniAppMain;