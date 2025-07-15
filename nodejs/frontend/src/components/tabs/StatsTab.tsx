// frontend/src/components/tabs/StatsTab.tsx
// Unified stats tab with cohesive weekly progress display

import React from 'react';
import { PointsHistory } from '../streak/PointsHistory';
import { MilestonesGrid } from '../streak/MilestonesGrid';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { useStreakData } from '../../hooks/useStreakData';
import { 
  formatStatsLabel, 
  formatPointsReason, 
  formatDisplayText,
  formatObjectForDisplay,
  formatNumber,
  formatWeekIdentifier
} from '../../../../src/utils/textFormatter';

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

  // Enhanced stats display component
  const StatItem: React.FC<{ label: string; value: string | number; color?: string; icon?: string }> = ({ 
    label, 
    value, 
    color = 'gray', 
    icon 
  }) => (
    <div className={`bg-gradient-to-r from-${color}-100 to-${color}-200 rounded-xl p-4 text-center`}>
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className={`text-2xl font-bold text-${color}-700`}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      <div className={`text-sm text-${color}-600`}>{formatStatsLabel(label)}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Unified Weekly Progress & Streak Display */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">
            {formatDisplayText('loading_streak_data')}...
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <ErrorDisplay 
            message={formatDisplayText('failed_to_load_streak_data')} 
            onRetry={refetch}
          />
        </div>
      ) : streakData ? (
        <>
          {/* Unified Progress Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {formatDisplayText('your_weekly_progress')}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {streakData.streak.hasEntryThisWeek ? (
                  <>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Week Complete
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Ready for Reflection
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Current Streak - Most Prominent */}
              <div className="col-span-2 lg:col-span-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-3xl font-bold mb-1">{streakData.streak.current}</div>
                <div className="text-sm opacity-90">{formatStatsLabel('current_streak')}</div>
                <div className="text-xs opacity-75 mt-1">
                  {streakData.streak.current === 1 ? 'week' : 'weeks'}
                </div>
              </div>

              {/* Total Points */}
              <StatItem 
                label="total_points" 
                value={streakData.points.total} 
                color="green"
                icon="⭐"
              />

              {/* Longest Streak */}
              <StatItem 
                label="longest_streak" 
                value={`${streakData.streak.longest}`} 
                color="orange"
                icon="🏆"
              />

              {/* Total entries completed */}
              <StatItem 
                label="total_entries_completed" 
                value={totalEntriesCompleted} 
                color="green"
                icon="📝"
              />
            </div>

            {/* Weekly Status & Milestone Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* This Week's Status */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">📅</span>
                  {formatStatsLabel('this_weeks_status')}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{formatStatsLabel('reflection_status')}</span>
                    <span className={`text-sm font-medium ${streakData.streak.hasEntryThisWeek ? 'text-green-600' : 'text-blue-600'}`}>
                      {streakData.streak.hasEntryThisWeek ? '✅ Complete' : '📝 Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{formatStatsLabel('week_identifier')}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatWeekIdentifier(streakData.streak.currentWeekId)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Milestone */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  {formatStatsLabel('next_milestone')}
                </h4>
                <div className="space-y-2">
                  {streakData.streak.weeksUntilNextMilestone > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{formatStatsLabel('weeks_remaining')}</span>
                        <span className="text-sm font-bold text-blue-600">
                          {streakData.streak.weeksUntilNextMilestone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{formatStatsLabel('reward')}</span>
                        <span className="text-sm font-bold text-green-600">
                          +{formatNumber(streakData.streak.nextMilestoneReward)} pts
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.max(10, 100 - (streakData.streak.weeksUntilNextMilestone / (streakData.streak.current + streakData.streak.weeksUntilNextMilestone)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-sm text-yellow-600 font-medium">🏆 All milestones achieved!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pet Status Bars */}
            {/*
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🦕</span>
                {formatStatsLabel('pet_status')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {formatStatsLabel('pet_health')}
                    </span>
                    <span className="text-sm text-gray-600">{petHealth}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${petHealth}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {formatStatsLabel('pet_happiness')}
                    </span>
                    <span className="text-sm text-gray-600">{petHappiness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${petHappiness}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            */}
          </div>

          {/* Points History */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {formatDisplayText('points_history')}
            </h3>
            <PointsHistory points={streakData.points} />
          </div>

          {/* Milestones Grid */}
          {/*
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {formatDisplayText('milestone_achievements')}
            </h3>
            <MilestonesGrid 
              milestones={streakData.milestones || {}} 
              currentStreak={streakData.streak?.current || 0}
            />
          </div>
          */}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center text-gray-500">
          <p>{formatDisplayText('no_streak_data_available')}</p>
        </div>
      )}
    </div>
  );
};