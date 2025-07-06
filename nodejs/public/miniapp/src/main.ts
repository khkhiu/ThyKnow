// File: public/miniapp/src/main.ts
// Refactored main application with modern component system inspired by habit-pet-telegram-pal

import { initTelegramApp, provideHapticFeedback } from './components/telegram/telegramApp';
import { createPetDisplay } from './components/pet/PetDisplay';
import { createAchievementsGrid } from './components/achievements/AchievementsDisplay';
import { createStatsGrid } from './components/stats/StatsDisplay';
import { createCareActivities } from './components/care/CareDisplay';
import { showNotification, showError, hideError } from './components/ui/notifications';
import { API_ENDPOINTS, ELEMENT_IDS, FALLBACKS } from './config/constants';
import type { 
  TelegramWebApp, 
  PromptData, 
  JournalEntry, 
  UserData,
  PetState,
  Achievement,
  StatsData
} from './types/miniapp';

// Application State
interface AppState {
  currentTab: string;
  user: UserData | null;
  pet: PetState;
  currentPrompt: PromptData | null;
  userEntries: JournalEntry[];
  achievements: Achievement[];
  stats: StatsData | null;
  isLoading: boolean;
}

// Initialize application state
let appState: AppState = {
  currentTab: 'journal',
  user: null,
  pet: {
    character: '🧠',
    mood: 'Ready to reflect!',
    health: 85,
    happiness: 78,
    level: 1,
    streak: 0,
    points: 0
  },
  currentPrompt: null,
  userEntries: [],
  achievements: [],
  stats: null,
  isLoading: true
};

let currentUserId: number = 0;
let telegramApp: TelegramWebApp;

/**
 * Main application initialization
 */
async function initApp(): Promise<void> {
  try {
    console.log('🚀 Initializing ThyKnow Modern App...');
    
    // Initialize Telegram integration
    telegramApp = initTelegramApp();
    currentUserId = telegramApp.initDataUnsafe?.user?.id || 999999;
    console.log('📱 Telegram WebApp initialized for user:', currentUserId);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    await loadAppData();
    
    // Initialize UI components
    initializeComponents();
    
    // Show content
    hideLoading();
    
    console.log('✅ ThyKnow app initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    showError('Failed to initialize app. Please try again.');
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners(): void {
  // Tab navigation
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', handleTabSwitch);
  });
  
  // Submit response
  const submitButton = document.getElementById('submit-button');
  const responseField = document.getElementById('response-field') as HTMLTextAreaElement;
  
  if (submitButton && responseField) {
    submitButton.addEventListener('click', handleSubmitResponse);
    responseField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmitResponse();
      }
    });
  }
  
  // New prompt button
  const newPromptButton = document.getElementById('new-prompt-button');
  if (newPromptButton) {
    newPromptButton.addEventListener('click', loadNewPrompt);
  }
  
  // Retry button
  const retryButton = document.getElementById('retry-button');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      hideError();
      initApp();
    });
  }
}

/**
 * Handle tab switching with animations
 */
function handleTabSwitch(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const tabId = button.dataset.tab;
  
  if (!tabId || tabId === appState.currentTab) return;
  
  // Provide haptic feedback
  provideHapticFeedback(telegramApp, 'light');
  
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const targetContent = document.getElementById(`${tabId}-content`);
  if (targetContent) {
    targetContent.classList.add('active');
    appState.currentTab = tabId;
    
    // Load tab-specific data if needed
    loadTabData(tabId);
  }
}

/**
 * Load tab-specific data
 */
async function loadTabData(tabId: string): Promise<void> {
  try {
    switch (tabId) {
      case 'progress':
        if (!appState.stats) {
          await loadProgressData();
        }
        break;
      case 'achievements':
        if (appState.achievements.length === 0) {
          await loadAchievements();
        }
        break;
      case 'stats':
        await loadStatsData();
        break;
    }
  } catch (error) {
    console.error(`Error loading ${tabId} data:`, error);
  }
}

/**
 * Load all initial application data
 */
async function loadAppData(): Promise<void> {
  try {
    // Load data in parallel
    const [userData, promptData, historyData] = await Promise.all([
      fetchUserData(),
      fetchTodaysPrompt(),
      fetchUserHistory()
    ]);
    
    if (userData) {
      appState.user = userData;
      updateUserStats(userData);
    }
    
    if (promptData) {
      appState.currentPrompt = promptData;
      displayPrompt(promptData);
    }
    
    if (historyData) {
      appState.userEntries = historyData;
      updatePetFromEntries(historyData);
    }
    
  } catch (error) {
    console.error('Error loading app data:', error);
    // Use fallback data
    appState.currentPrompt = FALLBACKS.PROMPT;
    displayPrompt(FALLBACKS.PROMPT);
  }
}

/**
 * Initialize UI components
 */
