// hooks/usePrompts.ts
// Fixed to use the exact same weekly streak backend as index.html and /prompt command
import { useState, useEffect, useCallback } from 'react';

interface PromptData {
  type: string;
  typeLabel: string;
  text: string;
  hint?: string;
}

interface WeeklyRewardData {
  pointsAwarded: number;
  newStreak: number;
  totalPoints: number;
  milestoneReached?: number;
  streakBroken: boolean;
  isNewRecord: boolean;
  isMultipleEntry: boolean;
  weekId: string;
}

interface PromptResponse {
  success: boolean;
  message?: string;
  entry?: any;
  rewards?: WeeklyRewardData;
  motivationalMessage?: string;
  nextPromptHint?: string;
}

interface UsePromptsResult {
  currentPrompt: PromptData | null;
  isLoading: boolean;
  error: string | null;
  lastRewards: WeeklyRewardData | null;
  fetchTodaysPrompt: () => Promise<void>;
  getNewPrompt: () => Promise<void>;
  submitPromptResponse: (response: string) => Promise<boolean>;
}

// Default fallback prompts (same as index.html)
const defaultPrompts: PromptData[] = [
  {
    type: 'self_awareness',
    typeLabel: '🧠 Self-Awareness',
    text: '🦕 Screen-Free Safari! Spend an hour today without your phone or any screens—just like the good old prehistoric days! What did you do instead? How did it feel to step away from the digital jungle?',
    hint: '🌿 Think about how your experience compared to your normal routine.'
  },
  {
    type: 'connections',
    typeLabel: '🤝 Connections',
    text: '🦖 Fossilized Friendships Await! Reconnect with someone you have not spoken to in a while—send them a message and see what happens!',
    hint: '💫 Sometimes the smallest gesture can reignite meaningful connections.'
  }
];

export const usePrompts = (userId?: string): UsePromptsResult => {
  const [currentPrompt, setCurrentPrompt] = useState<PromptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRewards, setLastRewards] = useState<WeeklyRewardData | null>(null);

  // Fetch today's prompt - exactly like index.html
  const fetchTodaysPrompt = useCallback(async () => {
    if (!userId) {
      console.warn('No user ID available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/miniapp/prompts/today/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // User not found - use fallback prompt
          console.log('User not found, using fallback prompt');
          const randomPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
          setCurrentPrompt(randomPrompt);
          return;
        }
        throw new Error(`Failed to fetch prompt: ${response.statusText}`);
      }
      
      const promptData = await response.json();
      setCurrentPrompt(promptData);
    } catch (err) {
      console.error('Error fetching today\'s prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prompt');
      // Use fallback prompt on error
      const randomPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
      setCurrentPrompt(randomPrompt);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get new prompt - exactly like index.html
  const getNewPrompt = useCallback(async () => {
    if (!userId) {
      console.warn('No user ID available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/miniapp/prompts/new/${userId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch new prompt: ${response.statusText}`);
      }
      
      const promptData = await response.json();
      setCurrentPrompt(promptData);
    } catch (err) {
      console.error('Error getting new prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to get new prompt');
      // Use fallback prompt on error
      const randomPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
      setCurrentPrompt(randomPrompt);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Submit prompt response - FIXED to use weekly streak API
  const submitPromptResponse = useCallback(async (responseText: string): Promise<boolean> => {
    if (!userId || !responseText.trim()) {
      console.warn('Missing user ID or response text');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the WEEKLY STREAK endpoint, not the regular responses endpoint
      const response = await fetch('/api/miniapp/responses/weekly', {
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
      
      const responseData: PromptResponse = await response.json();
      
      // Store the reward data for the parent component to use
      if (responseData.rewards) {
        setLastRewards(responseData.rewards);
        
        // Log the streak rewards for debugging
        console.log('Weekly streak rewards:', responseData.rewards);
        console.log('Motivational message:', responseData.motivationalMessage);
      }
      
      return responseData.success;
    } catch (err) {
      console.error('Error submitting prompt response:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit response');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initialize on mount - like index.html
  useEffect(() => {
    if (userId) {
      fetchTodaysPrompt();
    }
  }, [userId, fetchTodaysPrompt]);

  return {
    currentPrompt,
    isLoading,
    error,
    lastRewards,
    fetchTodaysPrompt,
    getNewPrompt,
    submitPromptResponse
  };
};