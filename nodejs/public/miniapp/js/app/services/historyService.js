// js/app/services/historyService.js - History operations

import { fetchHistory } from '../api.js';
import { updateHistory } from '../ui/history.js';

/**
 * Get history entries and update UI
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of entries to fetch
 * @returns {Promise<Array>} History entries
 */
export async function getHistoryEntries(userId, limit = 50) {
  try {
    const historyData = await fetchHistory(userId, limit);
    updateHistory(historyData);
    return historyData;
  } catch (error) {
    console.error('Error getting history entries:', error);
    throw error;
  }
}