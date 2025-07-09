// src/api/client.ts
interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.timeout = options.timeout || 10000;
  }

  private async request(endpoint: string, options: RequestOptions = { method: 'GET' }): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body && options.method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

    try {
      config.signal = controller.signal;
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async get(endpoint: string, headers?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, { method: 'GET', headers });
  }

  async post(endpoint: string, body?: any, headers?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, { method: 'POST', body, headers });
  }

  async put(endpoint: string, body?: any, headers?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, { method: 'PUT', body, headers });
  }

  async delete(endpoint: string, headers?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

// Create singleton instance
export const apiClient = new ApiClient({
  baseUrl: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
  timeout: 10000
});

// Helper functions for common API operations
export const apiHelpers = {
  /**
   * Handle API response with error checking
   */
  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as T;
    }
    
    return response.text() as unknown as T;
  },

  /**
   * Get with automatic error handling
   */
  async safeGet<T>(endpoint: string): Promise<T> {
    const response = await apiClient.get(endpoint);
    return apiHelpers.handleResponse<T>(response);
  },

  /**
   * Post with automatic error handling
   */
  async safePost<T>(endpoint: string, body?: any): Promise<T> {
    const response = await apiClient.post(endpoint, body);
    return apiHelpers.handleResponse<T>(response);
  }
};