// public/miniapp/src/utils/dateUtils.ts
/**
 * UI utility functions
 */
import { NotificationType } from '../types';

/**
 * Show element by ID
 */
export function showElement(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'block';
  }
}

/**
 * Hide element by ID
 */
export function hideElement(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Show notification
 */
export function showNotification(message: string, type: NotificationType = 'success'): void {
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
  }, 3000);
}

/**
 * Show error message
 */
export function showError(message: string): void {
  hideElement('loading');
  hideElement('content');
  
  const errorMessage = document.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = message;
  }
  
  showElement('error');
}

/**
 * Process text with line breaks safely
 */
export function processTextWithLineBreaks(text: string): string {
  if (!text) return '';
  
  // First, escape any HTML to prevent XSS
  const escapeHtml = (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  // Return the escaped text - line breaks will be handled by CSS
  return escapeHtml(text);
}