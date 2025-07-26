// ==================================================
// src/components/streak/MilestonesGrid.tsx
// Milestones grid component
// ==================================================

import React from 'react';
import styles from './MilestonesGrid.module.css';

interface MilestonesGridProps {
  milestones: Record<string, string>;
  currentStreak: number;
}

export const MilestonesGrid: React.FC<MilestonesGridProps> = ({
  milestones,
  currentStreak
}) => {
  const milestoneEntries = Object.entries(milestones).map(([weeks, title]) => ({
    weeks: parseInt(weeks),
    title,
    isCompleted: currentStreak >= parseInt(weeks),
    isNext: currentStreak < parseInt(weeks)
  })).sort((a, b) => a.weeks - b.weeks);

  return (
    <div className={styles.grid}>
      {milestoneEntries.map((milestone) => (
        <div 
          key={milestone.weeks}
          className={`${styles.milestoneCard} ${
            milestone.isCompleted ? styles.completed : ''
          } ${
            milestone.isNext && currentStreak < milestone.weeks ? styles.next : ''
          }`}
        >
          <div className={styles.milestoneWeeks}>
            {milestone.weeks} weeks
          </div>
          <div className={styles.milestoneTitle}>
            {milestone.title}
          </div>
          <div className={styles.milestoneStatus}>
            {milestone.isCompleted ? (
              <i className="fas fa-check-circle"></i>
            ) : (
              <i className="fas fa-clock"></i>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};