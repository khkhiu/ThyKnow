// File: public/miniapp/src/streak.ts
// Weekly streak page functionality for ThyKnow miniapp - FIXED VERSION

import { TelegramWebApp, ApiEndpoints, ElementIds } from './types/miniapp';
import { WeeklyStreakData, PointsData, createWeeklyStreakDisplay } from './components/streak/WeeklyStreakDisplay';
// Import the existing Telegram services
import { 
  initTelegramApp, 
  getTelegramUser, 
  setupBackButton, 
  provideHapticFeedback, 
  notifyAppReady 
} from './services/telegramApp';
import { updateTheme, setupThemeListener } from './ui/miniappTheme';
import { showElement, hideElement } from './utils/elements';
import { showError } from './ui/notifications';

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
 * Main entry point - initialize the streak page
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeStreakPage();
});

/**
 * Initialize the streak page using the same pattern as main.ts
 */
function initializeStreakPage(): void {
  console.log('Initializing streak page...');

  // Initialize Telegram WebApp using the existing service (CRITICAL FIX)
  telegramWebApp = initTelegramApp();
  
  // Set the theme
  updateTheme(telegramWebApp);
  
  // Get Telegram user
  const telegramUser = getTelegramUser(telegramWebApp);
  
  if (telegramUser?.id) {
    currentUserId = telegramUser.id.toString();
    console.log('User ID:', currentUserId);
    
    // Initialize the app
    initStreakApp();
  } else {
    console.error('No user data available from Telegram');
    showError('Unable to load user data from Telegram');
  }

  // Set up event listeners
  setupEventListeners();
  
  // Set up theme change listener
  setupThemeListener(telegramWebApp);
  
  // Setup back button handler
  setupBackButton(telegramWebApp, () => handleBackButton());
  
  // Notify Telegram that the Mini App is ready
  notifyAppReady(telegramWebApp);
}

/**
 * Initialize the streak app
 */
async function initStreakApp(): Promise<void> {
  try {
    // Set loading state
    showLoading();
    
    // Load streak data
    await loadStreakData();
    
    // Show content
    showContent();
  } catch (error) {
    console.error('Error initializing streak app:', error);
    showError('Failed to load the streak app. Please try again.');
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners(): void {
  const retryButton = document.getElementById(ELEMENTS.RETRY_BUTTON);
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      hideError();
      initStreakApp();
    });
  }
}

/**
 * Load all streak data
 */
async function loadStreakData(): Promise<void> {
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
  } catch (error) {
    console.error('Error loading streak data:', error);
    throw error; // Re-throw to be handled by initStreakApp
  }
}

/**
 * Fetch user's streak data
 * Note: This now automatically includes Telegram auth headers thanks to initTelegramApp()
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
        <p>No recent activity yet. Complete your first weekly reflection to get started!</p>
      </div>
    `;
    return;
  }

  const historyHTML = pointsData.recentHistory
    .slice(0, 10) // Show last 10 entries
    .map(entry => `
      <div class="history-item">
        <div class="history-date">${entry.date}</div>
        <div class="history-reason">${entry.reason}</div>
        <div class="history-points">+${entry.points}</div>
      </div>
    `).join('');

  container.innerHTML = `
    <div class="points-summary">
      <h3>Recent Activity</h3>
      <div class="total-points">Total: ${pointsData.total} points</div>
    </div>
    <div class="history-list">
      ${historyHTML}
    </div>
  `;
}

/**
 * Populate milestones section
 */
function populateMilestones(milestones: Record<string, string>): void {
  const container = document.getElementById(ELEMENTS.MILESTONES_GRID);
  if (!container) return;

  const milestonesHTML = Object.entries(milestones)
    .map(([weeks, description]) => `
      <div class="milestone-card">
        <div class="milestone-weeks">${weeks} weeks</div>
        <div class="milestone-description">${description}</div>
      </div>
    `).join('');

  container.innerHTML = `
    <h3>Milestone Achievements</h3>
    <div class="milestones-grid">
      ${milestonesHTML}
    </div>
  `;
}

/**
 * Show loading state
 */
function showLoading(): void {
  showElement(ELEMENTS.LOADING);
  hideElement(ELEMENTS.CONTENT);
  hideElement(ELEMENTS.ERROR);
}

/**
 * Show content
 */
function showContent(): void {
  hideElement(ELEMENTS.LOADING);
  showElement(ELEMENTS.CONTENT);
  hideElement(ELEMENTS.ERROR);
}

/**
 * Hide error
 */
function hideError(): void {
  hideElement(ELEMENTS.ERROR);
}

/**
 * Handle back button press
 */
function handleBackButton(): void {
  telegramWebApp.close();
}