// hooks/usePrompts.ts
// Refactored to use the exact same backend as index.html and /prompt command
import { useState, useEffect, useCallback } from 'react';

interface PromptData {
  type: string;
  typeLabel: string;
  text: string;
  hint?: string;
}

interface PromptResponse {
  success: boolean;
  message?: string;
  entry?: any;
}

interface UsePromptsResult {
  currentPrompt: PromptData | null;
  isLoading: boolean;
  error: string | null;
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
      setError(err instanceof Error ? err.message : 'Failed to fetch today\'s prompt');
      
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
      
      // Log success like index.html does
      console.log('New prompt generated successfully');
    } catch (err) {
      console.error('Error fetching new prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch new prompt');
      
      // Use fallback prompt on error
      const randomPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
      setCurrentPrompt(randomPrompt);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Submit prompt response - exactly like index.html
  const submitPromptResponse = useCallback(async (response: string): Promise<boolean> => {
    if (!userId || !currentPrompt) {
      console.warn('Missing userId or currentPrompt for submission');
      return false;
    }
    
    if (!response.trim()) {
      setError('Please enter your response first');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const submitResponse = await fetch('/api/miniapp/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          response: response.trim()
        })
      });
      
      if (!submitResponse.ok) {
        throw new Error(`Failed to submit response: ${submitResponse.statusText}`);
      }
      
      const result = await submitResponse.json();
      
      if (result.success) {
        console.log('Response saved successfully');
        return true;
      } else {
        throw new Error(result.message || 'Failed to save response');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit response');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentPrompt]);

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
    fetchTodaysPrompt,
    getNewPrompt,
    submitPromptResponse
  };
};