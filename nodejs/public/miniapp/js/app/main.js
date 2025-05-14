// js/app/main.js - Main entry point

import { ELEMENTS, TIMING } from './config.js';
import { 
  initTelegramApp, 
  getTelegramUser, 
  setupBackButton, 
  provideHapticFeedback, 
  notifyAppReady 
} from './services/telegramApp.js';
import { updateTheme, setupThemeListener, toggleTheme } from './ui/theme.js';
import { showElement, hideElement } from './utils/elements.js';
import { showError } from './ui/notifications.js';
import { fetchConfig, fetchUserData } from './api.js';
import { getTodaysPrompt, getNewPrompt, submitPromptResponse } from './services/promptService.js';
import { getHistoryEntries } from './services/historyService.js';


/**
 * Main entry point - initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
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
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  
  // Handle submit response
  const submitButton = document.getElementById(ELEMENTS.SUBMIT_BUTTON);
  if (submitButton) {
    submitButton.addEventListener('click', () => handleResponseSubmit(tg));
  }
  
  // Handle new prompt button
  const newPromptButton = document.getElementById(ELEMENTS.NEW_PROMPT_BUTTON);
  if (newPromptButton) {
    newPromptButton.addEventListener('click', () => handleNewPrompt(tg));
  }
  
  // Handle retry button
  const retryButton = document.getElementById(ELEMENTS.RETRY_BUTTON);
  if (retryButton) {
    retryButton.addEventListener('click', () => initApp(tg));
  }
  
  // Set up theme change listener
  setupThemeListener(tg);
});

/**
 * Initialize the application
 * @param {Object} tg - Telegram WebApp instance
 */
async function initApp(tg) {
  try {
    // Set loading state
    showElement(ELEMENTS.LOADING);
    hideElement(ELEMENTS.CONTENT);
    hideElement(ELEMENTS.ERROR);
    
    // Get Telegram user
    const telegramUser = getTelegramUser(tg);
    
    if (!telegramUser || !telegramUser.id) {
      throw new Error('No user data available from Telegram');
    }
    
    // Get app config
    const config = await fetchConfig();
    
    // Get user data
    const userData = await fetchUserData(telegramUser.id);
    
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
    
    // Get history entries
    await getHistoryEntries(telegramUser.id);
    
    // Show content
    hideElement(ELEMENTS.LOADING);
    showElement(ELEMENTS.CONTENT);
    
    // Setup back button handler
    setupBackButton(tg, () => handleBackButton(tg));
    
    // Notify Telegram that the Mini App is ready
    notifyAppReady(tg);
  } catch (error) {
    console.error('App initialization error:', error);
    showError('Failed to load the app. Please try again.');
  }
}

/**
 * Handle response submission
 * @param {Object} tg - Telegram WebApp instance
 */
async function handleResponseSubmit(tg) {
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
 * @param {Object} tg - Telegram WebApp instance
 */
async function handleNewPrompt(tg) {
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
 * @param {Object} tg - Telegram WebApp instance
 */
function handleBackButton(tg) {
  // If we have internal navigation, handle it here
  // For now, just close the app
  tg.close();
}