// public/miniapp/src/services/apiServices.ts
/**
 * API Service for making HTTP requests
 */
import { AppConfig, UserData, Prompt, PromptResponse, ResponseResult } from '../types';
import { getUserId } from '../utils/telegramUtils';

/**
 * Fetch app configuration
 */
export async function fetchConfig(): Promise<AppConfig> {
  try {
    const response = await fetch('/miniapp/config');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching config:', error);
    throw new Error('Failed to load app configuration');
  }
}

/**
 * Fetch user data
 */
export async function fetchUserData(): Promise<UserData | null> {
  try {
    const userId = getUserId();
    
    if (!userId) {
      console.warn('No user ID available');
      return null;
    }
    
    const response = await fetch(`/miniapp/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Fetch today's prompt
 */
export async function fetchTodaysPrompt(): Promise<Prompt> {
  try {
    const userId = getUserId();
    
    if (!userId) {
      throw new Error('User ID not available');
    }
    
    const response = await fetch(`/api/miniapp/prompts/today/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prompt: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching today\'s prompt:', error);
    
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
 * Fetch a new prompt
 */
export async function fetchNewPromptFromApi(): Promise<Prompt> {
  try {
    const userId = getUserId();
    
    if (!userId) {
      throw new Error('User ID not available');
    }
    
    const response = await fetch(`/api/miniapp/prompts/new/${userId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch new prompt: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching new prompt:', error);
    throw error;
  }
}

/**
 * Submit response to a prompt
 */
export async function submitResponse(response: string): Promise<ResponseResult> {
  try {
    const userId = getUserId();
    
    if (!userId) {
      throw new Error('User ID not available');
    }
    
    const data: PromptResponse = {
      userId,
      response
    };
    
    const apiResponse = await fetch('/api/miniapp/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error || 'Failed to save response');
    }
    
    return await apiResponse.json();
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
}

/**
 * Fetch history entries
 */
export async function fetchHistoryEntries(limit: number = 50): Promise<any[]> {
  try {
    const userId = getUserId();
    
    if (!userId) {
      throw new Error('User ID not available');
    }
    
    const response = await fetch(`/api/miniapp/history/${userId}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    
    // Return fallback data if the API call fails
    return [
      {
        date: '2025-04-30',
        promptType: 'connections',
        prompt: '🦖 Fossilized Friendships Await! Reconnect with someone you have not spoken to in a while—send them a message and see what happens!',
        response: 'Just reconnected with an old friend, and it felt really nice! Some bonds never really fade—just need a little nudge. If someone is on your mind, this is your sign to reach out!'
      },
      {
        date: '2025-04-23',
        promptType: 'self_awareness',
        prompt: '🌋 Meteor Strike! Turn Chaos into Growth. Recall a recent failure or setback that felt like a meteor hit.',
        response: 'Failed a presentation at work last week. Initially felt terrible, but realized I had not prepared enough and was trying to wing it. Lesson: preparation matters, and failures are just feedback.'
      }
    ];
  }
}

/**
 * Get random dino message
 */
export async function fetchRandomDinoMessage(): Promise<string> {
  try {
    const response = await fetch('/api/miniapp/dinoMessages/random');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dino message: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error fetching random dino message:', error);
    return "You're doing great!";
  }
}