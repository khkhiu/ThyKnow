// ==================================================
// src/components/streak/RewardCelebration.tsx
// Reward celebration component
// ==================================================

import React, { useEffect, useState } from 'react';
import { WeeklyRewardsResponse } from '../../types/streak';
import styles from './RewardCelebration.module.css';

interface RewardCelebrationProps {
  rewards: WeeklyRewardsResponse;
  motivationalMessage: string;
  onClose: () => void;
}

export const RewardCelebration: React.FC<RewardCelebrationProps> = ({
  rewards,
  motivationalMessage,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  // Determine celebration type and styling
  let celebrationClass = styles.normal;
  let icon = '🌟';
  let title = 'Week Complete!';

  if (rewards.isNewRecord) {
    celebrationClass = styles.record;
    icon = '📈';
    title = 'New Personal Record!';
  } else if (rewards.milestoneReached) {
    celebrationClass = styles.milestone;
    icon = '🏆';
    if (rewards.milestoneReached === 4) title = 'Monthly Reflector Achieved!';
    else if (rewards.milestoneReached === 12) title = 'Quarterly Champion!';
    else if (rewards.milestoneReached === 26) title = 'Half-Year Hero!';
    else if (rewards.milestoneReached === 52) title = 'Annual Achiever!';
    else if (rewards.milestoneReached === 104) title = 'Biennial Master!';
    else title = `${rewards.milestoneReached}-Week Milestone!`;
  } else if (rewards.streakBroken) {
    celebrationClass = styles.restart;
    icon = '🌱';
    title = 'Fresh Start!';
  } else if (rewards.isMultipleEntry) {
    celebrationClass = styles.bonus;
    icon = '✨';
    title = 'Extra Reflection!';
  }

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : styles.hidden}`}>
      <div className={`${styles.content} ${celebrationClass}`}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.points}>
          +{rewards.pointsAwarded} points earned
        </div>
        <div className={styles.streak}>
          {rewards.newStreak} week{rewards.newStreak === 1 ? '' : 's'} of consistent reflection
        </div>
        <div className={styles.message}>{motivationalMessage}</div>
        <div className={styles.weekInfo}>Week {rewards.weekId}</div>
        <button className={styles.closeButton} onClick={handleClose}>
          Continue Growing
        </button>
      </div>
    </div>
  );
};