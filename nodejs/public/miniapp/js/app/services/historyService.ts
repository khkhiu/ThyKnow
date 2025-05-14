// public/miniapp/js/app/services/historyService.ts
import { JournalEntry } from '../../../../../src/types/miniapp';
import { fetchHistory } from '../api';
import { updateHistory } from '../ui/history';

/**
 * Get history entries and update UI
 * @param userId - User ID
 * @param limit - Maximum number of entries to fetch
 * @returns History entries
 */
export async function getHistoryEntries(userId: string | number, limit: number = 50): Promise<JournalEntry[]> {
  try {
    const historyData = await fetchHistory(userId, limit);
    updateHistory(historyData);
    return historyData;
  } catch (error) {
    console.error('Error getting history entries:', error);
    throw error;
  }
}