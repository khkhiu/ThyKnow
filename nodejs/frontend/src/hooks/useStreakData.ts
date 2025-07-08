// ==================================================
// src/hooks/useStreakData.ts
// Custom hook for streak data fetching
// ==================================================

import { useState, useEffect } from 'react';
import { StreakApiResponse } from '../types/streak';
import { streakApi } from '../services/streakApi';

interface UseStreakDataResult {
  data: StreakApiResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useStreakData = (userId: string): UseStreakDataResult => {
  const [data, setData] = useState<StreakApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const streakData = await streakApi.getStreakData(userId);
      setData(streakData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch streak data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};