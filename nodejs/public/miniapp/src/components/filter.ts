// public/miniapp/src/components/filter.ts
/**
 * Filter component functionality
 */
import { DateFilterOption } from '../types';
import { formatDateForInput } from '../utils/dateUtils';
import { filterHistoryByDate } from './history';

/**
 * Initialize date filtering controls
 */
export function initDateFiltering(): void {
  const dateFilter = document.getElementById('date-filter') as HTMLSelectElement;
  const customDateContainer = document.getElementById('custom-date-container');
  const customDateInput = document.getElementById('custom-date') as HTMLInputElement;
  const applyDateButton = document.getElementById('apply-date');
  
  if (!dateFilter || !customDateContainer || !customDateInput || !applyDateButton) {
    console.error('Date filter elements not found in the DOM');
    return;
  }
  
  // Set today's date as the default for custom date
  const today = new Date();
  const formattedDate = formatDateForInput(today);
  customDateInput.value = formattedDate;
  
  // Handle filter change
  dateFilter.addEventListener('change', () => {
    const selectedOption = dateFilter.value as DateFilterOption;
    
    if (selectedOption === 'custom') {
      customDateContainer.style.display = 'flex';
    } else {
      customDateContainer.style.display = 'none';
      // Apply filter immediately for non-custom options
      filterHistoryByDate(selectedOption);
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