// main.ts - Refactored main app with tab navigation
// Integrates existing journal and stats functionality into a tabbed interface

import { TelegramWebApp } from './types/miniapp';

// Import existing components and functionality
// Note: These imports assume the existing TypeScript modules are available
// You may need to adjust paths based on your actual file structure

// Types and interfaces
interface AppState {
  currentTab: string;
  isLoading: boolean;
  petData: any;
  journalData: any;
  statsData: any;
}

interface TabConfig {
  id: string;
  name: string;
  icon: string;
  loadFunction?: () => Promise<void>;
}

// Global app state
let appState: AppState = {
  currentTab: 'journal',
  isLoading: true,
  petData: null,
  journalData: null,
  statsData: null
};

// Tab configurations
const TABS: TabConfig[] = [
  { 
    id: 'journal', 
    name: 'Journal', 
    icon: 'fas fa-book-open',
    loadFunction: loadJournalContent
  },
  { 
    id: 'care', 
    name: 'Care', 
    icon: 'fas fa-heart'
  },
  { 
    id: 'shop', 
    name: 'Boutique', 
    icon: 'fas fa-shopping-bag'
  },
  { 
    id: 'achievements', 
    name: 'Awards', 
    icon: 'fas fa-trophy'
  },
  { 
    id: 'stats', 
    name: 'Stats', 
    icon: 'fas fa-chart-line',
    loadFunction: loadStatsContent
  }
];

// Element selectors
const ELEMENTS = {
  LOADING: '#loading',
  APP: '#app',
  TAB_TRIGGERS: '.tab-trigger',
  TAB_CONTENTS: '.tab-content',
  PET_DISPLAY: '#pet-display',
  JOURNAL_CONTAINER: '#journal-container',
  STATS_CONTAINER: '#stats-container'
} as const;

/**
 * Initialize the Telegram WebApp
 */
function initTelegramApp(): TelegramWebApp {
  const tg = window.Telegram.WebApp;
  
  try {
    tg.expand();
    tg.ready();
    
    // Safely set header and background colors (these methods might not be in all versions)
    if ('setHeaderColor' in tg && typeof tg.setHeaderColor === 'function') {
      (tg as any).setHeaderColor('#3B82F6');
    }
    if ('setBackgroundColor' in tg && typeof tg.setBackgroundColor === 'function') {
      (tg as any).setBackgroundColor('#F8FAFC');
    }
    
    console.log('Telegram WebApp initialized successfully');
    return tg;
  } catch (error) {
    console.error('Error initializing Telegram WebApp:', error);
    return tg;
  }
}

/**
 * Main app initialization
 */
async function initApp(): Promise<void> {
  try {
    console.log('Initializing Dino Journal app...');
    
    // Initialize Telegram
    const tg = initTelegramApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    await loadInitialData();
    
    // Set up pet display
    await setupPetDisplay();
    
    // Initialize the default tab
    await switchTab('journal');
    
    // Hide loading and show app
    hideLoading();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    showError('Failed to initialize app. Please refresh and try again.');
  }
}

/**
 * Set up event listeners for tab navigation and interactions
 */
function setupEventListeners(): void {
  // Tab click handlers
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const tabTrigger = target.closest('.tab-trigger') as HTMLElement;
    
    if (tabTrigger) {
      const tabId = tabTrigger.getAttribute('data-tab');
      if (tabId) {
        switchTab(tabId);
      }
    }
  });
  
  // Handle Telegram back button
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.onEvent('backButtonClicked', () => {
      // Handle back navigation if needed
      console.log('Back button clicked');
    });
  }
  
  console.log('Event listeners set up');
}

/**
 * Switch between tabs
 */
async function switchTab(tabId: string): Promise<void> {
  try {
    console.log(`Switching to tab: ${tabId}`);
    
    // Update active tab trigger
    document.querySelectorAll(ELEMENTS.TAB_TRIGGERS).forEach(trigger => {
      trigger.classList.remove('active');
      if (trigger.getAttribute('data-tab') === tabId) {
        trigger.classList.add('active');
      }
    });
    
    // Update active tab content
    document.querySelectorAll(ELEMENTS.TAB_CONTENTS).forEach(content => {
      content.classList.remove('active');
      if (content.id === `tab-${tabId}`) {
        content.classList.add('active');
      }
    });
    
    // Load tab-specific content
    const tab = TABS.find(t => t.id === tabId);
    if (tab?.loadFunction) {
      await tab.loadFunction();
    }
    
    // Update app state
    appState.currentTab = tabId;
    
    console.log(`Switched to tab: ${tabId}`);
  } catch (error) {
    console.error(`Error switching to tab ${tabId}:`, error);
  }
}

