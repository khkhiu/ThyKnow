// ==================================================
// src/pages/StreakPage.tsx
// Main streak page component (replaces streak.html + streak.ts)
// ==================================================

import React, { useEffect, useState } from 'react';
import { useStreakData } from '../hooks/useStreakData';
import { useTelegramIntegration } from '../hooks/useTelegramIntegration';
import { WeeklyStreakDisplay } from '../components/streak/WeeklyStreakDisplay';
import { ProgressSection } from '../components/streak/ProgressSection';
import { PointsHistory } from '../components/streak/PointsHistory';
import { MilestonesGrid } from '../components/streak/MilestonesGrid';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
//import { StreakApiResponse } from '../types/streak';
import styles from './StreakPage.module.css';

export const StreakPage: React.FC = () => {
  const { telegramWebApp, user, isReady } = useTelegramIntegration();
  const [userId, setUserId] = useState<string>('');

  // Initialize user ID from Telegram
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id.toString());
    }
  }, [user]);

  const {
    data: streakData,
    isLoading,
    error,
    refetch
  } = useStreakData(userId);

  // Handle back button
  useEffect(() => {
    if (telegramWebApp?.BackButton) {
      const handleBack = () => {
        // Navigate back or close
        window.history.back();
      };
      
      telegramWebApp.BackButton.onClick(handleBack);
      telegramWebApp.BackButton.show();
      
      return () => {
        telegramWebApp.BackButton.offClick(handleBack);
        telegramWebApp.BackButton.hide();
      };
    }
  }, [telegramWebApp]);

  // Show loading state
  if (!isReady || isLoading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner />
        <p>Loading your weekly progress...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <ErrorDisplay 
        message="Failed to load your streak data"
        onRetry={refetch}
      />
    );
  }

  // Show no data state
  if (!streakData) {
    return (
      <ErrorDisplay 
        message="No streak data available"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>
            <i className="fas fa-chart-line"></i> Weekly Progress
          </h1>
          <p className={styles.tagline}>
            Track your reflection journey and celebrate growth
          </p>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* User's Personal Streak Section */}
        <section className={styles.streakSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <i className="fas fa-fire"></i> Your Weekly Streak
            </h2>
            <p>Building consistency, one week at a time</p>
          </div>
          <WeeklyStreakDisplay 
            streak={streakData.streak} 
            points={streakData.points}
          />
        </section>

        {/* Weekly Progress Section */}
        <section className={styles.progressSection}>
          <ProgressSection streak={streakData.streak} />
        </section>

        {/* Points History Section */}
        <section className={styles.historySection}>
          <div className={styles.sectionHeader}>
            <h2>
              <i className="fas fa-history"></i> Recent Activity
            </h2>
            <p>Your latest weekly reflections and points</p>
          </div>
          <PointsHistory points={streakData.points} />
        </section>

        {/* Milestones Section */}
        <section className={styles.milestonesSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <i className="fas fa-trophy"></i> Milestones
            </h2>
            <p>Weekly reflection achievements</p>
          </div>
          <MilestonesGrid 
            milestones={streakData.milestones}
            currentStreak={streakData.streak.current}
          />
        </section>
      </main>
    </div>
  );
};