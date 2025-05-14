// api.js - API calls to the backend

import { API, FALLBACKS } from './config.js';

/**
 * Fetch app configuration
 * @returns {Promise<Object>} App configuration data
 */
export async function fetchConfig() {
  try {
    const response = await fetch(API.CONFIG);
    return await response.json();
  } catch (error) {
    console.error('Error fetching config:', error);
    throw new Error('Failed to load app configuration');
  }
}

/**
 * Fetch user data
 * @param {string} userId - Telegram user ID
 * @returns {Promise<Object|null>} User data or null if unavailable
 */
export async function fetchUserData(userId) {
  try {
    if (!userId) {
      console.warn('No user ID provided');
      return null;
    }
    
    const response = await fetch(`${API.USER}${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Fetch today's prompt for a user
 * @param {string} userId - Telegram user ID
 * @returns {Promise<Object>} Prompt data
 */
export async function fetchTodaysPrompt(userId) {
  try {
    if (!userId) {
      console.warn('No user ID available from Telegram');
      throw new Error('User data not available');
    }
    
    const response = await fetch(`${API.TODAYS_PROMPT}${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prompt: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching today\'s prompt:', error);
    return FALLBACKS.PROMPT;
  }
}

/**
 * Fetch a new prompt
 * @param {string} userId - Telegram user ID
 * @returns {Promise<Object>} New prompt data
 */
export async function fetchNewPromptDirectly(userId) {
  try {
    if (!userId) {
      console.warn('No user ID available from Telegram');
      throw new Error('User data not available');
    }
    
    const response = await fetch(`${API.NEW_PROMPT}${userId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch new prompt: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching new prompt directly:', error);
    return FALLBACKS.PROMPT;
  }
}

/**
 * Fetch history entries for a user
 * @param {string} userId - Telegram user ID
 * @param {number} limit - Maximum number of entries to fetch
 * @returns {Promise<Array>} History entries
 */
export async function fetchHistory(userId, limit = 50) {
  try {
    if (!userId) {
      console.warn('No user ID available from Telegram');
      throw new Error('User data not available');
    }
    
    const response = await fetch(`${API.HISTORY}${userId}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    return FALLBACKS.HISTORY;
  }
}

/**
 * Submit a response to the current prompt
 * @param {string} userId - Telegram user ID
 * @param {string} responseText - User's response to the prompt
 * @returns {Promise<Object>} Response data
 */
export async function submitResponse(userId, responseText) {
  if (!userId || !responseText) {
    throw new Error('User ID and response are required');
  }
  
  const response = await fetch(API.RESPONSES, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      response: responseText
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save response');
  }
  
  return await response.json();
}