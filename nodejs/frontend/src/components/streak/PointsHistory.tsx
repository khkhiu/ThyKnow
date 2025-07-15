// frontend/src/components/streak/PointsHistory.tsx

import React from 'react';
import { PointsData } from '../../types/streak';
import { 
  formatPointsReason, 
  formatWeekIdentifier, 
  formatTimestamp, 
  formatNumber,
  formatStatsLabel 
} from '../../../../src/utils/textFormatter';
import styles from './PointsHistory.module.css';

interface PointsHistoryProps {
  points: PointsData;
  maxEntries?: number;
}

export const PointsHistory: React.FC<PointsHistoryProps> = ({ 
  points, 
  maxEntries = 10 
}) => {
  const recentEntries = points.recentHistory.slice(0, maxEntries);

  const getReasonIcon = (reason: string) => {
    if (reason.includes('milestone')) return '🏆';
    if (reason.includes('additional') || reason.includes('multiple')) return '✨';
    if (reason.includes('streak')) return '🔥';
    if (reason.includes('weekly')) return '📝';
    return '⭐';
  };

  const getReasonColor = (reason: string) => {
    if (reason.includes('milestone')) return 'text-yellow-600 bg-yellow-50';
    if (reason.includes('additional') || reason.includes('multiple')) return 'text-purple-600 bg-purple-50';
    if (reason.includes('streak')) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (!points.recentHistory || points.recentHistory.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-lg">{formatStatsLabel('no_points_history_yet')}</p>
          <p className="text-sm mt-2">{formatStatsLabel('complete_weekly_reflections_to_start_earning_points')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{formatStatsLabel('recent_activity')}</h3>
        <div className={styles.totalPoints}>
          {formatNumber(points.total)} {formatStatsLabel('total_points')}
        </div>
      </div>

      <div className={styles.historyList}>
        {recentEntries.map((entry, index) => {
          const formattedReason = formatPointsReason(entry.reason);
          const reasonColor = getReasonColor(entry.reason);
          const reasonIcon = getReasonIcon(entry.reason);
          
          return (
            <div key={index} className={styles.historyItem}>
              <div className={styles.historyIcon}>
                <span style={{ fontSize: '1.2rem' }}>{reasonIcon}</span>
              </div>
              <div className={styles.historyContent}>
                <div className={styles.historyPoints}>
                  +{formatNumber(entry.points)} {formatStatsLabel('points')}
                </div>
                <div className={styles.historyReason}>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${reasonColor}`}>
                    {formattedReason}
                  </span>
                </div>
                <div className={styles.historyDate}>
                  {formatTimestamp(entry.date)} • {formatWeekIdentifier(entry.weekId)}
                  {entry.streakWeek > 0 && (
                    <span className="ml-2">
                      • {formatStatsLabel('streak_week')} {entry.streakWeek}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-700 mb-3">
          {formatStatsLabel('points_summary')}
        </h5>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(points.total)}
            </div>
            <div className="text-xs text-gray-500">{formatStatsLabel('total_points')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(points.recentHistory.length)}
            </div>
            <div className="text-xs text-gray-500">{formatStatsLabel('recent_activities')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};