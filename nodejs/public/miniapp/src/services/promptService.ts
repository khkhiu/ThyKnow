// public/miniapp/src/components/promptService.ts
/**
 * Prompt service for managing user prompts
 */
import { Prompt } from '../types';
import { fetchTodaysPrompt, fetchNewPromptFromApi } from './apiService';
import { showNotification } from '../components/notification';
import { hapticFeedback } from '../utils/telegramUtils';

// Cache the current prompt
let currentPrompt: Prompt | null = null;

/**
 * Load the current prompt for the user
 * 
 * @param forceRefresh - Whether to force a fresh API call
 */
export async function loadCurrentPrompt(forceRefresh: boolean = false): Promise<Prompt> {
  if (!forceRefresh && currentPrompt) {
    return currentPrompt;
  }
  
  try {
    const prompt = await fetchTodaysPrompt();
    currentPrompt = prompt;
    return prompt;
  } catch (error) {
    console.error('Error loading current prompt:', error);
    
    // Return a fallback prompt if the API call fails
    const fallbackPrompt: Prompt = {
      type: 'self_awareness',
      typeLabel: '🧠 Self-Awareness',
      text: '🦕 Screen-Free Safari! Spend an hour today without your phone or any screens—just like the good old prehistoric days! What did you do instead? How did it feel to step away from the digital jungle?',
      hint: '🌿 Think about how your experience compared to your normal routine.'
    };
    
    currentPrompt = fallbackPrompt;
    return fallbackPrompt;
  }
}

/**
 * Get a new prompt for the user
 * 
 * @param button - Optional button element to show loading state
 */
export async function getNewPrompt(button?: HTMLButtonElement): Promise<Prompt> {
  try {
    // Show loading state if button is provided
    if (button) {
      button.disabled = true;
      button.classList.add('loading');
    }
    
    // Fetch new prompt
    const prompt = await fetchNewPromptFromApi();
    
    // Update cache
    currentPrompt = prompt;
    
    // Notify user
    showNotification('New prompt generated!');
    hapticFeedback('success');
    
    return prompt;
  } catch (error) {
    console.error('Error fetching new prompt:', error);
    showNotification('Failed to get a new prompt. Please try again.', 'error');
    hapticFeedback('error');
    throw error;
  } finally {
    // Reset button state
    if (button) {
      button.disabled = false;
      button.classList.remove('loading');
    }
  }
}

/**
 * Clear the prompt cache
 */
export function clearPromptCache(): void {
  currentPrompt = null;
}

/**
 * Get the prompt by URL parameter
 * If 't' parameter exists, fetch a new prompt
 * Otherwise, get the current prompt
 */
export async function getPromptByUrlParam(): Promise<Prompt> {
  const urlParams = new URLSearchParams(window.location.search);
  const timestamp = urlParams.get('t');
  
  if (timestamp) {
    // If timestamp parameter exists, force a new prompt
    console.log('Timestamp found in URL, fetching new prompt');
    try {
      return await getNewPrompt();
    } catch (error) {
      return await loadCurrentPrompt();
    }
  } else {
    // Otherwise get today's prompt as usual
    return await loadCurrentPrompt();
  }
}