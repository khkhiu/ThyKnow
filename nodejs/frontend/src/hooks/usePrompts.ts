// src/hooks/usePrompts.ts
import { useState, useCallback } from 'react';
import { PromptData, ResponseData } from '../types/miniapp';
import { apiClient } from '../api/client';

interface UsePromptsReturn {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  getTodaysPrompt: (userId: string | number) => Promise<PromptData>;
  getNewPrompt: (userId: string | number) => Promise<PromptData>;
  submitResponse: (userId: string | number, promptId: string, response: string) => Promise<ResponseData>;
}

export const usePrompts = (): UsePromptsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTodaysPrompt = useCallback(async (userId: string | number): Promise<PromptData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/api/miniapp/prompts/today/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch today's prompt: ${response.status}`);
      }
      
      const promptData = await response.json();
      return promptData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get today\'s prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNewPrompt = useCallback(async (userId: string | number): Promise<PromptData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/api/miniapp/prompts/new`, {
        userId,
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch new prompt: ${response.status}`);
      }
      
      const promptData = await response.json();
      return promptData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get new prompt';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitResponse = useCallback(async (
    userId: string | number, 
    promptId: string, 
    response: string
  ): Promise<ResponseData> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const submitData = {
        userId,
        promptId,
        response: response.trim(),
        timestamp: new Date().toISOString()
      };
      
      const apiResponse = await apiClient.post('/api/miniapp/responses', submitData);
      
      if (!apiResponse.ok) {
        throw new Error(`Failed to submit response: ${apiResponse.status}`);
      }
      
      const responseData = await apiResponse.json();
      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isLoading,
    isSubmitting,
    error,
    getTodaysPrompt,
    getNewPrompt,
    submitResponse
  };
};