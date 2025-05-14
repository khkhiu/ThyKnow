// public/miniapp/src/components/history.ts
/**
 * History component functionality
 */
import { HistoryEntry, DateFilterOption } from '../types';
import { formatDate, parseISODate, isToday, isThisWeek, isThisMonth } from '../utils/dateUtils';

// Global variable to store all history entries
let allHistoryEntries: HistoryEntry[] = [];

/**
 * Update history UI with entries
 */
export function updateHistory(historyData: HistoryEntry[]): void {
  // Store all entries in the global variable
  allHistoryEntries = historyData || [];
  
  // Initial display with all entries
  updateHistoryDisplay(allHistoryEntries);
  
  const historyContainer = document.getElementById('history-entries');
  if (!historyContainer) return;
  
  historyContainer.innerHTML = '';
  
  if (!historyData || historyData.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-history">
        <p>No journal entries yet. Start your journey by responding to today's prompt!</p>
      </div>
    `;
    return;
  }
  
  historyData.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'history-entry';
    
    entryElement.innerHTML = `
      <div class="history-date">${formatDate(entry.date)}</div>
      <div class="history-prompt">${entry.prompt}</div>
      <div class="history-response">${entry.response}</div>
    `;
    
    historyContainer.appendChild(entryElement);
  });
}

/**
 * Filter history entries by date
 */
export function filterHistoryByDate(filterType: DateFilterOption, customDate?: string): void {
  if (!allHistoryEntries || allHistoryEntries.length === 0) {
    return;
  }
  
  let filteredEntries: HistoryEntry[] = [];
  
  switch (filterType) {
    case 'all':
      filteredEntries = [...allHistoryEntries];
      break;
      
    case 'today':
      filteredEntries = allHistoryEntries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isToday(entryDate);
      });
      break;
      
    case 'week':
      filteredEntries = allHistoryEntries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isThisWeek(entryDate);
      });
      break;
      
    case 'month':
      filteredEntries = allHistoryEntries.filter(entry => {
        const entryDate = parseISODate(entry.date);
        return isThisMonth(entryDate);
      });
      break;
      
    case 'custom':
      if (customDate) {
        const selectedDate = new Date(customDate);
        filteredEntries = allHistoryEntries.filter(entry => {
          const entryDate = parseISODate(entry.date);
          return entryDate.getDate() === selectedDate.getDate() &&
                 entryDate.getMonth() === selectedDate.getMonth() &&
                 entryDate.getFullYear() === selectedDate.getFullYear();
        });
      }
      break;
  }
  
  // Update the UI with filtered entries
  updateHistoryDisplay(filteredEntries);
}

/**
 * Update the history display with filtered entries
 */
export function updateHistoryDisplay(entries: HistoryEntry[]): void {
  const historyContainer = document.getElementById('history-entries');
  const emptyHistory = document.getElementById('empty-history');
  
  if (!historyContainer || !emptyHistory) return;
  
  if (entries.length === 0) {
    historyContainer.style.display = 'none';
    emptyHistory.style.display = 'block';
    return;
  }
  
  historyContainer.style.display = 'block';
  emptyHistory.style.display = 'none';
  historyContainer.innerHTML = '';
  
  entries.forEach(entry => {
    const entryElement = document.createElement('div');
    entryElement.className = 'history-entry';
    
    entryElement.innerHTML = `
      <div class="history-date">${formatDate(entry.date)}</div>
      <div class="history-prompt">${entry.prompt}</div>
      <div class="history-response">${entry.response}</div>
    `;
    
    historyContainer.appendChild(entryElement);
  });
}