// src/components/NotificationContainer.tsx
// UI component for displaying notifications
import React from 'react';
import { useNotificationsContext } from '../context/NotificationsContext';
import { NotificationItem } from './NotificationItem';

export const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotificationsContext();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={hideNotification}
        />
      ))}
    </div>
  );
};