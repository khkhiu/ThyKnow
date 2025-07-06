// File: public/miniapp/src/components/ui/notifications.ts
// Notification system

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export function showNotification(message: string, type: NotificationType = 'info', duration: number = 4000): void {
  const container = getNotificationContainer();
  const notification = createNotificationElement(message, type);
  
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto remove
  setTimeout(() => {
    removeNotification(notification);
  }, duration);
}

function getNotificationContainer(): HTMLElement {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  return container;
}

function createNotificationElement(message: string, type: NotificationType): HTMLElement {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <div class="notification-icon">${icons[type]}</div>
    <div class="notification-message">${message}</div>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  return notification;
}

function removeNotification(notification: HTMLElement): void {
  notification.classList.add('hide');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

export function showError(message: string): void {
  const errorElement = document.getElementById('error');
  const errorText = document.getElementById('error-text');
  
  if (errorElement && errorText) {
    errorText.textContent = message;
    errorElement.style.display = 'block';
  }
}

export function hideError(): void {
  const errorElement = document.getElementById('error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}