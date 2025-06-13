// public/miniapp/main.ts
// Main entry point for the ThyKnow mini-app

// Import necessary modules
import { TelegramWebApp, TelegramUser } from './types/miniapp';
import { initTelegramApp, setupBackButton } from './services/telegramApp';
import { updateTheme, toggleTheme } from './ui/miniappTheme';
import { getTodaysPrompt, getNewPrompt, submitPromptResponse } from './services/promptService';
import { getHistoryEntries } from './services/historyService';
import { showElement, hideElement } from './utils/elements';
import { showError } from './ui/notifications';
import { fetchConfig, fetchUserData } from './services/api';

/**
 * Main entry point - initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('ThyKnow mini-app initializing...');
  
  try {
    // Initialize Telegram WebApp
    const tg = initTelegramApp();
    
    // Expand the WebApp to full height
    tg.expand();
    
    // Set the theme
    updateTheme(tg);
    
    // Initialize app
    initApp(tg);
    
    // Handle theme toggle
    const themeToggleBtn = document.querySelector('.theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => toggleTheme());
    }
    
    // Handle submit response
    const submitButton = document.getElementById('submit-response');
    if (submitButton) {
      submitButton.addEventListener('click', () => handleResponseSubmit(tg));
    }
    
    // Handle new prompt button
    const newPromptButton = document.getElementById('new-prompt-button');
    if (newPromptButton) {
      newPromptButton.addEventListener('click', () => handleNewPrompt(tg));
    }
    
    // Handle retry button
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => initApp(tg));
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    showInitializationError();
  }
});

/**
 * Initialize the application
 * @param tg - Telegram WebApp instance
 */
async function initApp(tg: TelegramWebApp): Promise<void> {
  try {
    // Set loading state
    showElement('loading');
    hideElement('content');
    hideElement('error');
    
    // Get Telegram user
    const telegramUser = getTelegramUser(tg);
    
    if (!telegramUser || !telegramUser.id) {
      throw new Error('No user data available from Telegram');
    }
    
    console.log('Telegram user ID:', telegramUser.id);
    
    // Get app config
    const config = await fetchConfig();
    console.log('App config loaded:', config);
    
    // Get user data
    const userData = await fetchUserData(telegramUser.id);
    console.log('User data loaded:', userData);
    
    // Check for timestamp parameter in URL - this indicates we should fetch a new prompt
    const urlParams = new URLSearchParams(window.location.search);
    const timestamp = urlParams.get('t');
    
    let promptData;
    if (timestamp) {
      // If timestamp parameter exists, force a new prompt instead of getting the current one
      console.log('Timestamp found in URL, fetching new prompt');
      promptData = await getNewPrompt(telegramUser.id, tg);
    } else {
      // Otherwise get today's prompt as usual
      promptData = await getTodaysPrompt(telegramUser.id);
    }
    
    console.log('Prompt loaded:', promptData);
    
    // Get history entries
    await getHistoryEntries(telegramUser.id);
    
    // Show content
    hideElement('loading');
    showElement('content');
    
    // Setup back button handler
    setupBackButton(tg, () => handleBackButton(tg));
    
    // Notify Telegram that the Mini App is ready
    tg.ready();
  } catch (error) {
    console.error('App initialization error:', error);
    showError('Failed to load the app. Please try again.');
  }
}

/**
 * Get user data from Telegram WebApp
 * @param tg - Telegram WebApp instance
 * @returns User data or null if unavailable
 */
function getTelegramUser(tg: TelegramWebApp): TelegramUser | null {
  return tg.initDataUnsafe?.user || null;
}

/**
 * Handle response submission
 * @param tg - Telegram WebApp instance
 */
async function handleResponseSubmit(tg: TelegramWebApp): Promise<void> {
  try {
    const telegramUser = getTelegramUser(tg);
    
    if (!telegramUser || !telegramUser.id) {
      throw new Error('User data not available');
    }
    
    // Submit the response and handle UI updates
    await submitPromptResponse(telegramUser.id, tg);
    
    // Refresh history
    await getHistoryEntries(telegramUser.id);
  } catch (error) {
    console.error('Error submitting response:', error);
  }
}

/**
 * Handle new prompt request
 * @param tg - Telegram WebApp instance
 */
async function handleNewPrompt(tg: TelegramWebApp): Promise<void> {
  try {
    const telegramUser = getTelegramUser(tg);
    
    if (!telegramUser || !telegramUser.id) {
      throw new Error('User data not available');
    }
    
    // Get a new prompt and update the UI
    await getNewPrompt(telegramUser.id, tg);
  } catch (error) {
    console.error('Error getting new prompt:', error);
  }
}

/**
 * Handle back button press
 * @param tg - Telegram WebApp instance
 */
function handleBackButton(tg: TelegramWebApp): void {
  // If we have internal navigation, handle it here
  // For now, just close the app
  tg.close();
}

/**
 * Display initialization error
 */
function showInitializationError(): void {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.style.display = 'block';
  }
  
  const errorMessage = document.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = 'Failed to initialize ThyKnow. Please try again later.';
  }
}