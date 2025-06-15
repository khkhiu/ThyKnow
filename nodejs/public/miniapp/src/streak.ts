// File: public/miniapp/src/streak.ts
// Weekly streak page functionality for ThyKnow miniapp

import { TelegramWebApp, ApiEndpoints, ElementIds } from './types/miniapp';
import { WeeklyStreakData, PointsData, createWeeklyStreakDisplay } from './components/streak/WeeklyStreakDisplay';

// API configuration
const API_BASE = '/api/miniapp';
const API_ENDPOINTS = {
  STREAK: (userId: string) => `${API_BASE}/streak/${userId}`,
  MILESTONES: `${API_BASE}/milestones`
};

// Element IDs
const ELEMENTS = {
  LOADING: 'loading',
  CONTENT: 'content',
  ERROR: 'error',
  RETRY_BUTTON: 'retry-button',
  USER_STREAK: 'user-streak-container',
  WEEKLY_STATUS: 'weekly-status',
  MILESTONE_INFO: 'milestone-info',
  POINTS_HISTORY: 'points-history',
  MILESTONES_GRID: 'milestones-grid',
  NOTIFICATION_CONTAINER: 'notification-container'
};

// Global state
let telegramWebApp: TelegramWebApp;
let currentUserId: string;

// Interface definitions
interface StreakApiResponse {
  streak: WeeklyStreakData;
  points: PointsData;
  milestones: Record<string, string>;
}


/**
 * Initialize the streak page
 */
function initializeStreakPage(): void {
  console.log('Initializing streak page...');

  // Initialize Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    telegramWebApp = window.Telegram.WebApp;
    telegramWebApp.ready();
    telegramWebApp.expand();

    // Get user ID from Telegram
    const user = telegramWebApp.initDataUnsafe?.user;
    if (user?.id) {
      currentUserId = user.id.toString();
      console.log('User ID:', currentUserId);
      loadStreakData();
    } else {
      console.error('No user data available from Telegram');
      showError('Unable to load user data from Telegram');
    }
  } else {
    // Fallback for development/testing
    console.warn('Telegram WebApp not available, using fallback');
    currentUserId = 'demo_user';
    loadStreakData();
  }

  // Set up event listeners
  setupEventListeners();
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  const retryButton = document.getElementById(ELEMENTS.RETRY_BUTTON);
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      hideError();
      loadStreakData();
    });
  }
}

/**
 * Load all streak data
 */
async function loadStreakData(): Promise<void> {
  showLoading();
  
  try {
    // Load data in parallel
    const [streakData] = await Promise.all([
      fetchStreakData(),
    ]);

    // Populate the page
    if (streakData) {
      populateStreakSection(streakData);
      populateProgressSection(streakData);
      populatePointsHistory(streakData.points);
      populateMilestones(streakData.milestones);
    }

    showContent();
  } catch (error) {
    console.error('Error loading streak data:', error);
    showError('Failed to load streak data. Please try again.');
  }
}

/**
 * Fetch user's streak data
 */
async function fetchStreakData(): Promise<StreakApiResponse | null> {
  try {
    const response = await fetch(API_ENDPOINTS.STREAK(currentUserId));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return null;
  }
}

/**
 * Populate the main streak section
 */
function populateStreakSection(data: StreakApiResponse): void {
  const container = document.getElementById(ELEMENTS.USER_STREAK);
  if (!container) return;

  // Create the main streak display
  const streakDisplay = createWeeklyStreakDisplay(data.streak, data.points);
  container.innerHTML = '';
  container.appendChild(streakDisplay);
}

/**
 * Populate the progress section
 */
function populateProgressSection(data: StreakApiResponse): void {
  const weeklyStatus = document.getElementById(ELEMENTS.WEEKLY_STATUS);
  const milestoneInfo = document.getElementById(ELEMENTS.MILESTONE_INFO);

  if (weeklyStatus) {
    weeklyStatus.innerHTML = `
      <div class="status-item">
        <div class="status-icon">${data.streak.hasEntryThisWeek ? '✅' : '📅'}</div>
        <div class="status-text">
          <h4>${data.streak.hasEntryThisWeek ? 'Week Complete!' : 'Awaiting Entry'}</h4>
          <p>${data.streak.hasEntryThisWeek 
            ? 'You can add more reflections for bonus points' 
            : 'Complete your weekly reflection to continue your streak'}</p>
        </div>
      </div>
      <div class="week-id">Week ${data.streak.currentWeekId}</div>
    `;
  }

  if (milestoneInfo) {
    if (data.streak.weeksUntilNextMilestone > 0) {
      milestoneInfo.innerHTML = `
        <div class="milestone-progress">
          <div class="milestone-weeks">${data.streak.weeksUntilNextMilestone}</div>
          <div class="milestone-label">weeks to go</div>
          <div class="milestone-reward">+${data.streak.nextMilestoneReward} points</div>
        </div>
      `;
    } else {
      milestoneInfo.innerHTML = `
        <div class="milestone-completed">
          <i class="fas fa-trophy"></i>
          <p>All milestones achieved!</p>
        </div>
      `;
    }
  }
}

