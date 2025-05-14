// public/miniapp/src/components/notification.ts
/**
 * Notification component functionality
 */
import { NotificationType } from '../types';

/**
 * Show a notification message
 * 
 * @param message - The message to display
 * @param type - Notification type (success, error, warning, info)
 * @param duration - How long to show the notification (in ms)
 */
export function showNotification(message: string, type: NotificationType = 'success', duration: number = 3000): void {
  // Check if notification container exists
  let notificationContainer = document.getElementById('notification-container');
  
  // Create it if it doesn't exist
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.bottom = '20px';
    notificationContainer.style.left = '50%';
    notificationContainer.style.transform = 'translateX(-50%)';
    notificationContainer.style.zIndex = '1000';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Set notification styles based on type
  switch(type) {
    case 'success':
      notification.style.backgroundColor = 'var(--success-color)';
      break;
    case 'error':
      notification.style.backgroundColor = 'var(--danger-color)';
      break;
    case 'warning':
      notification.style.backgroundColor = 'var(--warning-color)';
      break;
    case 'info':
    default:
      notification.style.backgroundColor = 'var(--primary-color)';
      break;
  }
  
  // Additional styles
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = 'var(--border-radius)';
  notification.style.marginBottom = '10px';
  notification.style.boxShadow = 'var(--box-shadow)';
  notification.style.opacity = '0';
  notification.style.transition = 'opacity 0.3s ease';
  
  // Add message
  notification.textContent = message;
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    notification.style.opacity = '0';
    
    // Remove from DOM after fade out
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
}

/**
 * Dismiss all notifications
 */
export function dismissAllNotifications(): void {
  const notificationContainer = document.getElementById('notification-container');
  if (notificationContainer) {
    notificationContainer.innerHTML = '';
  }
}