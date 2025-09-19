// ==================================================
// src/components/ui/LoadingSpinner.tsx
// Loading spinner component
// ==================================================

import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color 
}) => {
  return (
    <div 
      className={`${styles.spinner} ${styles[size]}`}
      style={color ? { borderTopColor: color } : undefined}
    />
  );
};