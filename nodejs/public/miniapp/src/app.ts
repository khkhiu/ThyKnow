// public/miniapp/src/app.ts
/**
 * ThyKnow Mini App - Main Entry Point
 */
import { initializeTelegram, setupBackButton, hapticFeedback } from './utils/telegramUtils';
import { showElement, hideElement, showError, showNotification } from './utils/uiUtils';
import { fetchConfig, fetchUserData, fetchTodaysPrompt, fetchNewPromptFromApi, fetchHistoryEntries } from './services/apiService';
import { updatePrompt, handleSubmitResponse } from './components/prompt';
import { updateHistory } from './components/history';
import { initDateFiltering } from './components/filter';
import { Prompt } from './types';

// Global state variables
let isInitialized = false;

/**
 * Initialize the app
 */
async function initApp(): Promise<void> {
  if (isInitialized) return;
  
  try {
    // Set loading state
    showElement('loading');
    hideElement('content');
    hideElement('error');
    
    // Initialize Telegram WebApp
    initializeTelegram();
    
    // Get app config
    const config = await fetchConfig();
    console.log('App config loaded:', config);
    
    // Get user data (if available)
    const userData = await fetchUserData();
    console.log('User data loaded:', userData);
    
    // Check for timestamp parameter in URL - this indicates we should fetch a new prompt
    const urlParams = new URLSearchParams(window.location.search);
    const timestamp = urlParams.get('t');
    
    let promptData: Prompt;
    if (timestamp) {
      // If timestamp parameter exists, force a new prompt instead of getting the current one
      console.log('Timestamp found in URL, fetching new prompt');
      promptData = await fetchNewPromptDirectly();
    } else {
      // Otherwise get today's prompt as usual
      promptData = await fetchTodaysPrompt();
    }
    
    // Get history entries
    const historyData = await fetchHistoryEntries();
    
    // Update UI with data
    updatePrompt(promptData);
    updateHistory(historyData);
    
    // Initialize date filtering
    initDateFiltering();
    
    // Show content
    hideElement('loading');
    showElement('content');
    
    // Setup back button handler
    setupBackButton(handleBackButton);
    
    // Get Telegram WebApp
    const tg = window.Telegram.WebApp;
    
    // Notify Telegram that the Mini App is ready
    tg.ready();
    
    isInitialized = true;
  } catch (error) {
    console.error('App initialization error:', error);
    showError('Failed to load the app. Please try again.');
  }
}

/**
 * Handle back button click
 */
function handleBackButton(): void {
  // If we have internal navigation, handle it here
  // For now, just close the app
  window.Telegram.WebApp.close();
}

/**
 * Fetch a new prompt directly (when URL parameter is present)
 */
async function fetchNewPromptDirectly(): Promise<Prompt> {
  try {
    return await fetchNewPromptFromApi();
  } catch (error) {
    console.error('Error fetching new prompt directly:', error);
    
    // Return a fallback prompt if the API call fails
    return {
      type: 'self_awareness',
      typeLabel: '🧠 Self-Awareness',
      text: '🦕 Screen-Free Safari! Spend an hour today without your phone or any screens—just like the good old prehistoric days! What did you do instead? How did it feel to step away from the digital jungle?',
      hint: '🌿 Think about how your experience compared to your normal routine.'
    };
  }
}

/**
 * Fetch a new prompt (button click handler)
 */
async function fetchNewPrompt(): Promise<void> {
  try {
    // Show loading state on the button
    const newPromptButton = document.getElementById('new-prompt-button') as HTMLButtonElement;
    if (!newPromptButton) return;
    
    newPromptButton.disabled = true;
    newPromptButton.classList.add('loading');
    
    // Fetch new prompt from our API
    const promptData = await fetchNewPromptFromApi();
    
    // Reset button state
    newPromptButton.disabled = false;
    newPromptButton.classList.remove('loading');
    
    // Clear completed state if it exists
    const promptCard = document.querySelector('.prompt-card');
    if (promptCard) {
      promptCard.classList.remove('completed');
    }
    
    // Remove the completed message if it exists
    const completedMessage = document.querySelector('.completed-message');
    if (completedMessage) {
      completedMessage.remove();
    }
    
    // Update the UI with the new prompt
    updatePrompt(promptData);
    
    // Show notification
    showNotification('New prompt generated!');
    
    // Provide haptic feedback
    hapticFeedback('success');
    
    // Scroll to the top to focus on the new prompt
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Clear any existing response
    const responseTextarea = document.getElementById('response') as HTMLTextAreaElement;
    if (responseTextarea) {
      responseTextarea.value = '';
    }
  } catch (error) {
    console.error('Error fetching new prompt:', error);
    showNotification('Failed to get a new prompt. Please try again.', 'error');
    hapticFeedback('error');
  }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize app
  initApp();
  
  // Handle theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Handle submit response
  const submitResponseButton = document.getElementById('submit-response');
  if (submitResponseButton) {
    submitResponseButton.addEventListener('click', handleSubmitResponse);
  }
  
  // Handle new prompt button
  const newPromptButton = document.getElementById('new-prompt-button');
  if (newPromptButton) {
    newPromptButton.addEventListener('click', fetchNewPrompt);
  }
  
  // Handle retry button
  const retryButton = document.getElementById('retry-button');
  if (retryButton) {
    retryButton.addEventListener('click', initApp);
  }
});

/**
 * Toggle between light and dark theme
 */
function toggleTheme(): void {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  
  const toggleIcon = document.querySelector('.theme-toggle i');
  const toggleLabel = document.querySelector('.toggle-label');
  
  if (isDark && toggleIcon && toggleLabel) {
    toggleIcon.className = 'fas fa-sun';
    toggleLabel.textContent = 'Light Mode';
  } else if (toggleIcon && toggleLabel) {
    toggleIcon.className = 'fas fa-moon';
    toggleLabel.textContent = 'Dark Mode';
  }
}

// Export functions for external access if needed
export {
  initApp,
  fetchNewPrompt,
  handleSubmitResponse
};