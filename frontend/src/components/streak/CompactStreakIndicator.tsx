// ==================================================
// src/components/streak/CompactStreakIndicator.tsx
// Compact streak indicator component
// ==================================================

import React from 'react';
import styles from './CompactStreakIndicator.module.css';

interface CompactStreakIndicatorProps {
  currentStreak: number;
  totalPoints: number;
  hasEntryThisWeek: boolean;
}

export const CompactStreakIndicator: React.FC<CompactStreakIndicatorProps> = ({
  currentStreak,
  totalPoints,
  hasEntryThisWeek
}) => {
  const streakColor = hasEntryThisWeek ? '#22c55e' : '#3b82f6';
  const statusIcon = hasEntryThisWeek ? '✓' : '📅';

  return (
    <div className={styles.container}>
      <div className={styles.content} style={{ color: streakColor }}>
        <span className={styles.status}>{statusIcon}</span>
        <span className={styles.number}>{currentStreak}w</span>
        <span className={styles.separator}>|</span>
        <span className={styles.points}>{totalPoints.toLocaleString()}pts</span>
      </div>
    </div>
  );
};
