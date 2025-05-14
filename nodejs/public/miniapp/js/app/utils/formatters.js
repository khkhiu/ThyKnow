// formatters.js - Utility functions for formatting dates and text

/**
 * Format a date as a readable string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date for input elements (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to local date object
 * @param {string} dateString - ISO date string
 * @returns {Date} Date object
 */
export function parseISODate(dateString) {
  return new Date(dateString);
}

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is within this week
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is within this week
 */
export function isThisWeek(date) {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // End of week (Saturday)
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

/**
 * Check if a date is within this month
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is within this month
 */
export function isThisMonth(date) {
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Safely process text with line breaks
 * @param {string} text - Text to process
 * @returns {string} Processed text
 */
export function processTextWithLineBreaks(text) {
  if (!text) return '';
  
  // First, escape any HTML to prevent XSS
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  // Return the escaped text - line breaks will be handled by CSS
  return escapeHtml(text);
}