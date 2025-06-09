// public/miniapp/js/app/api.ts
import { API, FALLBACKS } from './config';
import { 
  AppConfig, 
  PromptData, 
  JournalEntry, 
  UserData, 
  ResponseData 
} from '../../types/miniapp';

/**
 * Fetch app configuration
 * @returns App configuration data
 */
export async function fetchConfig(): Promise<AppConfig> {
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
 * @param userId - Telegram user ID
 * @returns User data or null if unavailable
 */
export async function fetchUserData(userId: string | number): Promise<UserData | null> {
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
 * @param userId - Telegram user ID
 * @returns Prompt data
 */
export async function fetchTodaysPrompt(userId: string | number): Promise<PromptData> {
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
 * @param userId - Telegram user ID
 * @returns New prompt data
 */
export async function fetchNewPromptDirectly(userId: string | number): Promise<PromptData> {
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
 * @param userId - Telegram user ID
 * @param limit - Maximum number of entries to fetch
 * @returns History entries
 */
export async function fetchHistory(userId: string | number, limit: number = 50): Promise<JournalEntry[]> {
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
 * @param userId - Telegram user ID
 * @param responseText - User's response to the prompt
 * @returns Response data
 */
export async function submitResponse(userId: string | number, responseText: string): Promise<ResponseData> {
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