/**
 * Load initial app data
 */
async function loadInitialData(): Promise<void> {
  try {
    console.log('Loading initial data...');
    
    // Load basic app configuration
    const configResponse = await fetch('/miniapp/config');
    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log('App config loaded:', config);
    }
    
    // Load user data (if needed)
    // This would typically include user preferences, settings, etc.
    
    console.log('Initial data loaded');
  } catch (error) {
    console.error('Error loading initial data:', error);
    // Don't throw here - app can still function without config
  }
}

/**
 * Set up the pet display section
 */
async function setupPetDisplay(): Promise<void> {
  try {
    const petDisplayContainer = document.querySelector(ELEMENTS.PET_DISPLAY);
    if (!petDisplayContainer) return;
    
    // Create a simplified pet display for the header
    petDisplayContainer.innerHTML = `
      <div class="pet-header-display">
        <div class="pet-stats">
          <div class="stat-item">
            <div class="stat-icon">❤️</div>
            <div class="stat-value">85</div>
            <div class="stat-label">Health</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">😊</div>
            <div class="stat-value">92</div>
            <div class="stat-label">Happy</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">7</div>
            <div class="stat-label">Level</div>
          </div>
        </div>
        <div class="pet-avatar">
          <div class="dino-character">🦕</div>
          <div class="pet-name">Your Dino Friend</div>
        </div>
      </div>
    `;
    
    // Add pet display styles
    const style = document.createElement('style');
    style.textContent = `
      .pet-header-display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      
      .pet-stats {
        display: flex;
        gap: 12px;
        flex: 1;
      }
      
      .stat-item {
        text-align: center;
        flex: 1;
      }
      
      .stat-icon {
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 18px;
        font-weight: 700;
        color: white;
        margin-bottom: 2px;
      }
      
      .stat-label {
        font-size: 12px;
        opacity: 0.9;
        font-weight: 500;
      }
      
      .pet-avatar {
        text-align: center;
      }
      
      .dino-character {
        font-size: 32px;
        margin-bottom: 4px;
        animation: petBounce 2s infinite ease-in-out;
      }
      
      @keyframes petBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      
      .pet-name {
        font-size: 12px;
        font-weight: 600;
        opacity: 0.9;
      }
      
      @media (max-width: 480px) {
        .pet-header-display {
          flex-direction: column;
          gap: 12px;
        }
        
        .pet-stats {
          justify-content: center;
        }
        
        .stat-item {
          min-width: 60px;
        }
      }
    `;
    document.head.appendChild(style);
    
    console.log('Pet display set up');
  } catch (error) {
    console.error('Error setting up pet display:', error);
  }
}

/**
 * Load journal content (integrates existing index.html functionality)
 */
async function loadJournalContent(): Promise<void> {
  try {
    const container = document.querySelector(ELEMENTS.JOURNAL_CONTAINER);
    if (!container) return;
    
    console.log('Loading journal content...');
    
    // Show loading state
    container.innerHTML = '<div class="loading-state">Loading journal...</div>';
    
    // This would integrate with your existing journal functionality
    // For now, providing a basic structure that you can enhance
    container.innerHTML = `
      <div class="journal-form">
        <h3>Weekly Reflection</h3>
        <p class="journal-prompt">Take a moment to reflect on your week. What insights have you gained about yourself?</p>
        
        <div class="reflection-input">
          <label for="reflection-text">Your Reflection:</label>
          <textarea 
            id="reflection-text" 
            placeholder="Share your thoughts, feelings, and insights from this week..."
            rows="6"
          ></textarea>
        </div>
        
        <div class="journal-actions">
          <button id="save-reflection" class="primary-button">
            <i class="fas fa-save"></i>
            Save Reflection
          </button>
        </div>
      </div>
      
      <div class="recent-entries">
        <h3>Recent Entries</h3>
        <div id="entry-list">
          <!-- Recent entries will be loaded here -->
        </div>
      </div>
    `;
    
    // Add journal-specific styles
    addJournalStyles();
    
    // Set up journal event listeners
    setupJournalEventListeners();
    
    console.log('Journal content loaded');
  } catch (error) {
    console.error('Error loading journal content:', error);
    const container = document.querySelector(ELEMENTS.JOURNAL_CONTAINER);
    if (container) {
      container.innerHTML = '<div class="error-state">Error loading journal. Please try again.</div>';
    }
  }
}

