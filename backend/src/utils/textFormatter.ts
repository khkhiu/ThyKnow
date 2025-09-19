// utils/textFormatter.ts
// Utility functions for formatting text in the UI

/**
 * Converts underscore-separated strings to properly formatted display text
 * Example: "additional_weekly_entry" -> "Additional Weekly Entry"
 */
export function formatUnderscoreText(text: string): string {
  if (!text) return '';
  
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts camelCase strings to properly formatted display text
 * Example: "additionalWeeklyEntry" -> "Additional Weekly Entry"
 */
export function formatCamelCaseText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Smart formatter that handles both underscore and camelCase
 * Automatically detects the format and applies appropriate conversion
 */
export function formatDisplayText(text: string): string {
  if (!text) return '';
  
  // Check if text contains underscores
  if (text.includes('_')) {
    return formatUnderscoreText(text);
  }
  
  // Check if text is camelCase (has uppercase letters that aren't at the start)
  if (/[a-z][A-Z]/.test(text)) {
    return formatCamelCaseText(text);
  }
  
  // If it's already formatted or just a single word, capitalize first letter
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format field names for stats display with special handling for common terms
 */
export function formatStatsLabel(fieldName: string): string {
  const formatted = formatDisplayText(fieldName);
  
  // Handle special cases for better readability
  const specialCases: { [key: string]: string } = {
    'Additional Weekly Entry': 'Additional Weekly Entry',
    'Multiple Entry Bonus': 'Multiple Entry Bonus',
    'Weekly Entry': 'Weekly Entry',
    'Streak Week': 'Streak Week',
    'Week Id': 'Week ID',
    'User Id': 'User ID',
    'Points Earned': 'Points Earned',
    'Milestone Reached': 'Milestone Reached',
    'Streak Broken': 'Streak Broken',
    'Is New Record': 'New Record',
    'Is Multiple Entry': 'Multiple Entry',
    'Has Entry This Week': 'Has Entry This Week',
    'Weeks Until Next Milestone': 'Weeks Until Next Milestone',
    'Next Milestone Reward': 'Next Milestone Reward'
  };
  
  return specialCases[formatted] || formatted;
}

/**
 * Format reason text for points history display
 */
export function formatPointsReason(reason: string): string {
  if (!reason) return '';
  
  // Handle specific reason patterns
  if (reason.includes('weekly_reflection')) {
    return 'Weekly Reflection';
  }
  
  if (reason.includes('additional_weekly_entry')) {
    return 'Additional Weekly Entry';
  }
  
  if (reason.includes('streak_bonus')) {
    return 'Streak Bonus';
  }
  
  if (reason.includes('milestone')) {
    const milestoneMatch = reason.match(/(\d+)/);
    if (milestoneMatch) {
      return `${milestoneMatch[1]}-Week Milestone`;
    }
    return 'Milestone Achievement';
  }
  
  if (reason.includes('multiple_entry_bonus')) {
    return 'Multiple Entry Bonus';
  }
  
  // Fallback to general formatting
  return formatDisplayText(reason);
}

/**
 * Format week identifier for display
 * Example: "2025-W03" -> "Week 3, 2025"
 */
export function formatWeekIdentifier(weekId: string): string {
  if (!weekId || !weekId.includes('-W')) {
    return weekId;
  }
  
  const [year, week] = weekId.split('-W');
  const weekNumber = parseInt(week, 10);
  
  return `Week ${weekNumber}, ${year}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format number with commas for better readability
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Convert object keys to display-friendly format
 * Useful for displaying API response data in the Stats tab
 */
export function formatObjectForDisplay(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const formatted: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const formattedKey = formatStatsLabel(key);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      formatted[formattedKey] = formatObjectForDisplay(value);
    } else if (typeof value === 'string' && (key.includes('reason') || key.includes('type'))) {
      formatted[formattedKey] = formatPointsReason(value);
    } else if (typeof value === 'string' && key.includes('week') && value.includes('-W')) {
      formatted[formattedKey] = formatWeekIdentifier(value);
    } else if (typeof value === 'string' && (key.includes('timestamp') || key.includes('date'))) {
      formatted[formattedKey] = formatTimestamp(value);
    } else if (typeof value === 'number' && key.includes('points')) {
      formatted[formattedKey] = formatNumber(value);
    } else {
      formatted[formattedKey] = value;
    }
  }
  
  return formatted;
}