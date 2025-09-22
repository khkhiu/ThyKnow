// ==================================================
// src/components/streak/ProgressSection.tsx
// Progress section component
// ==================================================

import React from 'react';
import { WeeklyStreakData } from '../../types/streak';
import styles from './ProgressSection.module.css';

interface ProgressSectionProps {
  streak: WeeklyStreakData;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({ streak }) => {
  return (
    <div className={styles.progressGrid}>
      {/* Weekly Status Card */}
      <div className={styles.progressCard}>
        <h3>This Week's Status</h3>
        <div className={styles.weeklyStatus}>
          <div className={styles.statusItem}>
            <div className={styles.statusIcon}>
              {streak.hasEntryThisWeek ? '✅' : '📅'}
            </div>
            <div className={styles.statusText}>
              <h4>{streak.hasEntryThisWeek ? 'Week Complete!' : 'Awaiting Entry'}</h4>
              <p>
                {streak.hasEntryThisWeek 
                  ? 'Great work! Your weekly reflection is complete.'
                  : 'Ready for your weekly reflection when you are.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress Card */}
      <div className={styles.progressCard}>
        <h3>Next Milestone</h3>
        <div className={styles.milestoneProgress}>
          <div className={styles.milestoneWeeks}>
            {streak.weeksUntilNextMilestone}
          </div>
          <div className={styles.milestoneLabel}>
            weeks until next milestone
          </div>
          <div className={styles.milestoneReward}>
            +{streak.nextMilestoneReward} points
          </div>
        </div>
      </div>
    </div>
  );
};
