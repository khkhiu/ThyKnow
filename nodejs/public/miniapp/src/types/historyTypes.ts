// public/miniapp/src/types/historyTypes.ts
export interface HistoryEntry {
  id: number;
  date: string;
  promptType: 'self_awareness' | 'connections';
  prompt: string;
  response: string;
}

// Filter options for history entries
export type DateFilterOption = 'all' | 'today' | 'week' | 'month' | 'custom';

// User date preference for filtering
export interface DateFilterPreference {
  option: DateFilterOption;
  customDate?: string;
}