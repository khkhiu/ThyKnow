// public/miniapp/src/components/history.ts
/**
 * History service for managing user journal entries
 */
import { HistoryEntry, DateFilterOption } from '../types';
import { fetchHistoryEntries } from './apiService';
import { isToday, isThisWeek, isThisMonth, parseISODate } from '../utils/dateUtils';

// In-memory cache for history entries
let historyCache: HistoryEntry[] = [];

/**
 * Load history entries from API or cache
 * 
 * @param forceRefresh - Whether to force a fresh API call
 * @param limit - Maximum number of entries to fetch
 */
export async function loadHistoryEntries(forceRefresh: boolean = false, limit: number = 50): Promise<HistoryEntry[]> {
  if (forceRefresh || historyCache.length === 0) {
    try {
      const entries = await fetchHistoryEntries(limit);
      historyCache = entries;
      return entries;
    } catch (error) {
      console.error('Error loading history entries:', error);
      throw error;
    }
  }
  
  return historyCache;
}

/**
 * Clear the history cache
 */
export function clearHistoryCache(): void {
  historyCache = [];
}

/**
 * Filter history entries by date
 * 
 * @param entries - The entries to filter
 * @param filterType - The type of filter to apply
 * @param customDate - Custom date for filtering (if filterType is 'custom')
 */
export function filterEntriesByDate(
  entries: HistoryEntry[],
  filterType: DateFilterOption,
  customDate?: string
): HistoryEntry[] {
  if (!entries || entries.length === 0) {
    return [];
  }
  
  switch (filterType) {
    case 'all':
      return [...entries];
      
    case 'today':
      return entries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isToday(entryDate);
      });
      
    case 'week':
      return entries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isThisWeek(entryDate);
      });
      
    case 'month':
      return entries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isThisMonth(entryDate);
      });
      
    case 'custom':
      if (customDate) {
        const selectedDate = new Date(customDate);
        return entries.filter(entry => {
          const entryDate = parseISODate(entry.date);
          return entryDate.getDate() === selectedDate.getDate() &&
                 entryDate.getMonth() === selectedDate.getMonth() &&
                 entryDate.getFullYear() === selectedDate.getFullYear();
        });
      }
      return entries;
      
    default:
      return entries;
  }
}

/**
 * Get a single history entry by ID
 * 
 * @param entryId - The ID of the entry to retrieve
 */
export function getHistoryEntryById(entryId: number): HistoryEntry | undefined {
  return historyCache.find(entry => entry.id === entryId);
}

/**
 * Add a new entry to the cache (for optimistic UI updates)
 * 
 * @param entry - The new entry to add
 */
export function addEntryToCache(entry: HistoryEntry): void {
  historyCache = [entry, ...historyCache];
}