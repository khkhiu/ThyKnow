
import React, { useState } from 'react';
import { Coffee, Gamepad2, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PetCareProps {
  petHealth: number;
  petHappiness: number;
  streakPoints: number;
  onFeedPet: () => void;
  onPlayWithPet: () => void;
  onCleanPet: () => void;
}

const PetCare = ({ 
  petHealth, 
  petHappiness, 
  streakPoints, 
  onFeedPet, 
  onPlayWithPet, 
  onCleanPet 
}: PetCareProps) => {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleAction = (action: string, callback: () => void) => {
    if (streakPoints >= 1) {
      callback();
      setLastAction(action);
      setTimeout(() => setLastAction(null), 2000);
    }
  };

  const careActions = [
    {
      id: 'feed',
      name: 'Feed',
      icon: Coffee,
      cost: 1,
      description: 'Increase health +10',
      color: 'from-red-400 to-pink-500',
      onClick: () => handleAction('fed', onFeedPet)
    },
    {
      id: 'play',
      name: 'Play',
      icon: Gamepad2,
      cost: 1,
      description: 'Increase happiness +15',
      color: 'from-blue-400 to-purple-500',
      onClick: () => handleAction('played', onPlayWithPet)
    },
    {
      id: 'clean',
      name: 'Clean',
      icon: Sparkles,
      cost: 1,
      description: 'Increase health +5, happiness +5',
      color: 'from-green-400 to-teal-500',
      onClick: () => handleAction('cleaned', onCleanPet)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Pet Care</h2>
        <div className="flex items-center space-x-2 bg-yellow-100 rounded-full px-3 py-1">
          <Gift className="w-5 h-5 text-yellow-600" />
          <span className="font-bold text-yellow-700">{streakPoints} points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {careActions.map((action) => (
          <div key={action.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{action.name}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  <p className="text-xs text-gray-500">Cost: {action.cost} point</p>
                </div>
              </div>
              
              <Button
                onClick={action.onClick}
                disabled={streakPoints < action.cost}
                className={`px-6 py-2 bg-gradient-to-r ${action.color} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {streakPoints >= action.cost ? 'Use' : 'Need Points'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {lastAction && (
        <div className="bg-green-100 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-800 font-medium">
            You {lastAction} your pet! They look happier! ✨
          </p>
        </div>
      )}

      {streakPoints === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-blue-700">
            Complete habits to earn points for pet care! 🎯
          </p>
        </div>
      )}
    </div>
  );
};

export default PetCare;
