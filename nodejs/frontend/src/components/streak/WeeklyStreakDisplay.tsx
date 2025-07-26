// ==================================================
// src/components/streak/WeeklyStreakDisplay.tsx
// Main weekly streak display component
// ==================================================

import React, { useEffect, useRef } from 'react';
import { WeeklyStreakData, PointsData } from '../../types/streak';
//import { CompactStreakIndicator } from './CompactStreakIndicator';
import styles from './WeeklyStreakDisplay.module.css';

interface WeeklyStreakDisplayProps {
  streak: WeeklyStreakData;
  points: PointsData;
}

export const WeeklyStreakDisplay: React.FC<WeeklyStreakDisplayProps> = ({
  streak,
  points
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation effect when streak updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.classList.add(styles.updating);
      const timer = setTimeout(() => {
        containerRef.current?.classList.remove(styles.updating);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [streak.current]);

  const progressToNextMilestone = streak.weeksUntilNextMilestone > 0 
    ? ((10 - streak.weeksUntilNextMilestone) / 10) * 100 
    : 100;

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Header with main streak and points */}
      <div className={styles.header}>
        <div className={styles.streakMain}>
          <div className={styles.streakFlame}>📅</div>
          <div className={styles.streakNumber}>{streak.current}</div>
          <div className={styles.streakLabel}>Week Streak</div>
          {streak.hasEntryThisWeek && (
            <div className={styles.thisWeekBadge}>✓ This Week</div>
          )}
        </div>
        
        <div className={styles.pointsDisplay}>
          <div className={styles.pointsNumber}>
            {points.total.toLocaleString()}
          </div>
          <div className={styles.pointsLabel}>Total Points</div>
        </div>
      </div>

      {/* Progress section */}
      <div className={styles.progressSection}>
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>Progress to Next Milestone</span>
            <span>{streak.weeksUntilNextMilestone} weeks to go</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progressToNextMilestone}%` }}
            />
          </div>
        </div>

        <div className={styles.milestoneInfo}>
          <div className={styles.milestoneReward}>
            Next: +{streak.nextMilestoneReward} points
          </div>
          <div className={styles.milestoneEncouragement}>
            Weekly reflection builds lasting self-awareness
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{streak.longest}</div>
          <div className={styles.statLabel}>Best Streak</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {Math.round((streak.current / Math.max(streak.longest, 1)) * 100)}%
          </div>
          <div className={styles.statLabel}>Of Best</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>
            {points.recentHistory.length}
          </div>
          <div className={styles.statLabel}>Recent Entries</div>
        </div>
      </div>
    </div>
  );
};