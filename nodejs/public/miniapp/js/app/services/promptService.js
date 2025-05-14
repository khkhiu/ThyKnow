// js/app/services/promptService.js - Prompt operations

import { fetchTodaysPrompt, fetchNewPromptDirectly } from '../api.js';
import { updatePrompt, resetPromptUI } from '../ui/prompt.js';
import { getElementValue, clearElementValue, scrollIntoView } from '../utils/elements.js';
import { showNotification } from '../ui/notifications.js';

/**
 * Get today's prompt and update UI
 * @param {string} userId - User ID
 * @returns {Promise<Object>} The prompt data
 */
export async function getTodaysPrompt(userId) {
  try {
    const promptData = await fetchTodaysPrompt(userId);
    updatePrompt(promptData);
    return promptData;
  } catch (error) {
    console.error('Error getting today\'s prompt:', error);
    throw error;
  }
}

/**
 * Get a new prompt and update UI
 * @param {string} userId - User ID
 * @param {Object} tg - Telegram WebApp instance
 * @returns {Promise<Object>} The new prompt data
 */
export async function getNewPrompt(userId, tg) {
  try {
    // Reset the UI for a new prompt
    resetPromptUI();
    
    // Show loading state on the button
    const newPromptButton = document.getElementById('new-prompt-button');
    newPromptButton.disabled = true;
    newPromptButton.classList.add('loading');
    
    // Fetch new prompt
    const promptData = await fetchNewPromptDirectly(userId);
    
    // Reset button state
    newPromptButton.disabled = false;
    newPromptButton.classList.remove('loading');
    
    // Update UI with new prompt
    updatePrompt(promptData);
    
    // Clear any existing response
    clearElementValue('response');
    
    // Show notification
    showNotification('New prompt generated!');
    
    // Provide haptic feedback if Telegram WebApp is available
    if (tg && tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
    
    // Scroll to the top to focus on the new prompt
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    return promptData;
  } catch (error) {
    console.error('Error getting new prompt:', error);
    showNotification('Failed to get a new prompt. Please try again.', 'error');
    
    // Provide error feedback
    if (tg && tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('error');
    }
    
    throw error;
  }
}

/**
 * Submit response to the current prompt
 * @param {string} userId - User ID
 * @param {Object} tg - Telegram WebApp instance
 * @returns {Promise<Object>} Response data
 */
export async function submitPromptResponse(userId, tg) {
  // Get the response text from the textarea
  const responseText = getElementValue('response').trim();
  
  if (!responseText) {
    showNotification('Please enter your response first');
    return null;
  }
  
  try {
    // Import API function here to avoid circular dependencies
    const { submitResponse } = await import('../api.js');
    
    // Show loading state
    const submitButton = document.getElementById('submit-response');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    // Submit the response
    const responseData = await submitResponse(userId, responseText);
    
    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    
    // Clear the response field
    clearElementValue('response');
    
    // Show success notification
    showNotification('Response saved successfully! Use the "New Prompt" button when you\'re ready for a new prompt.');
    
    // Provide haptic feedback
    if (tg && tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
    
    // Import module here to avoid circular dependencies
    const { showCompletedState } = await import('../ui/prompt.js');
    
    // Show the "completed" state to encourage using the New Prompt button
    showCompletedState();
    
    return responseData;
  } catch (error) {
    console.error('Error submitting response:', error);
    showNotification('Failed to save your response. Please try again.', 'error');
    
    if (tg && tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('error');
    }
    
    throw error;
  }
}