// hooks/useJournalData.ts
import { useState, useEffect, useCallback } from 'react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  week: string;
  timestamp?: string;
  promptType?: string;
  prompt?: string;
  response?: string;
}

interface ApiJournalEntry {
  id: number;
  date: string;
  promptType: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export const useJournalData = (userId?: string) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [historyEntries, setHistoryEntries] = useState<ApiJournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch journal history from API
  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/miniapp/history/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const historyData = await response.json();
      setHistoryEntries(historyData);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Convert API entries to local entries format
  const convertApiEntriesToLocal = useCallback((apiEntries: ApiJournalEntry[]): JournalEntry[] => {
    return apiEntries.map(entry => ({
      id: entry.id.toString(),
      title: entry.promptType || 'Journal Entry',
      content: entry.response,
      date: entry.date,
      completed: true,
      week: getWeekFromDate(entry.date),
      timestamp: entry.timestamp,
      promptType: entry.promptType,
      prompt: entry.prompt,
      response: entry.response
    }));
  }, []);

  // Get week identifier from date
  const getWeekFromDate = (dateString: string): string => {
    const date = new Date(dateString);
    const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  };

  // Get current week identifier
  const getCurrentWeek = (): string => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  };

  // Add new entry (local)
  const addEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      ...entry,
      week: entry.week || getCurrentWeek()
    };
    setEntries(prev => [...prev, newEntry]);
    return newEntry;
  }, []);

  // Update entry (local)
  const updateEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
  }, []);

  // Complete entry (local)
  const completeEntry = useCallback((id: string) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, completed: !entry.completed } : entry
      )
    );
  }, []);

  // Delete entry (local)
  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  // Get entries for current week
  const getCurrentWeekEntries = useCallback(() => {
    const currentWeek = getCurrentWeek();
    return entries.filter(entry => entry.week === currentWeek);
  }, [entries]);

  // Get completed entries for today
  const getCompletedEntriesToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return entries.filter(entry => 
      entry.date === today && entry.completed
    ).length;
  }, [entries]);

  // Get streak information
  const getStreakInfo = useCallback(() => {
    const sortedEntries = [...entries]
      .filter(entry => entry.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Calculate current streak
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let lastDate: Date | null = null;
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      if (!lastDate || (lastDate.getTime() - entryDate.getTime()) === 86400000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
      lastDate = entryDate;
    }
    
    return {
      currentStreak,
      longestStreak,
      totalEntries: sortedEntries.length
    };
  }, [entries]);

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries);
        setEntries(parsedEntries);
      } catch (err) {
        console.error('Error parsing saved entries:', err);
      }
    }
  }, []);

  // Save entries to localStorage when entries change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  // Fetch history when userId changes
  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId, fetchHistory]);

  // Convert API entries to local format when history changes
  useEffect(() => {
    if (historyEntries.length > 0) {
      const convertedEntries = convertApiEntriesToLocal(historyEntries);
      // Merge with existing entries, avoiding duplicates
      setEntries(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newEntries = convertedEntries.filter(e => !existingIds.has(e.id));
        return [...prev, ...newEntries];
      });
    }
  }, [historyEntries, convertApiEntriesToLocal]);

  return {
    entries,
    historyEntries,
    isLoading,
    error,
    addEntry,
    updateEntry,
    completeEntry,
    deleteEntry,
    getCurrentWeekEntries,
    getCompletedEntriesToday,
    getStreakInfo,
    fetchHistory,
    getCurrentWeek
  };
};