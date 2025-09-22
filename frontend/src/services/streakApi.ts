// ==================================================
// src/services/streakApi.ts
// API service for streak data
// ==================================================

import { StreakApiResponse, WeeklyRewardsResponse } from '../types/streak';

class StreakApiService {
  private baseUrl = '/api/miniapp';

  async getStreakData(userId: string): Promise<StreakApiResponse> {
    const response = await fetch(`${this.baseUrl}/streak/${userId}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async submitWeeklyResponse(userId: string, response: string): Promise<WeeklyRewardsResponse> {
    const res = await fetch(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({
        userId,
        response,
        type: 'weekly'
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  async getMilestones(): Promise<{ milestones: Array<{ weeks: number; title: string; reward: number; description: string }> }> {
    const response = await fetch(`${this.baseUrl}/milestones`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private getAuthHeaders(): Record<string, string> {
    // Add Telegram auth headers if available
    const headers: Record<string, string> = {};
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
    }
    
    return headers;
  }
}

export const streakApi = new StreakApiService();