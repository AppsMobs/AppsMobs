import { dialog, BrowserWindow } from 'electron';

/**
 * Show an alert dialog
 * @param {BrowserWindow} parentWindow - Parent window (optional)
 * @param {string} title - Dialog title
 * @param {string} message - Message to display
 * @param {string} type - 'none' | 'info' | 'error' | 'question' | 'warning'
 */
export async function showAlert(parentWindow, title, message, type = 'info') {
  return await dialog.showMessageBox(parentWindow || null, {
    type,
    title,
    message,
    buttons: ['OK'],
    defaultId: 0,
    cancelId: 0
  });
}

/**
 * Show a confirmation dialog
 * @param {BrowserWindow} parentWindow - Parent window (optional)
 * @param {string} title - Dialog title
 * @param {string} message - Message to display
 * @param {Array<string>} buttons - Button labels (default: ['Yes', 'No'])
 * @returns {Promise<number>} Index of clicked button
 */
export async function showConfirm(parentWindow, title, message, buttons = ['Yes', 'No']) {
  const result = await dialog.showMessageBox(parentWindow || null, {
    type: 'question',
    title,
    message,
    buttons,
    defaultId: 0,
    cancelId: buttons.length - 1
  });
  return result.response;
}

/**
 * Show a prompt dialog (input text)
 * Note: Electron doesn't have native prompt, so we'll use a custom window
 * For now, returns a simple input via dialog
 * @param {BrowserWindow} parentWindow - Parent window
 * @param {string} title - Dialog title
 * @param {string} message - Message to display
 * @param {string} defaultValue - Default input value
 * @returns {Promise<string|null>} Entered text or null if cancelled
 */
export async function showPrompt(parentWindow, title, message, defaultValue = '') {
  // For Electron, we need to create a custom modal window for text input
  // This is a simplified version - can be enhanced with a custom HTML dialog
  return new Promise((resolve) => {
    // Create a simple input window
    const inputWindow = new BrowserWindow({
      parent: parentWindow,
      modal: true,
      width: 400,
      height: 200,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // In a real implementation, load an HTML file with input form
    // For now, use dialog with a workaround
    dialog.showMessageBox(parentWindow || null, {
      type: 'question',
      title,
      message: `${message}\n\n(Note: Full input dialog requires custom implementation)`,
      buttons: ['OK'],
      defaultId: 0
    }).then(() => {
      resolve(defaultValue); // Placeholder - implement custom input window
    });
  });
}

/**
 * Show a custom modal window
 * @param {BrowserWindow} parentWindow - Parent window
 * @param {Object} options - Modal options
 * @returns {Promise<BrowserWindow>} Modal window instance
 */
export function createModal(parentWindow, options = {}) {
  const {
    width = 600,
    height = 400,
    title = 'Modal',
    url = null,
    htmlContent = null
  } = options;

  const modal = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    width,
    height,
    resizable: options.resizable !== false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: options.preload
    },
    title
  });

  if (url) {
    modal.loadURL(url);
  } else if (htmlContent) {
    modal.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  }

  return modal;
}

