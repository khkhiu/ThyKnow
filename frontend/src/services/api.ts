// frontend/src/services/api.ts
const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';

export const apiClient = {
  get: (url: string) => fetch(`${API_BASE}${url}`).then(res => res.json()),
  post: (url: string, data: any) => 
    fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  // ... other methods
};