/**
 * Populate points history
 */
function populatePointsHistory(pointsData: PointsData): void {
  const container = document.getElementById(ELEMENTS.POINTS_HISTORY);
  if (!container) return;

  if (pointsData.recentHistory.length === 0) {
    container.innerHTML = `
      <div class="empty-history">
        <i class="fas fa-calendar-alt"></i>
        <p>No recent activity yet. Start your weekly reflection journey!</p>
      </div>
    `;
    return;
  }

  const historyHtml = pointsData.recentHistory
    .slice(0, 10) // Show last 10 entries
    .map(entry => `
      <div class="history-item">
        <div class="history-icon">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="history-content">
          <div class="history-points">+${entry.points} points</div>
          <div class="history-reason">${entry.reason}</div>
          <div class="history-date">${new Date(entry.date).toLocaleDateString()}</div>
        </div>
        <div class="history-week">Week ${entry.weekId}</div>
      </div>
    `).join('');

  container.innerHTML = `
    <div class="history-header">
      <h3>Recent Points Earned</h3>
      <div class="total-points">${pointsData.total.toLocaleString()} total</div>
    </div>
    <div class="history-list">
      ${historyHtml}
    </div>
  `;
}

/**
 * Populate milestones grid
 */
function populateMilestones(milestones: Record<string, string>): void {
  const container = document.getElementById(ELEMENTS.MILESTONES_GRID);
  if (!container) return;

  const milestonesHtml = Object.entries(milestones)
    .map(([weeks, title]) => `
      <div class="milestone-card">
        <div class="milestone-weeks">${weeks} weeks</div>
        <div class="milestone-title">${title}</div>
        <div class="milestone-icon">
          ${parseInt(weeks) <= 4 ? '🌱' : 
            parseInt(weeks) <= 12 ? '🌿' : 
            parseInt(weeks) <= 26 ? '🌳' : 
            parseInt(weeks) <= 52 ? '🏆' : '👑'}
        </div>
      </div>
    `).join('');

  container.innerHTML = milestonesHtml;
}

/**
 * Show loading state
 */
function showLoading(): void {
  const loading = document.getElementById(ELEMENTS.LOADING);
  const content = document.getElementById(ELEMENTS.CONTENT);
  const error = document.getElementById(ELEMENTS.ERROR);

  if (loading) loading.style.display = 'flex';
  if (content) content.style.display = 'none';
  if (error) error.style.display = 'none';
}

/**
 * Show main content
 */
function showContent(): void {
  const loading = document.getElementById(ELEMENTS.LOADING);
  const content = document.getElementById(ELEMENTS.CONTENT);
  const error = document.getElementById(ELEMENTS.ERROR);

  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'block';
  if (error) error.style.display = 'none';
}

/**
 * Show error state
 */
function showError(message: string): void {
  const loading = document.getElementById(ELEMENTS.LOADING);
  const content = document.getElementById(ELEMENTS.CONTENT);
  const error = document.getElementById(ELEMENTS.ERROR);
  const errorMessage = error?.querySelector('.error-message');

  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'none';
  if (error) error.style.display = 'flex';
  if (errorMessage) errorMessage.textContent = message;
}

/**
 * Hide error state
 */
function hideError(): void {
  const error = document.getElementById(ELEMENTS.ERROR);
  if (error) error.style.display = 'none';
}

/**
 * Show notification
 */
function showNotification(message: string, type: 'success' | 'error' = 'success'): void {
  const container = document.getElementById(ELEMENTS.NOTIFICATION_CONTAINER);
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeStreakPage);

// Export for potential external use
export { initializeStreakPage, showNotification };