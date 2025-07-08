// ==================================================
// frontend/src/pages/Index.tsx
// Updated Index page with streak components in the stats tab
// ==================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the new streak components
import { WeeklyStreakDisplay } from '../components/streak/WeeklyStreakDisplay';
import { ProgressSection } from '../components/streak/ProgressSection';
import { PointsHistory } from '../components/streak/PointsHistory';
import { MilestonesGrid } from '../components/streak/MilestonesGrid';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

// Import the hooks
import { useStreakData } from '../hooks/useStreakData';
import { useTelegramIntegration } from '../hooks/useTelegramIntegration';

const Index: React.FC = () => {
  // Telegram integration hook
  const { telegramWebApp, user, isReady } = useTelegramIntegration();
  const [userId, setUserId] = useState<string>('');

  // Initialize user ID from Telegram or use a default for testing
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id.toString());
    } else {
      // For development/testing when not in Telegram
      setUserId('demo-user-123');
    }
  }, [user]);

  // Fetch streak data
  const {
    data: streakData,
    isLoading: streakLoading,
    error: streakError,
    refetch: refetchStreak
  } = useStreakData(userId);

  // Sample data for other tabs (replace with your actual data hooks)
  const totalEntriesCompleted = streakData?.points.recentHistory.length || 0;
  const currentStreak = streakData?.streak.current || 0;
  const longestStreak = streakData?.streak.longest || 0;
  const streakPoints = streakData?.points.total || 0;
  const petLevel = 3; // Replace with actual pet level data
  const entries = []; // Your entries array
  const ownedAccessories = []; // Your accessories array

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to ThyKnow
          </h1>
          <p className="text-lg text-gray-600">
            Your personal reflection companion
          </p>
        </div>

        {/* Quick Stats Cards - Now powered by real streak data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Streak Card */}
          <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <span>🔥</span>
                <span>Current Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {streakLoading ? '...' : `${currentStreak} weeks`}
              </div>
              <p className="text-orange-100 text-sm">Keep it going!</p>
            </CardContent>
          </Card>

          {/* Total Points Card */}
          <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <span>💎</span>
                <span>Total Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {streakLoading ? '...' : streakPoints.toLocaleString()}
              </div>
              <p className="text-green-100 text-sm">Weekly reflections!</p>
            </CardContent>
          </Card>

          {/* Best Streak Card */}
          <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Best Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {streakLoading ? '...' : `${longestStreak} weeks`}
              </div>
              <p className="text-purple-100 text-sm">Personal record!</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            📝 New Reflection
          </Button>
          
          <Button 
            variant="outline"
            className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg"
          >
            🦕 Visit Pet
          </Button>
        </div>

        {/* Updated Tabs - Stats tab now contains full streak functionality */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pet">Pet</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="stats">📊 Weekly Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📈 Progress Overview</CardTitle>
                <CardDescription>
                  Your reflection journey at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Weekly Streak</span>
                    <span className="font-bold text-orange-600">
                      {streakLoading ? '...' : `${currentStreak} weeks`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Points Earned</span>
                    <span className="font-bold text-green-600">
                      {streakLoading ? '...' : streakPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Longest Streak</span>
                    <span className="font-bold text-purple-600">
                      {streakLoading ? '...' : `${longestStreak} weeks`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Reflections</span>
                    <span className="font-bold text-blue-600">
                      {streakLoading ? '...' : totalEntriesCompleted}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pet" className="space-y-4">
            {/* Your existing pet content */}
            <Card>
              <CardHeader>
                <CardTitle>🦕 Your Reflection Pet</CardTitle>
                <CardDescription>
                  Your companion grows as you reflect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl">🦕</div>
                  <div className="space-y-2">
                    <div className="text-xl font-bold">Level {petLevel}</div>
                    <div className="text-gray-600">Happy Reflection Dino</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            {/* Your existing journal content */}
            <Card>
              <CardHeader>
                <CardTitle>📝 Recent Journal Entries</CardTitle>
                <CardDescription>
                  Your latest reflections and thoughts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>No journal entries yet.</p>
                  <p className="text-sm">Start your reflection journey today!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Complete Streak Functionality in Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Loading State */}
            {streakLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingSpinner size="large" />
                <p className="text-gray-600">Loading your weekly progress...</p>
              </div>
            )}

            {/* Error State */}
            {streakError && (
              <ErrorDisplay 
                message="Failed to load your streak data"
                onRetry={refetchStreak}
              />
            )}

            {/* Streak Content */}
            {!streakLoading && !streakError && streakData && (
              <>
                {/* Header for the stats section */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <span>📊</span>
                    Weekly Progress & Statistics
                  </h2>
                  <p className="text-gray-600">
                    Track your reflection journey and celebrate growth
                  </p>
                </div>

                {/* Main Streak Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>🔥</span>
                    Your Weekly Streak
                  </h3>
                  <WeeklyStreakDisplay 
                    streak={streakData.streak} 
                    points={streakData.points}
                  />
                </div>

                {/* Progress Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>📈</span>
                    Weekly Progress
                  </h3>
                  <ProgressSection streak={streakData.streak} />
                </div>

                {/* Points History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>📋</span>
                    Recent Activity
                  </h3>
                  <PointsHistory points={streakData.points} />
                </div>

                {/* Milestones */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>🏆</span>
                    Milestones
                  </h3>
                  <MilestonesGrid 
                    milestones={streakData.milestones}
                    currentStreak={streakData.streak.current}
                  />
                </div>
              </>
            )}

            {/* No Data State */}
            {!streakLoading && !streakError && !streakData && (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">📊</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">No Streak Data Yet</h3>
                  <p className="text-gray-600">Start your weekly reflection journey to see your progress!</p>
                  <Button className="mt-4">
                    📝 Begin Your First Reflection
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;