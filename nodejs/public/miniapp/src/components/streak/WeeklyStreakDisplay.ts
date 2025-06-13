// File: public/miniapp/src/components/WeeklyStreakDisplay.ts
// Frontend components for displaying weekly streak and points information

export interface WeeklyStreakData {
  current: number;
  longest: number;
  weeksUntilNextMilestone: number;
  nextMilestoneReward: number;
  hasEntryThisWeek: boolean;
  currentWeekId: string;
}

export interface PointsData {
  total: number;
  recentHistory: Array<{
    points: number;
    reason: string;
    streakWeek: number;
    weekId: string;
    date: string;
  }>;
}

export interface WeeklyRewardsResponse {
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean;
  isMultipleEntry: boolean;
  weekId: string;
}

/**
 * Creates the main weekly streak display component
 * Emphasizes consistency and long-term growth over daily frequency
 */
export function createWeeklyStreakDisplay(streak: WeeklyStreakData, points: PointsData): HTMLElement {
  const container = document.createElement('div');
  container.className = 'weekly-streak-container';
  
  // Design philosophy: "Sustainable Growth" - celebrate consistency and meaningful progress
  container.innerHTML = `
    <div class="streak-header">
      <div class="streak-main">
        <div class="streak-flame">📅</div>
        <div class="streak-number">${streak.current}</div>
        <div class="streak-label">Week Streak</div>
        ${streak.hasEntryThisWeek ? '<div class="this-week-badge">✓ This Week</div>' : ''}
      </div>
      <div class="points-display">
        <div class="points-number">${points.total.toLocaleString()}</div>
        <div class="points-label">Total Points</div>
      </div>
    </div>
    
    <div class="progress-section">
      ${createWeeklyProgressBar(streak)}
      ${createWeeklyMilestoneInfo(streak)}
    </div>
    
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-number">${streak.longest}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${points.recentHistory.length}</div>
        <div class="stat-label">Recent Entries</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">${streak.currentWeekId}</div>
        <div class="stat-label">Current Week</div>
      </div>
    </div>
  `;
  
  return container;
}

/**
 * Creates a progress bar showing advancement toward next weekly milestone
 * Focuses on meaningful achievements rather than quick wins
 */
function createWeeklyProgressBar(streak: WeeklyStreakData): string {
  if (streak.weeksUntilNextMilestone === 0) {
    return '<div class="milestone-completed">🏆 All weekly milestones achieved!</div>';
  }
  
  // Calculate what milestone they're working toward
  const nextMilestone = streak.current + streak.weeksUntilNextMilestone;
  const progressPercent = (streak.current / nextMilestone) * 100;
  
  // Create meaningful milestone names
  let milestoneName = '';
  if (nextMilestone === 4) milestoneName = 'Monthly Reflector';
  else if (nextMilestone === 12) milestoneName = 'Quarterly Champion';
  else if (nextMilestone === 26) milestoneName = 'Half-Year Hero';
  else if (nextMilestone === 52) milestoneName = 'Annual Achiever';
  else if (nextMilestone === 104) milestoneName = 'Biennial Master';
  else milestoneName = `${nextMilestone}-Week Achievement`;
  
  return `
    <div class="progress-container">
      <div class="progress-header">
        <span>Progress to ${milestoneName}</span>
        <span>${streak.weeksUntilNextMilestone} weeks to go</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    </div>
  `;
}

/**
 * Creates weekly milestone information display
 * Emphasizes the significance of weekly commitment
 */
function createWeeklyMilestoneInfo(streak: WeeklyStreakData): string {
  if (streak.weeksUntilNextMilestone === 0) {
    return '';
  }
  
  return `
    <div class="milestone-info">
      <div class="milestone-reward">
        ${streak.nextMilestoneReward} bonus points await your next milestone!
      </div>
      <div class="milestone-encouragement">
        Weekly reflection builds lasting self-awareness
      </div>
    </div>
  `;
}

/**
 * Creates a celebration animation for weekly rewards
 * Designed to feel meaningful and sustainable rather than addictive
 */
