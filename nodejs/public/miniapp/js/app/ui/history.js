// history.js - History UI operations

import { ELEMENTS } from '../config.js';
import { setInnerHTML, showElement, hideElement } from '../utils/elements.js';
import { 
  formatDate, 
  parseISODate, 
  isToday, 
  isThisWeek, 
  isThisMonth 
} from '../utils/formatters.js';

// Global variable to store all history entries
let allHistoryEntries = [];

/**
 * Update history UI with entries
 * @param {Array} historyData - History entries
 */
export function updateHistory(historyData) {
  // Store all entries in the global variable
  allHistoryEntries = historyData || [];
  
  // Initial display with all entries
  updateHistoryDisplay(allHistoryEntries);
    
  // Initialize the date filtering controls
  initDateFiltering();
}

/**
 * Update the history display with filtered entries
 * @param {Array} entries - History entries to display
 */
export function updateHistoryDisplay(entries) {
  const historyContainer = document.getElementById(ELEMENTS.HISTORY_ENTRIES);
  const emptyHistory = document.getElementById(ELEMENTS.EMPTY_HISTORY);
  
  if (!entries || entries.length === 0) {
    // Hide history container and show empty state
    hideElement(ELEMENTS.HISTORY_ENTRIES);
    showElement(ELEMENTS.EMPTY_HISTORY);
    return;
  }
  
  // Show history container and hide empty state
  showElement(ELEMENTS.HISTORY_ENTRIES);
  hideElement(ELEMENTS.EMPTY_HISTORY);
  
  // Clear existing entries
  historyContainer.innerHTML = '';
  
  // Add each entry to the container
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

/**
 * Initialize date filtering controls
 */
export function initDateFiltering() {
  const dateFilter = document.getElementById(ELEMENTS.DATE_FILTER);
  const customDateContainer = document.getElementById(ELEMENTS.CUSTOM_DATE_CONTAINER);
  const customDateInput = document.getElementById(ELEMENTS.CUSTOM_DATE);
  const applyDateButton = document.getElementById(ELEMENTS.APPLY_DATE);
  
  if (!dateFilter || !customDateContainer || !customDateInput || !applyDateButton) {
    console.warn('Date filtering elements not found');
    return;
  }
  
  // Set today's date as the default for custom date
  const today = new Date();
  const formattedDate = formatDateForInput(today);
  customDateInput.value = formattedDate;
  
  // Handle filter change
  dateFilter.addEventListener('change', () => {
    if (dateFilter.value === 'custom') {
      customDateContainer.style.display = 'flex';
    } else {
      customDateContainer.style.display = 'none';
      // Apply filter immediately for non-custom options
      filterHistoryByDate(dateFilter.value);
    }
  });
  
  // Handle apply button click
  applyDateButton.addEventListener('click', () => {
    filterHistoryByDate('custom', customDateInput.value);
  });
  
  // Also filter when pressing enter in date input
  customDateInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      filterHistoryByDate('custom', customDateInput.value);
    }
  });
}

/**
 * Filter history entries by date
 * @param {string} filterType - Type of filter ('all', 'today', 'week', 'month', 'custom')
 * @param {string} customDate - Custom date string (YYYY-MM-DD) for custom filter
 */
export function filterHistoryByDate(filterType, customDate = null) {
  if (!allHistoryEntries || allHistoryEntries.length === 0) {
    return;
  }
  
  let filteredEntries = [];
  
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