const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getDevices: () => ipcRenderer.invoke('get-devices'),
  setupDevice: (serial) => ipcRenderer.invoke('setup-device', serial),
  openScrcpy: (serial) => ipcRenderer.invoke('open-scrcpy', serial),
  captureScreenshot: (serial, dir) => ipcRenderer.invoke('capture-screenshot', { serial, dir }),
  loadScripts: (dir) => ipcRenderer.invoke('load-scripts', dir),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  readFileText: (path) => ipcRenderer.invoke('read-file-text', { path }),
  runScriptOnDevices: (scriptFile, serials, options) => ipcRenderer.invoke('run-script-on-devices', { scriptFile, serials, options }),
  stopAllScripts: () => ipcRenderer.invoke('stop-all-scripts'),
  onScriptLog: (cb) => ipcRenderer.on('script-log', (_e, payload) => cb(payload)),
  onScriptExit: (cb) => ipcRenderer.on('script-exit', (_e, payload) => cb(payload)),
  verifyLicense: (email, key) => ipcRenderer.invoke('verify-license', { email, key }),
  checkLicenseStatus: () => ipcRenderer.invoke('check-license-status'),
  chooseDirectory: () => ipcRenderer.invoke('choose-directory'),
  saveFile: (content, defaultPath) => ipcRenderer.invoke('save-file', { content, defaultPath }),
  saveUserProfile: (profile) => ipcRenderer.invoke('save-user-profile', profile),
  deviceAction: (serial, action, value) => ipcRenderer.invoke('device-action', { serial, action, value }),
  deleteScript: (filePath) => ipcRenderer.invoke('delete-script', { filePath }),
  duplicateScript: (filePath) => ipcRenderer.invoke('duplicate-script', { filePath }),
  showSaveDialog: (opts) => ipcRenderer.invoke('show-save-dialog', opts),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // APIs d'authentification
  authenticateUser: (email, licenseKey) => ipcRenderer.invoke('authenticate-user', { email, licenseKey }),
  setAuthData: (authData) => ipcRenderer.invoke('set-auth-data', authData),
  closeAuthWindow: () => ipcRenderer.invoke('close-auth-window'),
  checkAuthStatus: () => ipcRenderer.invoke('check-auth-status'),
  logout: () => ipcRenderer.invoke('logout'),
  
  // Système de notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  showNotificationInfo: (title, body, options) => ipcRenderer.invoke('show-notification-info', title, body, options),
  showNotificationSuccess: (title, body, options) => ipcRenderer.invoke('show-notification-success', title, body, options),
  showNotificationWarning: (title, body, options) => ipcRenderer.invoke('show-notification-warning', title, body, options),
  showNotificationError: (title, body, options) => ipcRenderer.invoke('show-notification-error', title, body, options),
  
  // Système de popups
  showAlert: (title, message, type) => ipcRenderer.invoke('show-alert', title, message, type),
  showConfirm: (title, message, buttons) => ipcRenderer.invoke('show-confirm', title, message, buttons),
  createModal: (options) => ipcRenderer.invoke('create-modal', options)
});