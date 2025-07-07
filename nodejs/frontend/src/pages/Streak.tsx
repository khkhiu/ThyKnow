import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WeeklyProgress {
  currentStreak: number;
  currentWeekCompleted: boolean;
  currentWeekEntry: any;
  weeklyHistory: any[];
}

const Streak = () => {
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Initialize Telegram WebApp if available
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme colors
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
    }
  }, []);

  // Fetch user progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Try to get user ID from Telegram WebApp
        const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '12345';
        
        const response = await fetch(`/api/miniapp/history/${userId}`);
        if (response.ok) {
          const data = await response.json();
          // Calculate progress from history data
          const weeklyProgress: WeeklyProgress = {
            currentStreak: data.weeklyProgress?.currentStreak || 0,
            currentWeekCompleted: data.weeklyProgress?.currentWeekCompleted || false,
            currentWeekEntry: data.weeklyProgress?.currentWeekEntry || null,
            weeklyHistory: data.weeklyProgress?.weeklyHistory || []
          };
          setProgress(weeklyProgress);
        } else {
          // Fallback data
          setProgress({
            currentStreak: 3,
            currentWeekCompleted: false,
            currentWeekEntry: null,
            weeklyHistory: []
          });
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Unable to load progress data');
        // Fallback data
        setProgress({
          currentStreak: 0,
          currentWeekCompleted: false,
          currentWeekEntry: null,
          weeklyHistory: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const streakDays = progress?.currentStreak || 0;
  const progressPercent = progress?.currentWeekCompleted ? 100 : (streakDays > 0 ? Math.min((streakDays / 7) * 100, 100) : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-800">Weekly Progress</h1>
          <p className="text-gray-600 mt-2">Track your reflection journey and celebrate milestones!</p>
        </div>

        {/* Current Streak Card */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">🔥 Current Streak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{streakDays}</div>
              <p className="text-gray-600">
                {streakDays === 1 ? 'day' : 'days'} of reflection
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Weekly Goal Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            {progress?.currentWeekCompleted ? (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">🎉 Week completed! Amazing work!</p>
              </div>
            ) : (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-700">
                  {7 - streakDays} more {7 - streakDays === 1 ? 'day' : 'days'} to complete this week!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Calendar */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">📅 This Week</CardTitle>
            <CardDescription className="text-center">Your daily reflection progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                const completed = index < streakDays;
                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                      completed
                        ? 'bg-green-500 text-white'
                        : index === streakDays
                        ? 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {completed ? '✓' : day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-center">🏆 Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`p-3 rounded-lg flex items-center space-x-3 ${
              streakDays >= 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <div className="text-2xl">{streakDays >= 1 ? '🌱' : '⭕'}</div>
              <div>
                <p className="font-medium">First Reflection</p>
                <p className="text-sm text-gray-600">Complete your first daily reflection</p>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg flex items-center space-x-3 ${
              streakDays >= 3 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <div className="text-2xl">{streakDays >= 3 ? '🔥' : '⭕'}</div>
              <div>
                <p className="font-medium">Three Day Streak</p>
                <p className="text-sm text-gray-600">Reflect for 3 consecutive days</p>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg flex items-center space-x-3 ${
              progress?.currentWeekCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <div className="text-2xl">{progress?.currentWeekCompleted ? '🏆' : '⭕'}</div>
              <div>
                <p className="font-medium">Weekly Warrior</p>
                <p className="text-sm text-gray-600">Complete a full week of reflections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="bg-white/80"
          >
            ← Back
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            🦕 Main App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Streak;