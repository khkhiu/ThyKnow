// nodejs/public/miniapp/src/utils/formatters.ts

/**
 * Format a date as a readable string
 * @param dateString - Date string to format
 * @returns Formatted date
 */
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date for input elements (YYYY-MM-DD)
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to local date object
 * @param dateString - ISO date string
 * @returns Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is within this week
 * @param date - Date to check
 * @returns True if date is within this week
 */
export function isThisWeek(date: Date): boolean {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  firstDayOfWeek.setHours(0, 0, 0, 0); // Set to beginning of day
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // End of week (Saturday)
  lastDayOfWeek.setHours(23, 59, 59, 999); // Set to end of day
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

/**
 * Check if a date is within this month
 * @param date - Date to check
 * @returns True if date is within this month
 */
export function isThisMonth(date: Date): boolean {
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Safely process text with line breaks
 * @param text - Text to process
 * @returns Processed text
 */
export function processTextWithLineBreaks(text: string | null | undefined): string {
  if (!text) return '';
  
  // First, escape any HTML to prevent XSS
  const escapeHtml = (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  // Return the escaped text - line breaks will be handled by CSS
  return escapeHtml(text);
}