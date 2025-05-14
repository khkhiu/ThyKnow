// public/miniapp/src/utils/dateUtils.ts
/**
 * Date utility functions
 */

/**
 * Format date as YYYY-MM-DD for date input
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date in human-readable format
 */
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

/**
 * Parse ISO date string to local date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is within this week
 */
export function isThisWeek(date: Date): boolean {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // End of week (Saturday)
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

/**
 * Check if a date is within this month
 */
export function isThisMonth(date: Date): boolean {
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}