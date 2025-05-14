// js/app/ui/notifications.js - Notification system

import { TIMING } from '../config.js';

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success' or 'error')
 */
export function showNotification(message, type = 'success') {
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
  notification.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
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
  }, TIMING.NOTIFICATION_DURATION);
}

/**
 * Show error
 * @param {string} message - Error message
 */
export function showError(message) {
  // Hide loading and content containers
  const loadingElement = document.getElementById('loading');
  const contentElement = document.getElementById('content');
  
  if (loadingElement) loadingElement.style.display = 'none';
  if (contentElement) contentElement.style.display = 'none';
  
  // Set error message
  const errorMessage = document.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = message;
  }
  
  // Show error container
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.style.display = 'block';
  }
}