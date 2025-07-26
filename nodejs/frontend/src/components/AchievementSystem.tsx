
import React from 'react';
import { Trophy, Medal, Star, Crown, Target, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: string;
}

interface AchievementSystemProps {
  totalHabitsCompleted: number;
  longestStreak: number;
  petLevel: number;
  achievements: Achievement[];
}

const AchievementSystem = ({ 
  totalHabitsCompleted, 
  longestStreak, 
  petLevel,
  achievements 
}: AchievementSystemProps) => {
  const defaultAchievements: Achievement[] = [
    {
      id: 'first-habit',
      name: 'First Steps',
      description: 'Complete your first habit',
      icon: Target,
      unlocked: totalHabitsCompleted >= 1,
      progress: Math.min(totalHabitsCompleted, 1),
      maxProgress: 1,
      category: 'Beginner'
    },
    {
      id: 'streak-week',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: Medal,
      unlocked: longestStreak >= 7,
      progress: Math.min(longestStreak, 7),
      maxProgress: 7,
      category: 'Consistency'
    },
    {
      id: 'habit-master',
      name: 'Habit Master',
      description: 'Complete 50 habits total',
      icon: Trophy,
      unlocked: totalHabitsCompleted >= 50,
      progress: Math.min(totalHabitsCompleted, 50),
      maxProgress: 50,
      category: 'Dedication'
    },
    {
      id: 'pet-evolution',
      name: 'Pet Evolution',
      description: 'Raise your pet to level 5',
      icon: Crown,
      unlocked: petLevel >= 5,
      progress: Math.min(petLevel, 5),
      maxProgress: 5,
      category: 'Pet Care'
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintain a 30-day streak',
      icon: Zap,
      unlocked: longestStreak >= 30,
      progress: Math.min(longestStreak, 30),
      maxProgress: 30,
      category: 'Expert'
    },
    {
      id: 'centurion',
      name: 'Centurion',
      description: 'Complete 100 habits total',
      icon: Star,
      unlocked: totalHabitsCompleted >= 100,
      progress: Math.min(totalHabitsCompleted, 100),
      maxProgress: 100,
      category: 'Legend'
    }
  ];

  const allAchievements = achievements.length > 0 ? achievements : defaultAchievements;
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;

  const getCategoryColor = (category: string) => {
    const colors = {
      Beginner: 'from-green-400 to-green-500',
      Consistency: 'from-blue-400 to-blue-500',
      Dedication: 'from-purple-400 to-purple-500',
      'Pet Care': 'from-pink-400 to-pink-500',
      Expert: 'from-orange-400 to-orange-500',
      Legend: 'from-yellow-400 to-yellow-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Achievements</h2>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 py-1">
          <span className="text-sm font-bold text-purple-700">
            {unlockedCount}/{allAchievements.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {allAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`bg-white rounded-2xl p-4 shadow-lg border-2 transition-all duration-300 ${
              achievement.unlocked 
                ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' 
                : 'border-gray-100'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getCategoryColor(achievement.category)} flex items-center justify-center ${
                !achievement.unlocked ? 'opacity-50' : ''
              }`}>
                <achievement.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h3>
                  {achievement.unlocked && <span className="text-xl">🏆</span>}
                </div>
                <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                  {achievement.description}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{achievement.category}</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${getCategoryColor(achievement.category)}`}
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementSystem;