/**
 * Load stats content (integrates existing streak.html functionality)
 */
async function loadStatsContent(): Promise<void> {
  try {
    const container = document.querySelector(ELEMENTS.STATS_CONTAINER);
    if (!container) return;
    
    console.log('Loading stats content...');
    
    // Show loading state
    container.innerHTML = '<div class="loading-state">Loading statistics...</div>';
    
    // This would integrate with your existing streak functionality
    // For now, providing a basic structure that you can enhance
    container.innerHTML = `
      <div class="stats-overview">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-number">7</div>
            <div class="stat-label">Week Streak</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-number">23</div>
            <div class="stat-label">Total Entries</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">1,240</div>
            <div class="stat-label">Points Earned</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-number">5</div>
            <div class="stat-label">Milestones</div>
          </div>
        </div>
      </div>
      
      <div class="progress-section">
        <h3>This Week's Progress</h3>
        <div class="weekly-progress">
          <div class="progress-item">
            <span>Weekly Entry</span>
            <div class="progress-status completed">✅ Completed</div>
          </div>
        </div>
      </div>
    `;
    
    // Add stats-specific styles
    addStatsStyles();
    
    console.log('Stats content loaded');
  } catch (error) {
    console.error('Error loading stats content:', error);
    const container = document.querySelector(ELEMENTS.STATS_CONTAINER);
    if (container) {
      container.innerHTML = '<div class="error-state">Error loading statistics. Please try again.</div>';
    }
  }
}

/**
 * Add journal-specific styles
 */
function addJournalStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    .journal-form {
      background: rgba(16, 185, 129, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid rgba(16, 185, 129, 0.1);
    }
    
    .journal-form h3 {
      color: #065F46;
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .journal-prompt {
      color: #6B7280;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }
    
    .reflection-input label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
    }
    
    .reflection-input textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
      transition: border-color 0.2s;
    }
    
    .reflection-input textarea:focus {
      outline: none;
      border-color: #10B981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .journal-actions {
      margin-top: 16px;
    }
    
    .primary-button {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .primary-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .recent-entries {
      margin-top: 24px;
    }
    
    .recent-entries h3 {
      color: #374151;
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .loading-state, .error-state {
      text-align: center;
      padding: 40px 20px;
      color: #6B7280;
      font-style: italic;
    }
    
    .error-state {
      color: #DC2626;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Add stats-specific styles
 */
function addStatsStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      border: 1px solid rgba(59, 130, 246, 0.1);
      transition: transform 0.2s;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
    }
    
    .stat-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #1E40AF;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #6B7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .progress-section h3 {
      color: #374151;
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .progress-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #F9FAFB;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    
    .progress-status.completed {
      color: #059669;
      font-weight: 600;
    }
    
    @media (max-width: 480px) {
      .stats-cards {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Set up journal-specific event listeners
 */
function setupJournalEventListeners(): void {
  const saveButton = document.getElementById('save-reflection');
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      const textarea = document.getElementById('reflection-text') as HTMLTextAreaElement;
      if (textarea && textarea.value.trim()) {
        // Here you would integrate with your existing save functionality
        console.log('Saving reflection:', textarea.value);
        
        // Show success feedback
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
          saveButton.innerHTML = '<i class="fas fa-save"></i> Save Reflection';
        }, 2000);
      }
    });
  }
}

/**
 * Hide loading screen and show app
 */
function hideLoading(): void {
  const loading = document.querySelector(ELEMENTS.LOADING) as HTMLElement;
  const app = document.querySelector(ELEMENTS.APP) as HTMLElement;
  
  if (loading) loading.style.display = 'none';
  if (app) app.style.display = 'block';
  
  appState.isLoading = false;
}

/**
 * Show error message
 */
function showError(message: string): void {
  const app = document.querySelector(ELEMENTS.APP);
  if (app) {
    app.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="retry-button">
          <i class="fas fa-refresh"></i>
          Try Again
        </button>
      </div>
    `;
  }
  hideLoading();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions for potential external use
export {
  initApp,
  switchTab,
  loadJournalContent,
  loadStatsContent
};