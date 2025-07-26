// ==================================================
// src/components/ui/ErrorDisplay.tsx
// Error display component
// ==================================================

import React from 'react';
import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <div className={styles.message}>
        {message}
      </div>
      {showRetry && onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          <i className="fas fa-redo"></i>
          Try Again
        </button>
      )}
    </div>
  );
};
