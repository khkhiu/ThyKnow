// src/components/NotificationItem.tsx
// Individual notification component
import React from 'react';
import type { Notification } from '../hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onHide: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onHide 
}) => {
  return (
    <div className={`notification notification--${notification.type}`}>
      <div className="notification__content">
        <span className="notification__message">{notification.message}</span>
        <button
          className="notification__close"
          onClick={() => onHide(notification.id)}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};
