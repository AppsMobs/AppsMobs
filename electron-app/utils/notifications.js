import { Notification } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Show a native desktop notification
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification message
 * @param {string} options.type - Type: 'info' | 'success' | 'warning' | 'error'
 * @param {string} options.icon - Optional icon path
 * @param {boolean} options.silent - Whether to play sound
 * @param {Array} options.actions - Optional action buttons (Windows)
 */
export function showNotification(options) {
  if (!Notification.isSupported()) {
    console.warn('Desktop notifications not supported');
    return null;
  }

  const { title, body, type = 'info', icon, silent = false, actions = [] } = options;

  // Determine icon based on type if not provided
  let notificationIcon = icon;
  if (!notificationIcon) {
    const iconPath = path.join(__dirname, '..', 'assets', 'icons', 'Logo.png');
    notificationIcon = iconPath;
  }

  const notification = new Notification({
    title: title || 'AppsMobs',
    body,
    icon: notificationIcon,
    silent,
    urgency: type === 'error' ? 'critical' : 'normal',
    actions: actions.length > 0 ? actions : undefined,
    timeoutType: type === 'error' ? 'never' : 'default'
  });

  notification.show();
  return notification;
}

/**
 * Show info notification
 */
export function showInfo(title, body, options = {}) {
  return showNotification({ title, body, type: 'info', ...options });
}

/**
 * Show success notification
 */
export function showSuccess(title, body, options = {}) {
  return showNotification({ title, body, type: 'success', ...options });
}

/**
 * Show warning notification
 */
export function showWarning(title, body, options = {}) {
  return showNotification({ title, body, type: 'warning', ...options });
}

/**
 * Show error notification
 */
export function showError(title, body, options = {}) {
  return showNotification({ title, body, type: 'error', ...options });
}

