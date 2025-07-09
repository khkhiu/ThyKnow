// src/components/HistoryList.tsx
import React from 'react';
import { JournalEntry } from '../types/miniapp';

interface HistoryListProps {
  entries: JournalEntry[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  entries,
  isLoading,
  onRefresh
}) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="history-loading">
        <div className="loading-spinner"></div>
        <p>Loading your journal entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="history-empty">
        <div className="empty-icon">📝</div>
        <h3>No journal entries yet</h3>
        <p>Start reflecting to see your entries here!</p>
        <button className="btn btn-primary" onClick={onRefresh}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="history-list">
      <div className="history-header">
        <h3>Your Journal History</h3>
        <button className="btn btn-link" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="history-entries">
        {entries.map((entry) => (
          <div key={entry.id} className="history-entry">
            <div className="entry-header">
              <div className="entry-date">
                <span className="date">{formatDate(entry.timestamp)}</span>
                <span className="time">{formatTime(entry.timestamp)}</span>
              </div>
              {entry.type && (
                <span className="entry-type">{entry.type}</span>
              )}
            </div>
            
            <div className="entry-content">
              <div className="entry-prompt">
                <strong>Prompt:</strong> {entry.prompt}
              </div>
              <div className="entry-response">
                <strong>Response:</strong> {entry.response}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};