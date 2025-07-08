// ==================================================
// src/components/streak/PointsHistory.tsx
// Points history component
// ==================================================

import React from 'react';
import { PointsData } from '../../types/streak';
import styles from './PointsHistory.module.css';

interface PointsHistoryProps {
  points: PointsData;
}

export const PointsHistory: React.FC<PointsHistoryProps> = ({ points }) => {
  const recentEntries = points.recentHistory.slice(0, 10); // Show last 10

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Recent Activity</h3>
        <div className={styles.totalPoints}>
          {points.total.toLocaleString()} total points
        </div>
      </div>

      <div className={styles.historyList}>
        {recentEntries.map((entry, index) => (
          <div key={index} className={styles.historyItem}>
            <div className={styles.historyIcon}>
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className={styles.historyContent}>
              <div className={styles.historyPoints}>
                +{entry.points} points
              </div>
              <div className={styles.historyReason}>
                {entry.reason}
              </div>
              <div className={styles.historyDate}>
                {new Date(entry.date).toLocaleDateString()}
              </div>
            </div>
            <div className={styles.historyWeek}>
              Week {entry.weekId}
            </div>
          </div>
        ))}
      </div>

      {recentEntries.length === 0 && (
        <div className={styles.emptyState}>
          <p>No recent activity yet. Start your weekly reflection journey!</p>
        </div>
      )}
    </div>
  );
};