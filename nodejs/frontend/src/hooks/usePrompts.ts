// hooks/usePrompts.ts
import { useState, useEffect, useCallback } from 'react';

interface PromptData {
  type: string;
  typeLabel: string;
  text: string;
  hint: string;
}

interface AppConfig {
  appName: string;
  version: string;
  timezone: string;
  features: {
    selfAwareness: boolean;
    connections: boolean;
    history: boolean;
    affirmations: boolean;
    pet: boolean;
  };
}

export const usePrompts = (userId?: string) => {
  const [currentPrompt, setCurrentPrompt] = useState<PromptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);

  // Default prompts fallback
  const defaultPrompts: PromptData[] = [
    {
      type: 'self_awareness',
      typeLabel: 'Self Awareness',
      text: 'What emotions have you experienced most strongly today, and what do you think triggered them?',
      hint: 'Think about the moments when you felt the most intense emotions - both positive and negative.'
    },
    {
      type: 'connections',
      typeLabel: 'Connections',
      text: 'How did you connect with others today? What made those interactions meaningful or challenging?',
      hint: 'Consider both the quality and quantity of your social interactions.'
    },
    {
      type: 'growth',
      typeLabel: 'Personal Growth',
      text: 'What did you learn about yourself today? How did you grow or change?',
      hint: 'Reflect on moments of insight, challenge, or personal development.'
    },
    {
      type: 'gratitude',
      typeLabel: 'Gratitude',
      text: 'What are you most grateful for today? How did gratitude show up in your day?',
      hint: 'Think about both the big and small things that brought you joy or appreciation.'
    },
    {
      type: 'challenges',
      typeLabel: 'Challenges',
      text: 'What challenges did you face today, and how did you handle them?',
      hint: 'Consider both external obstacles and internal struggles.'
    },
    {
      type: 'intentions',
      typeLabel: 'Intentions',
      text: 'What intentions do you want to set for tomorrow? How can you align your actions with your values?',
      hint: 'Think about what you want to focus on and how you want to show up.'
    }
  ];

  // Fetch app configuration
  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/miniapp/config');
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      const configData = await response.json();
      setConfig(configData);
      return configData;
    } catch (err) {
      console.error('Error fetching config:', err);
      // Use default config
      const defaultConfig: AppConfig = {
        appName: 'ThyKnow',
        version: '1.0.0',
        timezone: 'UTC',
        features: {
          selfAwareness: true,
          connections: true,
          history: true,
          affirmations: true,
          pet: true
        }
      };
      setConfig(defaultConfig);
      return defaultConfig;
    }
  }, []);

  // Fetch today's prompt
  const fetchTodaysPrompt = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/miniapp/prompts/today/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s prompt');
      }
      const promptData = await response.json();
      setCurrentPrompt(promptData);
    } catch (err) {
      console.error('Error fetching today\'s prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prompt');
      // Use a random default prompt as fallback
      const randomPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
      setCurrentPrompt(randomPrompt);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Get a new prompt
  const getNewPrompt = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/miniapp/prompts/new/${userId}`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch new prompt');
      }
      const promptData = await response.json();
      setCurrentPrompt(promptData);
    } catch (err) {
      console.error('Error fetching new prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch new prompt');
      // Use a random default prompt as fallback
      const randomPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
      setCurrentPrompt(randomPrompt);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Submit prompt response
  const submitPromptResponse = useCallback(async (response: string) => {
    if (!userId || !currentPrompt) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const submitResponse = await fetch(`/api/miniapp/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          response
        })
      });
      
      if (!submitResponse.ok) {
        throw new Error('Failed to submit response');
      }
      
      const result = await submitResponse.json();
      return result.success;
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit response');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPrompt]);

  // Initialize on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (userId) {
      fetchTodaysPrompt();
    }
  }, [userId, fetchTodaysPrompt]);

  return {
    currentPrompt,
    isLoading,
    error,
    config,
    fetchTodaysPrompt,
    getNewPrompt,
    submitPromptResponse,
    defaultPrompts
  };
};