export function createWeeklyRewardCelebration(rewards: WeeklyRewardsResponse, motivationalMessage: string): HTMLElement {
  const celebration = document.createElement('div');
  celebration.className = 'weekly-reward-celebration';
  
  // Different celebration styles based on the type of weekly achievement
  let celebrationClass = 'celebration-weekly-normal';
  let icon = '🌟';
  let title = 'Week Complete!';
  
  if (rewards.isNewRecord) {
    celebrationClass = 'celebration-weekly-record';
    icon = '📈';
    title = 'New Personal Record!';
  } else if (rewards.milestoneReached) {
    celebrationClass = 'celebration-weekly-milestone';
    icon = '🏆';
    if (rewards.milestoneReached === 4) title = 'Monthly Reflector Achieved!';
    else if (rewards.milestoneReached === 12) title = 'Quarterly Champion!';
    else if (rewards.milestoneReached === 26) title = 'Half-Year Hero!';
    else if (rewards.milestoneReached === 52) title = 'Annual Achiever!';
    else if (rewards.milestoneReached === 104) title = 'Biennial Master!';
    else title = `${rewards.milestoneReached}-Week Milestone!`;
  } else if (rewards.streakBroken) {
    celebrationClass = 'celebration-weekly-restart';
    icon = '🌱';
    title = 'Fresh Start!';
  } else if (rewards.isMultipleEntry) {
    celebrationClass = 'celebration-weekly-bonus';
    icon = '✨';
    title = 'Extra Reflection!';
  }
  
  celebration.innerHTML = `
    <div class="celebration-overlay ${celebrationClass}">
      <div class="celebration-content">
        <div class="celebration-icon">${icon}</div>
        <div class="celebration-title">${title}</div>
        <div class="celebration-points">+${rewards.pointsAwarded} points earned</div>
        <div class="celebration-streak">
          ${rewards.newStreak} week${rewards.newStreak === 1 ? '' : 's'} of consistent reflection
        </div>
        <div class="celebration-message">${motivationalMessage}</div>
        <div class="celebration-week-info">Week ${rewards.weekId}</div>
        <button class="celebration-close" onclick="this.parentElement.parentElement.remove()">
          Continue Growing
        </button>
      </div>
    </div>
  `;
  
  return celebration;
}

/**
 * Creates a compact weekly streak indicator for persistent display
 * Emphasizes the sustainable nature of weekly reflection
 */
export function createCompactWeeklyStreakIndicator(currentStreak: number, totalPoints: number, hasEntryThisWeek: boolean): HTMLElement {
  const indicator = document.createElement('div');
  indicator.className = 'compact-weekly-streak';
  
  // Use color psychology - green for completed weeks, blue for in-progress
  const streakColor = hasEntryThisWeek ? '#22c55e' : '#3b82f6';
  const statusIcon = hasEntryThisWeek ? '✓' : '📅';
  
  indicator.innerHTML = `
    <div class="compact-content" style="color: ${streakColor}">
      <span class="compact-status">${statusIcon}</span>
      <span class="compact-number">${currentStreak}w</span>
      <span class="compact-separator">|</span>
      <span class="compact-points">${totalPoints.toLocaleString()}pts</span>
    </div>
  `;
  
  return indicator;
}

/**
 * Updates the weekly streak display with new data
 * Smooth transitions that emphasize growth over time
 */
export function updateWeeklyStreakDisplay(
  container: HTMLElement, 
  newStreak: WeeklyStreakData, 
  newPoints: PointsData
): void {
  // Find existing elements and update them with gentle animation
  const streakNumber = container.querySelector('.streak-number');
  const pointsNumber = container.querySelector('.points-number');
  const bestStreak = container.querySelector('.stat-item .stat-number');
  
  if (streakNumber) {
    animateWeeklyNumberChange(streakNumber as HTMLElement, newStreak.current);
  }
  
  if (pointsNumber) {
    animateWeeklyNumberChange(pointsNumber as HTMLElement, newPoints.total);
  }
  
  if (bestStreak) {
    animateWeeklyNumberChange(bestStreak as HTMLElement, newStreak.longest);
  }
  
  // Update progress bar and milestone info
  const progressSection = container.querySelector('.progress-section');
  if (progressSection) {
    progressSection.innerHTML = createWeeklyProgressBar(newStreak) + createWeeklyMilestoneInfo(newStreak);
  }
  
  // Update this week badge
  const existingBadge = container.querySelector('.this-week-badge');
  const streakMain = container.querySelector('.streak-main');
  
  if (newStreak.hasEntryThisWeek && !existingBadge && streakMain) {
    const badge = document.createElement('div');
    badge.className = 'this-week-badge';
    badge.textContent = '✓ This Week';
    streakMain.appendChild(badge);
  } else if (!newStreak.hasEntryThisWeek && existingBadge) {
    existingBadge.remove();
  }
}

/**
 * Animates number changes with a gentle, sustainable feel
 * Less flashy than daily streaks - more about steady progress
 */
