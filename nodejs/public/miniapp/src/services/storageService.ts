// public/miniapp/src/components/storageService.ts
/**
 * Storage service for managing local data persistence
 */

/**
 * Save data to localStorage with a prefix
 * 
 * @param key - The key to store the data under
 * @param data - The data to store
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    const storageKey = `thyknow_${key}`;
    const serializedData = JSON.stringify(data);
    localStorage.setItem(storageKey, serializedData);
  } catch (error) {
    console.error(`Error saving data to localStorage (${key}):`, error);
  }
}

/**
 * Load data from localStorage
 * 
 * @param key - The key to retrieve data from
 * @param defaultValue - Default value if the key doesn't exist
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = `thyknow_${key}`;
    const serializedData = localStorage.getItem(storageKey);
    
    if (serializedData === null) {
      return defaultValue;
    }
    
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading data from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * 
 * @param key - The key to remove
 */
export function removeFromStorage(key: string): void {
  try {
    const storageKey = `thyknow_${key}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Error removing data from localStorage (${key}):`, error);
  }
}

/**
 * Clear all ThyKnow data from localStorage
 */
export function clearAllStorageData(): void {
  try {
    // Get all keys
    const keys = Object.keys(localStorage);
    
    // Filter ThyKnow keys
    const thyknowKeys = keys.filter(key => key.startsWith('thyknow_'));
    
    // Remove each key
    thyknowKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleared ${thyknowKeys.length} storage items`);
  } catch (error) {
    console.error('Error clearing storage data:', error);
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = 'thyknow_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
}

/**
 * User preferences storage object
 */
export const userPreferences = {
  /**
   * Save theme preference
   */
  saveThemePreference(isDarkMode: boolean): void {
    saveToStorage('theme', isDarkMode ? 'dark' : 'light');
  },
  
  /**
   * Load theme preference
   */
  loadThemePreference(): 'dark' | 'light' | null {
    if (!isStorageAvailable()) return null;
    return loadFromStorage<'dark' | 'light' | null>('theme', null);
  },
  
  /**
   * Save filter preference
   */
  saveFilterPreference(filter: string, customDate?: string): void {
    saveToStorage('filter', { filter, customDate });
  },
  
  /**
   * Load filter preference
   */
  loadFilterPreference(): { filter: string; customDate?: string } {
    return loadFromStorage('filter', { filter: 'all' });
  }
};