function initializeComponents(): void {
  // Initialize pet display
  updatePetDisplay();
  
  // Initialize achievements (if on achievements tab)
  if (appState.currentTab === 'achievements') {
    updateAchievementsDisplay();
  }
  
  // Initialize care activities
  initializeCareActivities();
  
  // Update stats display
  updateStatsDisplay();
}

/**
 * Update pet display with current state
 */
function updatePetDisplay(): void {
  const container = document.getElementById('pet-display-container');
  if (!container) return;
  
  const petDisplay = createPetDisplay(appState.pet);
  container.innerHTML = '';
  container.appendChild(petDisplay);
}

/**
 * Update user stats in header
 */
function updateUserStats(userData: UserData): void {
  const streakElement = document.getElementById('user-streak');
  const pointsElement = document.getElementById('user-points');
  
  if (streakElement) {
    streakElement.textContent = userData.streak?.current?.toString() || '0';
  }
  
  if (pointsElement) {
    pointsElement.textContent = userData.points?.total?.toString() || '0';
  }
  
  // Update pet state based on user data
  appState.pet.streak = userData.streak?.current || 0;
  appState.pet.points = userData.points?.total || 0;
  appState.pet.level = Math.floor((userData.points?.total || 0) / 100) + 1;
}

/**
 * Display current prompt
 */
function displayPrompt(prompt: PromptData): void {
  const promptDisplay = document.getElementById('prompt-display');
  if (!promptDisplay) return;
  
  promptDisplay.innerHTML = `
    <div class="prompt-type">${prompt.type}</div>
    <div class="prompt-text">${prompt.text}</div>
    ${prompt.hint ? `<div class="prompt-hint">${prompt.hint}</div>` : ''}
  `;
}

/**
 * Handle response submission
 */
async function handleSubmitResponse(): Promise<void> {
  const responseField = document.getElementById('response-field') as HTMLTextAreaElement;
  const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
  
  if (!responseField || !appState.currentPrompt) return;
  
  const responseText = responseField.value.trim();
  if (!responseText) {
    showNotification('Please write a response before submitting.', 'warning');
    return;
  }
  
  try {
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    // Submit response
    const result = await submitResponse(responseText, appState.currentPrompt);
    
    if (result.success) {
      // Provide haptic feedback
      provideHapticFeedback(telegramApp, 'medium');
      
      // Show success notification
      showNotification('Reflection submitted successfully! 🌟', 'success');
      
      // Update app state
      if (result.points) {
        appState.pet.points += result.points;
        updateUserStats({ ...appState.user!, points: { total: appState.pet.points } } as UserData);
      }
      
      // Clear form
      responseField.value = '';
      
      // Update pet mood
      appState.pet.mood = getRandomCompletionMood();
      appState.pet.happiness = Math.min(100, appState.pet.happiness + 5);
      updatePetDisplay();
      
      // Load new prompt
      setTimeout(loadNewPrompt, 1500);
      
    } else {
      showNotification('Failed to submit response. Please try again.', 'error');
    }
    
  } catch (error) {
    console.error('Error submitting response:', error);
    showNotification('Failed to submit response. Please try again.', 'error');
  } finally {
    // Re-enable button
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Reflection';
  }
}

/**
 * Load a new prompt
 */
async function loadNewPrompt(): Promise<void> {
  try {
    const promptData = await fetchNewPrompt();
    if (promptData) {
      appState.currentPrompt = promptData;
      displayPrompt(promptData);
      
      // Provide haptic feedback
      provideHapticFeedback(telegramApp, 'light');
      
      showNotification('New reflection prompt loaded! ✨', 'info');
    }
  } catch (error) {
    console.error('Error loading new prompt:', error);
    showNotification('Failed to load new prompt. Please try again.', 'error');
  }
}

/**
 * Initialize care activities
 */
function initializeCareActivities(): void {
  const careContainer = document.getElementById('care-activities');
  if (!careContainer) return;
  
  const careActivities = createCareActivities(appState.pet, {
    onMeditate: handleMeditateActivity,
    onReflect: handleReflectActivity,
    onJournal: handleJournalActivity,
    onRest: handleRestActivity
  });
  
  careContainer.innerHTML = '';
  careContainer.appendChild(careActivities);
}

/**
 * Care activity handlers
 */
function handleMeditateActivity(): void {
  provideHapticFeedback(telegramApp, 'medium');
  appState.pet.happiness = Math.min(100, appState.pet.happiness + 10);
  appState.pet.mood = 'Feeling peaceful and centered 🧘‍♀️';
  updatePetDisplay();
  showNotification('Your mind feels clearer after meditation! 🧘‍♀️', 'success');
}

function handleReflectActivity(): void {
  provideHapticFeedback(telegramApp, 'medium');
  appState.pet.health = Math.min(100, appState.pet.health + 8);
  appState.pet.mood = 'Gaining deeper insights 💭';
  updatePetDisplay();
  showNotification('Reflection brings clarity and wisdom! 💭', 'success');
}