function animateWeeklyNumberChange(element: HTMLElement, newValue: number): void {
  const currentValue = parseInt(element.textContent || '0');
  const difference = newValue - currentValue;
  
  if (difference === 0) return;
  
  // Add a gentle highlight effect for weekly updates
  element.classList.add('weekly-number-updating');
  
  // Animate the number change over a comfortable duration
  const duration = 800; // Slightly longer than daily for contemplative feel
  const steps = 15;
  const increment = difference / steps;
  let current = currentValue;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
      current = newValue;
      clearInterval(timer);
      element.classList.remove('weekly-number-updating');
    }
    
    element.textContent = Math.round(current).toLocaleString();
  }, duration / steps);
}

/**
 * Creates a weekly reflection summary component
 * Shows the user's progress in a meaningful, non-gamified way
 */
export function createWeeklyReflectionSummary(
  currentWeek: string,
  streakData: WeeklyStreakData,
  pointsData: PointsData
): HTMLElement {
  const summary = document.createElement('div');
  summary.className = 'weekly-reflection-summary';
  
  const consistencyPercent = streakData.longest > 0 ? 
    Math.round((streakData.current / streakData.longest) * 100) : 100;
  
  summary.innerHTML = `
    <div class="summary-header">
      <h3>Your Reflection Journey</h3>
      <div class="summary-week">Week ${currentWeek}</div>
    </div>
    
    <div class="summary-stats">
      <div class="summary-stat">
        <div class="summary-stat-number">${streakData.current}</div>
        <div class="summary-stat-label">Current Streak</div>
      </div>
      <div class="summary-stat">
        <div class="summary-stat-number">${streakData.longest}</div>
        <div class="summary-stat-label">Personal Best</div>
      </div>
      <div class="summary-stat">
        <div class="summary-stat-number">${consistencyPercent}%</div>
        <div class="summary-stat-label">Current vs Best</div>
      </div>
    </div>
    
    <div class="summary-insight">
      ${generateWeeklyInsight(streakData, pointsData)}
    </div>
  `;
  
  return summary;
}

/**
 * Generates personalized insights for weekly reflection
 * Focuses on growth and self-awareness rather than competition
 */
function generateWeeklyInsight(streak: WeeklyStreakData, points: PointsData): string {
  if (streak.current === 0) {
    return "🌱 Every journey begins with a single step. Your weekly reflection practice starts now!";
  }
  
  if (streak.current === 1) {
    return "🌟 You've started building a powerful habit. Weekly reflection creates lasting self-awareness.";
  }
  
  if (streak.current < 4) {
    return `💪 ${streak.current} weeks of consistency! You're building momentum in your self-awareness journey.`;
  }
  
  if (streak.current < 12) {
    return `🚀 ${streak.current} weeks shows real commitment! Your reflection practice is becoming a meaningful part of your growth.`;
  }
  
  if (streak.current < 26) {
    return `🏆 ${streak.current} weeks of dedication is truly impressive! You've developed a sustainable practice of self-reflection.`;
  }
  
  return `🌟 ${streak.current} weeks of consistent reflection! You're a master of self-awareness and personal growth.`;
}

/**
 * Handles the complete weekly reward flow in the UI
 * Orchestrates a calm, meaningful user experience
 */
export async function handleWeeklyRewardResponse(
  response: any, 
  streakContainer: HTMLElement
): Promise<void> {
  const { rewards, motivationalMessage } = response;
  
  // First, update the streak display with new weekly values
  const newStreakData: WeeklyStreakData = {
    current: rewards.newStreak,
    longest: Math.max(rewards.newStreak, parseInt(
      streakContainer.querySelector('.stat-item .stat-number')?.textContent || '0'
    )),
    weeksUntilNextMilestone: 0, // This would need to be provided by API
    nextMilestoneReward: 0,     // This would need to be provided by API
    hasEntryThisWeek: true,     // Just completed an entry
    currentWeekId: rewards.weekId
  };
  
  const newPointsData: PointsData = {
    total: rewards.totalPoints,
    recentHistory: [] // This would be populated from the API response
  };
  
  updateWeeklyStreakDisplay(streakContainer, newStreakData, newPointsData);
  
  // Then, show the weekly celebration with appropriate pacing
  const celebration = createWeeklyRewardCelebration(rewards, motivationalMessage);
  document.body.appendChild(celebration);
  
  // Add entrance animation with contemplative timing
  setTimeout(() => {
    celebration.classList.add('celebration-visible');
  }, 200);
}