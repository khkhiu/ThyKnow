// frontend/src/components/tabs/StatsTab.tsx

import React from 'react';
import { WeeklyStreakDisplay } from '../streak/WeeklyStreakDisplay';
import { ProgressSection } from '../streak/ProgressSection';
import { PointsHistory } from '../streak/PointsHistory';
import { MilestonesGrid } from '../streak/MilestonesGrid';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { useStreakData } from '../../hooks/useStreakData';
//import { Button } from '@/components/ui/button';

interface StatsTabProps {
  userId: string;
  totalEntriesCompleted: number;
  longestStreak: number;
  petLevel: number;
  streakPoints: number;
  petHealth: number;
  petHappiness: number;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  userId,
  totalEntriesCompleted,
  longestStreak,
  petLevel,
  streakPoints,
  petHealth,
  petHappiness
}) => {
  const { data: streakData, isLoading, error, refetch } = useStreakData(userId);

  return (
    <div className="space-y-4">
      {/* Original Stats Section */}
      {/* 
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{totalEntriesCompleted}</div>
            <div className="text-sm text-green-600">Habits Completed</div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{longestStreak}</div>
            <div className="text-sm text-blue-600">Longest Streak</div>
          </div>
          <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{petLevel}</div>
            <div className="text-sm text-purple-600">Pet Level</div>
          </div>
          <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{streakPoints}</div>
            <div className="text-sm text-amber-600">Fossil Coins</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Pet Health</span>
              <span className="text-sm text-gray-600">{petHealth}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${petHealth}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Pet Happiness</span>
              <span className="text-sm text-gray-600">{petHappiness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${petHappiness}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
        */}
      {/* Streak Components */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your streak data...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <ErrorDisplay 
            message="Failed to load streak data" 
            onRetry={refetch}
          />
        </div>
      ) : streakData ? (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🔥</span>
              Weekly Streak Details
            </h3>
            <WeeklyStreakDisplay 
              streak={streakData.streak} 
              points={streakData.points}
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📈</span>
              Weekly Progress
            </h3>
            <ProgressSection streak={streakData.streak} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>💰</span>
                Recent Activity
              </h3>
              <PointsHistory points={streakData.points} />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏆</span>
                Milestones
              </h3>
              <MilestonesGrid 
                milestones={streakData.milestones}
                currentStreak={streakData.streak.current}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};