function handleJournalActivity(): void {
  provideHapticFeedback(telegramApp, 'medium');
  appState.pet.happiness = Math.min(100, appState.pet.happiness + 12);
  appState.pet.mood = 'Expressing thoughts freely ✍️';
  updatePetDisplay();
  showNotification('Free writing unlocks creativity! ✍️', 'success');
}

function handleRestActivity(): void {
  provideHapticFeedback(telegramApp, 'medium');
  appState.pet.health = Math.min(100, appState.pet.health + 15);
  appState.pet.mood = 'Feeling refreshed and renewed 😌';
  updatePetDisplay();
  showNotification('Rest is essential for growth! 😌', 'success');
}

/**
 * Update achievements display
 */
function updateAchievementsDisplay(): void {
  const achievementsGrid = document.getElementById('achievements-grid');
  if (!achievementsGrid) return;
  
  const achievements = createAchievementsGrid(appState.achievements, appState.pet);
  achievementsGrid.innerHTML = '';
  achievementsGrid.appendChild(achievements);
}

/**
 * Update stats display
 */
function updateStatsDisplay(): void {
  const statsContainer = document.getElementById('stats-overview');
  if (!statsContainer) return;
  
  const statsData = {
    totalReflections: appState.userEntries.length,
    currentStreak: appState.pet.streak,
    longestStreak: appState.pet.streak, // TODO: Get from API
    totalPoints: appState.pet.points,
    petLevel: appState.pet.level,
    averageResponseLength: calculateAverageResponseLength()
  };
  
  const statsGrid = createStatsGrid(statsData);
  statsContainer.innerHTML = '';
  statsContainer.appendChild(statsGrid);
}

/**
 * Update pet based on user entries
 */
function updatePetFromEntries(entries: JournalEntry[]): void {
  const recentEntries = entries.slice(-7); // Last 7 entries
  const completionRate = recentEntries.length / 7;
  
  // Update pet happiness based on consistency
  appState.pet.happiness = Math.round(20 + (completionRate * 80));
  appState.pet.health = Math.round(30 + (completionRate * 70));
  
  // Update mood based on recent activity
  if (recentEntries.length === 0) {
    appState.pet.mood = 'Waiting for your first reflection... 🤔';
  } else if (completionRate > 0.8) {
    appState.pet.mood = 'Thriving with consistent reflection! 🌟';
  } else if (completionRate > 0.5) {
    appState.pet.mood = 'Growing through thoughtful moments 🌱';
  } else {
    appState.pet.mood = 'Ready for more reflection time 💭';
  }
}

/**
 * Calculate average response length
 */
function calculateAverageResponseLength(): number {
  if (appState.userEntries.length === 0) return 0;
  
  const totalLength = appState.userEntries.reduce((sum, entry) => {
    return sum + (entry.response?.length || 0);
  }, 0);
  
  return Math.round(totalLength / appState.userEntries.length);
}

/**
 * Get random completion mood
 */
function getRandomCompletionMood(): string {
  const moods = [
    'Feeling accomplished! 🌟',
    'Growing through reflection 🌱',
    'Gaining new insights 💡',
    'Mindfully present 🧘‍♀️',
    'Thoughtfully evolving ✨',
    'Deeper understanding emerging 🔍',
    'Wisdom is blossoming 🌸'
  ];
  
  return moods[Math.floor(Math.random() * moods.length)];
}

/**
 * API Functions
 */
async function fetchUserData(): Promise<UserData | null> {
  try {
    const response = await fetch(API_ENDPOINTS.USER(currentUserId));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function fetchTodaysPrompt(): Promise<PromptData | null> {
  try {
    const response = await fetch(API_ENDPOINTS.TODAYS_PROMPT(currentUserId));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

async function fetchNewPrompt(): Promise<PromptData | null> {
  try {
    const response = await fetch(API_ENDPOINTS.NEW_PROMPT(currentUserId));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching new prompt:', error);
    return null;
  }
}

async function fetchUserHistory(): Promise<JournalEntry[]> {
  try {
    const response = await fetch(API_ENDPOINTS.HISTORY(currentUserId));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

async function submitResponse(response: string, prompt: PromptData): Promise<any> {
  try {
    const result = await fetch(API_ENDPOINTS.RESPONSES(currentUserId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: prompt.id,
        response: response,
        promptType: prompt.type
      })
    });
    
    if (!result.ok) throw new Error(`HTTP ${result.status}`);
    return await result.json();
    
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
}

async function loadProgressData(): Promise<void> {
  // TODO: Implement progress data loading
  console.log('Loading progress data...');
}

async function loadAchievements(): Promise<void> {
  // TODO: Implement achievements loading
  console.log('Loading achievements...');
}

async function loadStatsData(): Promise<void> {
  // TODO: Implement detailed stats loading
  console.log('Loading stats data...');
}

/**
 * Utility functions
 */
function hideLoading(): void {
  const loading = document.getElementById(ELEMENT_IDS.LOADING);
  const content = document.getElementById(ELEMENT_IDS.CONTENT);
  
  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'block';
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for potential external use
export { initApp, appState };