// src/hooks/useHistory.ts
import { useState, useCallback } from 'react';
import { JournalEntry } from '../types/miniapp';
import { apiClient } from '../api/client';

interface UseHistoryReturn {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: (userId: string | number, limit?: number) => Promise<void>;
  refreshHistory: () => Promise<void>;
  isLoadingHistory: boolean;
}

export const useHistory = (): UseHistoryReturn => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserId, setLastUserId] = useState<string | number | null>(null);
  const [lastLimit, setLastLimit] = useState<number>(50);

  const fetchHistory = useCallback(async (userId: string | number, limit: number = 50): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setLastUserId(userId);
    setLastLimit(limit);
    
    try {
      const response = await apiClient.get(`/api/miniapp/history/${userId}?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const historyData = await response.json();
      
      // Ensure we have an array
      const entriesArray = Array.isArray(historyData) ? historyData : historyData.entries || [];
      
      // Sort by date (newest first)
      const sortedEntries = entriesArray.sort((a: JournalEntry, b: JournalEntry) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setEntries(sortedEntries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMessage);
      console.error('Error fetching history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async (): Promise<void> => {
    if (lastUserId !== null) {
      await fetchHistory(lastUserId, lastLimit);
    }
  }, [lastUserId, lastLimit, fetchHistory]);

  return {
    entries,
    isLoading,
    error,
    fetchHistory,
    refreshHistory,
    isLoadingHistory: isLoading
  };
};