// AppsMobs Pro - Electron Renderer
// Initialization complete

// State management
let devices = [];
let scripts = [];
let selectedDevices = new Set();
let selectedScripts = new Set();
const runningScripts = new Map(); // serial -> { name, start }
let notifications = []; // {id,type,title,message,ts}
let notificationsEnabled = true;
let soundAlertsEnabled = true;
let autoRefreshEnabled = true;
let autoRefreshInterval = null;
const recentExitSerials = new Set(); // to avoid duplicate stopped after exit
const lastNotifAt = new Map(); // key -> timestamp for rate limit
const pausedSerials = new Set(); // serials with scripts marked as paused (UI-level)
const favoriteScripts = new Set(); // favorite script names
const recentScripts = []; // {name, timestamp} - last 10
let currentScriptFilter = 'all'; // 'all', 'favorites', 'recent'

// Keyboard shortcuts management
const defaultShortcuts = {
  'run_selected': { key: 'F5', action: () => runScriptSelected() },
  'pause_selected': { key: 'F6', action: () => pauseSelected() },
  'resume_selected': { key: 'F7', action: () => resumeSelected() },
  'stop_all': { key: 'F8', action: () => stopAll() },
  'screenshot': { key: 'F9', action: () => captureScreenshotSelected() },
  'scrcpy': { key: 'F10', action: () => openScrcpySelected() },
  'refresh_devices': { key: 'F11', action: () => refreshDevices() }
};

let customShortcuts = {};

// DOM elements
const devicesGrid = document.getElementById('devices-grid');
const controlDevicesGrid = document.getElementById('control-devices-grid');
const scriptsGrid = document.getElementById('scripts-grid');
const consoleOutput = document.getElementById('console-output');
const statusElement = document.getElementById('status');
const devicesSearchInput = document.getElementById('devices-search');
const scriptsSearchInput = document.getElementById('scripts-search');
// Notification DOM
const notificationsBtn = document.getElementById('notifications-btn');
const notificationsBadge = document.getElementById('notifications-badge');
const notificationsPanel = document.getElementById('notifications-panel');

// Stats elements
const devicesCount = document.getElementById('devices-count');
const scriptsCount = document.getElementById('scripts-count');
const runningCount = document.getElementById('running-count');

  // Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadInitialData();
  loadSettings();
  checkLicenseStatus();
  updateLicenseWarning();
  setupNotificationsUI();
  loadFavoriteScripts();
  loadRecentScripts();
  updateFilterButtons();
  // Load current version
  if (window.electronAPI && window.electronAPI.getAppVersion) {
    window.electronAPI.getAppVersion().then(version => {
      const el = document.getElementById('current-version');
      if (el) el.textContent = `v${version}`;
      const side = document.getElementById('sidebar-version');
      if (side) side.textContent = `v${version}`;
    }).catch(() => {});
  }
  // Load header logo from packaged assets
  try {
    const img = document.getElementById('appHeaderLogo');
    if (img && window.electronAPI && window.electronAPI.getAssetPath) {
      window.electronAPI.getAssetPath('icons/Logo.png').then(url => {
        if (url && url !== 'null') {
          img.src = url;
          img.style.display = 'block';
          img.onerror = () => {
            window.electronAPI.getAssetPath('icons/Logo.ico').then(icoUrl => {
              if (icoUrl && icoUrl !== 'null') {
                img.src = icoUrl;
              }
            }).catch(() => {
              img.src = '../assets/icons/Logo.png';
            });
          };
        } else {
          img.src = '../assets/icons/Logo.png';
        }
      }).catch(() => {
        img.src = '../assets/icons/Logo.png';
      });
    } else if (img) {
      img.src = '../assets/icons/Logo.png';
    }
  } catch {}
  // Inline toast container
  try {
    const existing = document.getElementById('inline-toast-container');
    if (!existing) {
      const c = document.createElement('div');
      c.id = 'inline-toast-container';
      c.className = 'inline-toast-container';
      document.body.appendChild(c);
      // Position once created so it's aligned from the start
      try { positionInlineToastContainer(); } catch {}
    }
  } catch {}

  // Charger section Profil si le bouton existe
  try {
    const profileBtn = document.querySelector('.nav-btn[data-section="profile"]');
    if (profileBtn) {
      const profileSection = document.createElement('div');
      profileSection.className = 'content-section hidden';
      profileSection.id = 'profile-section';
      fetch('profile.html').then(r => r.text()).then(html => {
        profileSection.innerHTML = html;
      }).catch(() => {
        profileSection.innerHTML = '<div class="card glass" style="margin:20px; padding:20px;">Profil indisponible</div>';
      });
      document.querySelector('main').appendChild(profileSection);
    }
  } catch {}
  
  // Make test function available globally for debugging (only in dev)
  setTimeout(() => {
    window.testLicenseModal = testLicenseModal;
  }, 1000);
});

function setupNotificationsUI(){
  if (!notificationsBtn) return;
  // Ensure the notifications panel is portaled to <body> so it isn't affected
  // by parent stacking contexts or overflow rules. Keep original node but move it once.
  try {
    if (notificationsPanel && notificationsPanel.parentElement !== document.body) {
      document.body.appendChild(notificationsPanel);
      // Make sure it stays on top of everything
      notificationsPanel.style.position = 'fixed';
      notificationsPanel.style.zIndex = '2147483647';
    }
  } catch {}
  notificationsBtn.addEventListener('click', () => {
    if (notificationsPanel) notificationsPanel.classList.toggle('hidden');
    if (notificationsPanel && !notificationsPanel.classList.contains('hidden')) {
      positionNotificationsPanel();
      renderNotifications();
    }
  });
  document.addEventListener('click', (e) => {
    try {
      if (!notificationsPanel) return;
      if (!notificationsPanel.contains(e.target) && e.target !== notificationsBtn) {
        notificationsPanel.classList.add('hidden');
      }
    } catch {}
  });
  window.addEventListener('resize', () => { if (notificationsPanel && !notificationsPanel.classList.contains('hidden')) positionNotificationsPanel(); });
  window.addEventListener('scroll', () => { if (notificationsPanel && !notificationsPanel.classList.contains('hidden')) positionNotificationsPanel(); }, true);
  // Keep inline toast container anchored under the bell as well
  window.addEventListener('resize', positionInlineToastContainer);
  window.addEventListener('scroll', positionInlineToastContainer, true);
}

function shouldNotify(key, windowMs = 3000){
  try {
    const now = Date.now();
    const last = lastNotifAt.get(key) || 0;
    if (now - last < windowMs) return false;
    lastNotifAt.set(key, now);
    return true;
  } catch { return true; }
}

function playSound(type = 'info') {
  if (!soundAlertsEnabled) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different types
    const frequencies = {
      success: 523.25, // C5
      error: 220.00,   // A3
      warning: 349.23, // F4
      info: 440.00     // A4
    };
    
    oscillator.frequency.value = frequencies[type] || frequencies.info;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Fallback: use beep if AudioContext not available
    console.log('Sound alert:', type);
  }
}

function pushNotification(type, title, message){
  if (!notificationsEnabled) return;
  const key = `${type}|${title}|${message}`;
  if (!shouldNotify(key)) return;
  const item = { id: Date.now() + Math.random(), type, title, message, ts: new Date() };
  notifications.unshift(item);
  if (notificationsBadge) {
    notificationsBadge.textContent = String(Math.min(99, notifications.length));
    notificationsBadge.classList.toggle('hidden', notifications.length === 0);
  }
  renderNotifications();
  playSound(type);
}

function renderNotifications(){
  if (!notificationsPanel) return;
  notificationsPanel.innerHTML = notifications.map(n => `
    <div class="notification-item" role="listitem">
      <div><span class="material-symbols-outlined">${n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'check_circle' : 'notifications'}</span></div>
      <div>
        <div class="notification-title">${n.title}</div>
        <div class="notification-meta">${n.message} · ${n.ts.toLocaleTimeString()}</div>
      </div>
    </div>
  `).join('');
}

function positionNotificationsPanel(){
  try {
    const btn = notificationsBtn;
    const panel = notificationsPanel;
    if (!btn || !panel) return;
    const r = btn.getBoundingClientRect();
    const panelWidth = panel.offsetWidth || 320;
    const left = Math.max(8, Math.min(window.innerWidth - panelWidth - 8, r.left + (r.width - panelWidth)));
    panel.style.top = `${r.bottom + 8}px`;
    panel.style.left = `${left}px`;
  } catch {}
}

function positionInlineToastContainer(){
  try {
    const c = document.getElementById('inline-toast-container');
    if (!c || !notificationsBtn) return;
    const r = notificationsBtn.getBoundingClientRect();
    const maxWidth = Math.min(540, Math.max(280, Math.floor(window.innerWidth * 0.4)));
    c.style.position = 'fixed';
    c.style.width = `${maxWidth}px`;
    c.style.top = `${r.bottom + 8}px`;
    // Right-align the toast stack with the bell icon
    const cWidth = c.offsetWidth || maxWidth;
    const left = Math.max(8, Math.min(window.innerWidth - cWidth - 8, r.left + r.width - cWidth));
    c.style.left = `${left}px`;
    c.style.transform = 'none';
    c.style.zIndex = '2147483647';
  } catch {}
}

function showInlineToast(type, title, message){
  try {
    if (!notificationsEnabled) return;
    const c = document.getElementById('inline-toast-container');
    if (!c) return;
    // Ensure it's anchored under the bell icon
    positionInlineToastContainer();
    const el = document.createElement('div');
    el.className = `inline-toast ${type}`;
    el.style.width = '100%';
    el.innerHTML = `<strong>${title}</strong><div style="font-size:12px;color:#8aa7bd;">${message}</div>`;
    c.appendChild(el);
    setTimeout(() => { try { c.removeChild(el); } catch {} }, 3000);
  } catch {}
}

// Add language initialization at top. Keep original code below.
let lang = 'en';
let translations = {};

async function loadLang(l) {
  lang = l;
  try {
    const res = await fetch(`./lang/${l}.json`);
    translations = await res.json();
  } catch {
    translations = { welcome: l };
  }
  if (typeof updateLocalizedUI === 'function') updateLocalizedUI();
  // Update language dropdown
  updateLanguageDropdown();
}
function t(key, options = {}) {
  let translated = translations[key] || key;
  if (options && typeof translated === 'string') {
    for (const [k, v] of Object.entries(options)) {
      // Support both {{key}} and {key}
      translated = translated.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
      translated = translated.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return translated;
}
function setLang(l) {
  localStorage.setItem('lang', l);
  loadLang(l);
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('lang');
  if (!saved) {
    loadLang('en'); // english by default
  } else {
    loadLang(saved);
  }
});

// In main DOMContentLoaded or separately after DOM loaded
window.addEventListener('DOMContentLoaded', async () => {
  // (Supprime l'appel de window.electronAPI.getAppVersion et la modification du contenu du sidebar-version)
});

// ==============================
// Per-device consoles
// ==============================
const serialToConsole = new Map();

function ensureConsolePanel(serial) {
  if (serialToConsole.has(serial)) return serialToConsole.get(serial);
  const dock = document.getElementById('console-dock');
  if (!dock) return null;

  const panel = document.createElement('div');
  panel.className = 'console-panel';
  const idx = serialToConsole.size;
  // Restore saved state if any
  const saved = loadConsoleState(serial);
  if (saved) {
    panel.style.left = saved.left;
    panel.style.top = saved.top;
    if (saved.width) panel.style.width = saved.width;
    if (saved.height) panel.style.height = saved.height;
    if (saved.minimized) panel.classList.add('minimized');
  } else {
    panel.style.left = `${24 + (idx * 30) % 200}px`;
    panel.style.top = `${80 + (idx * 24) % 160}px`;
  }

  panel.innerHTML = `
    <div class="console-header">
      <div class="console-title">🖥️ Console - ${serial}</div>
      <div class="console-actions">
        <button class="console-btn" data-action="min">–</button>
        <button class="console-btn" data-action="clear">Effacer</button>
        <button class="console-btn" data-action="close">✕</button>
      </div>
    </div>
    <div class="console-body" data-body></div>
  `;

  const header = panel.querySelector('.console-header');
  let dragging = false, ox = 0, oy = 0;
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.console-actions')) return;
    dragging = true; ox = e.clientX - panel.offsetLeft; oy = e.clientY - panel.offsetTop; e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return; panel.style.left = `${e.clientX - ox}px`; panel.style.top = `${e.clientY - oy}px`;
  });
  window.addEventListener('mouseup', () => { if (dragging) { dragging = false; saveConsoleState(serial); } });

  // Save state after manual resize (on mouseup is good enough)
  panel.addEventListener('mouseup', () => saveConsoleState(serial));

  panel.querySelector('.console-actions').addEventListener('click', (e) => {
    const btn = e.target.closest('.console-btn'); if (!btn) return;
    const action = btn.getAttribute('data-action');
    const body = panel.querySelector('[data-body]');
    if (action === 'min') { panel.classList.toggle('minimized'); saveConsoleState(serial); }
    if (action === 'clear' && body) { body.textContent = ''; }
    if (action === 'close') { panel.remove(); serialToConsole.delete(serial); localStorage.removeItem(consoleKey(serial)); }
  });

  dock.appendChild(panel);
  serialToConsole.set(serial, panel);
  return panel;
}

function appendConsoleLine(serial, text, level = 'INFO') {
  const panel = ensureConsolePanel(serial); if (!panel) return;
  const body = panel.querySelector('[data-body]'); if (!body) return;
  const line = document.createElement('div');
  line.className = `console-line ${level}`;
  line.textContent = text;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function consoleKey(serial) { return `appsMobs_console_${serial}`; }
function saveConsoleState(serial) {
  const panel = serialToConsole.get(serial); if (!panel) return;
  const state = {
    left: panel.style.left,
    top: panel.style.top,
    width: panel.style.width,
    height: panel.style.height,
    minimized: panel.classList.contains('minimized'),
  };
  try { localStorage.setItem(consoleKey(serial), JSON.stringify(state)); } catch {}
}
function loadConsoleState(serial) {
  try { const raw = localStorage.getItem(consoleKey(serial)); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function setupEventListeners() {
  const on = (id, evt, fn) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener(evt, fn);
    }
    // Debug seulement en mode debug
    // else if (document.getElementById('debug-mode').checked) {
    //   console.warn(id + ' not found');
    // }
  };
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  // Device actions - Refresh buttons (multiple instances)
  document.querySelectorAll('#refresh-btn, #control-refresh-btn, #header-refresh-btn').forEach(btn => {
    btn.addEventListener('click', refreshDevices);
  });
  on('setup-btn', 'click', setupSelectedDevices); // might not exist in Dashboard
  on('scrcpy-btn', 'click', openScrcpySelected);
  on('screenshot-btn', 'click', captureScreenshotSelected);
  on('ctrl-scrcpy', 'click', openScrcpySelected);
  on('ctrl-screenshot', 'click', captureScreenshotSelected);

  // Device controls -> generic dispatcher
  const callForSelection = async (action) => {
    if (selectedDevices.size === 0) { log('Sélectionnez des appareils', 'WARNING'); return; }
    for (const serial of selectedDevices) {
      const res = await window.electronAPI.deviceAction(serial, action);
      log(`[${serial}] ${action}: ${res.success ? 'OK' : 'Erreur'}`, res.success ? 'SUCCESS' : 'ERROR');
    }
  };
  on('ctrl-poweroff', 'click', () => callForSelection('poweroff'));
  on('ctrl-reboot', 'click', () => callForSelection('reboot'));
  on('ctrl-screen', 'click', () => callForSelection('screen_toggle'));
  on('ctrl-mute', 'click', () => callForSelection('mute'));
  on('ctrl-airplane-on', 'click', () => callForSelection('airplane_on'));
  on('ctrl-airplane-off', 'click', () => callForSelection('airplane_off'));
  on('ctrl-wifi-on', 'click', () => callForSelection('wifi_on'));
  on('ctrl-wifi-off', 'click', () => callForSelection('wifi_off'));
  on('ctrl-nav-back', 'click', () => callForSelection('nav_back'));
  on('ctrl-nav-home', 'click', () => callForSelection('nav_home'));
  on('ctrl-nav-recent', 'click', () => callForSelection('nav_recent'));
  on('ctrl-nav-menu', 'click', () => callForSelection('nav_menu'));

  // Sliders (volume & brightness)
  const controlState = {};
  const getState = (serial) => (controlState[serial] ||= { volume: 7, brightness: 128 });

  const volumeSlider = document.getElementById('volume-slider');
  const volumeValue = document.getElementById('volume-value');
  if (volumeSlider && volumeValue) {
    volumeSlider.addEventListener('input', async (e) => {
      const target = parseInt(e.target.value, 10);
      volumeValue.textContent = target;
      
      if (selectedDevices.size === 0) { 
        log('Sélectionnez des appareils', 'WARNING'); 
        return; 
      }
      
      for (const serial of selectedDevices) {
        const st = getState(serial);
        const diff = target - (st.volume ?? 7);
        if (diff === 0) continue;
        const action = diff > 0 ? 'volume_up' : 'volume_down';
        const steps = Math.abs(diff);
        for (let i = 0; i < steps; i++) {
          await window.electronAPI.deviceAction(serial, action);
        }
        st.volume = target;
        log(`[${serial}] volume -> ${target}`, 'DEBUG');
      }
    });
  }

  const brightnessSlider = document.getElementById('brightness-slider');
  const brightnessValue = document.getElementById('brightness-value');
  if (brightnessSlider && brightnessValue) {
    brightnessSlider.addEventListener('input', async (e) => {
      const target = parseInt(e.target.value, 10);
      brightnessValue.textContent = target;
      
      if (selectedDevices.size === 0) { 
        log('Sélectionnez des appareils', 'WARNING'); 
        return; 
      }
      
      for (const serial of selectedDevices) {
        const st = getState(serial);
        st.brightness = target;
        const res = await window.electronAPI.deviceAction(serial, 'set_brightness', target);
        log(`[${serial}] luminosité -> ${target} ${res.success ? '(OK)' : '(Erreur)'}`, res.success ? 'DEBUG' : 'ERROR');
      }
    });
  }

  // Script actions
  on('reload-scripts-btn', 'click', loadScripts);
  on('run-selected-btn', 'click', runScriptSelected);
  on('run-all-btn', 'click', runOnAll);
  on('stop-all-btn', 'click', stopAll);
  on('stop-selected-btn', 'click', stopSelected);
  // Pause/Resume controls (quick actions)
  on('pause-all-btn', 'click', pauseAll);
  on('pause-selected-btn', 'click', pauseSelected);
  on('resume-all-btn', 'click', resumeAll);
  on('resume-selected-btn', 'click', resumeSelected);

  // Console actions
  on('clear-console-btn', 'click', clearConsole);
  on('export-logs-btn', 'click', exportLogs);

  // Settings actions - with null checks
  const activateLicenseBtn = document.getElementById('activate-license-btn');
  const checkLicenseBtn = document.getElementById('check-license-btn');
  const closeLicenseModalBtn = document.getElementById('close-license-modal');
  const submitLicenseBtn = document.getElementById('submit-license');
  const activateLicenseBannerBtn = document.getElementById('activate-license-banner-btn');

  if (activateLicenseBtn) {
    activateLicenseBtn.addEventListener('click', openLicenseModal);
  }

  if (checkLicenseBtn) {
    checkLicenseBtn.addEventListener('click', checkLicenseStatus);
  }

  if (closeLicenseModalBtn) {
    closeLicenseModalBtn.addEventListener('click', closeLicenseModal);
  }

  if (submitLicenseBtn) {
    submitLicenseBtn.addEventListener('click', submitLicense);
  }

  if (activateLicenseBannerBtn) {
    activateLicenseBannerBtn.addEventListener('click', openLicenseModal);
  }

  // Scrcpy modal actions
  on('close-scrcpy-modal', 'click', closeScrcpyModal);
  on('cancel-scrcpy', 'click', closeScrcpyModal);
  on('confirm-scrcpy', 'click', confirmScrcpySelection);

  // Keyboard shortcuts modal
  on('open-shortcuts-modal-btn', 'click', openShortcutsModal);
  on('close-shortcuts-modal', 'click', closeShortcutsModal);

  // Settings toggles and sliders
  setupSettingsListeners();

  // Search (devices & scripts)
  if (devicesSearchInput) devicesSearchInput.addEventListener('input', filterDevices);
  const devicesSearchBtn = document.getElementById('devices-search-btn');
  if (devicesSearchBtn) devicesSearchBtn.addEventListener('click', filterDevices);

  if (scriptsSearchInput) scriptsSearchInput.addEventListener('input', filterScripts);
  const scriptsSearchBtn = document.getElementById('scripts-search-btn');
  if (scriptsSearchBtn) scriptsSearchBtn.addEventListener('click', filterScripts);
  
  // Script filters
  on('filter-favorites', 'click', () => { currentScriptFilter = 'favorites'; renderScripts(); updateFilterButtons(); });
  on('filter-recent', 'click', () => { currentScriptFilter = 'recent'; renderScripts(); updateFilterButtons(); });
  on('filter-all', 'click', () => { currentScriptFilter = 'all'; renderScripts(); updateFilterButtons(); });
  on('filter-favorites-section', 'click', () => { currentScriptFilter = 'favorites'; renderScripts(); updateFilterButtons(); });
  on('filter-recent-section', 'click', () => { currentScriptFilter = 'recent'; renderScripts(); updateFilterButtons(); });
  on('filter-all-section', 'click', () => { currentScriptFilter = 'all'; renderScripts(); updateFilterButtons(); });
  
  // Actions section buttons (duplicate from dashboard)
  on('run-selected-btn-section', 'click', runScriptSelected);
  on('run-all-btn-section', 'click', runOnAll);
  on('stop-all-btn-section', 'click', stopAll);
  on('stop-selected-btn-section', 'click', stopSelected);
  on('pause-selected-btn-section', 'click', pauseSelected);
  on('pause-all-btn-section', 'click', pauseAll);
  on('resume-selected-btn-section', 'click', resumeSelected);
  on('resume-all-btn-section', 'click', resumeAll);
  on('screenshot-btn-section', 'click', captureScreenshotSelected);
  on('scrcpy-btn-section', 'click', openScrcpySelected);

  // Device selection (dashboard grid)
  devicesGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.device-card');
    if (card && devicesGrid.contains(card)) {
      toggleDeviceSelection(card);
    }
  });

  // Device double-click for direct scrcpy
  devicesGrid.addEventListener('dblclick', (e) => {
    const card = e.target.closest('.device-card');
    if (card && devicesGrid.contains(card)) {
      e.preventDefault();
      e.stopPropagation();
      const serial = card.dataset.serial;
      console.log(`[UI] Double-clic sur ${serial}`);
      openScrcpyForDevice(serial);
    }
  });
  // Device selection (control grid)
  if (controlDevicesGrid) {
    controlDevicesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.device-card');
      if (card && controlDevicesGrid.contains(card)) {
        toggleDeviceSelection(card);
      }
    });
    controlDevicesGrid.addEventListener('dblclick', (e) => {
      const card = e.target.closest('.device-card');
      if (card && controlDevicesGrid.contains(card)) {
        e.preventDefault();
        e.stopPropagation();
        const serial = card.dataset.serial;
        openScrcpyForDevice(serial);
      }
    });
  }

  // Device quick actions
  devicesGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('device-action-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const action = e.target.dataset.action;
      const card = e.target.closest('.device-card');
      const serial = card.dataset.serial;
      
      console.log(`[UI] Clic sur bouton ${action} pour ${serial}`);
      
      if (action === 'scrcpy') {
        openScrcpyForDevice(serial);
      } else if (action === 'screenshot') {
        captureScreenshotForDevice(serial);
      }
    }
  });

  // Script selection
  scriptsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.script-card');
    if (card && scriptsGrid.contains(card)) {
      // Un seul script à la fois
      selectedScripts.clear();
      scriptsGrid.querySelectorAll('.script-card').forEach(c => c.classList.remove('selected'));
      toggleScriptSelection(card);
    }
  });

  // Live logs depuis le backend
  window.electronAPI.onScriptLog(({ serial, line, level }) => {
    // Route vers console dédiée
    appendConsoleLine(serial, line.trimEnd(), level || 'INFO');
    // Historique global existant
    log(line.trimEnd(), level || 'INFO');
    // Fallback: si le log indique fin de script, force l'état terminé
    try {
      const l = (line || '').toString().toLowerCase();
      if (l.includes('script termin') || l.includes('script terminé') || l.includes('script termine')) {
        if (runningScripts.has(serial)) {
          runningScripts.delete(serial);
          renderDevices();
          if (runningScripts.size === 0) updateStatus('● Prêt');
          if (shouldNotify(`inline|done|${serial}`, 3000)) {
            pushNotification('success', 'Script terminé', `${serial}`);
            showInlineToast('success', 'Script terminé', `${serial}`);
          }
        }
      }
    } catch {}
  });
  window.electronAPI.onScriptExit(({ serial, code }) => {
    log(`[${serial}] Script terminé (code ${code})`, code === 0 ? 'SUCCESS' : 'ERROR');
    runningScripts.delete(serial);
    renderDevices();
    updateStatus('● Prêt');
    pushNotification(code === 0 ? 'success' : 'error', 'Script terminé', `${serial} · code ${code}`);
    try {
      if (notificationsEnabled) {
        if (code === 0) {
          window.electronAPI.showNotificationSuccess('Script terminé', `${serial}`);
        } else {
          window.electronAPI.showNotificationError('Script terminé avec erreur', `${serial} · code ${code}`);
        }
      }
    } catch {}
    showInlineToast(code === 0 ? 'success' : 'error', 'Script terminé', `${serial}`);
    try {
      recentExitSerials.add(serial);
      setTimeout(() => { recentExitSerials.delete(serial); }, 2000);
    } catch {}
  });
  // Réception des statuts (running/stopped) envoyés par le main
  window.electronAPI.onScriptStatus(({ serial, status }) => {
    if (status === 'running') {
      runningScripts.set(serial, { name: (currentScriptsSectionSelection?.name || 'script'), start: Date.now() });
      pushNotification('info', 'Script démarré', `${serial}`);
      try { if (notificationsEnabled && shouldNotify(`toast|start|${serial}`, 3000)) window.electronAPI.showNotificationInfo('Script démarré', `${serial}`); } catch {}
      showInlineToast('info', 'Script démarré', `${serial}`);
    } else if (status === 'stopped') {
      runningScripts.delete(serial);
      // Si plus aucun script ne tourne, remettre le statut prêt
      if (runningScripts.size === 0) {
        updateStatus('● Prêt');
      }
      if (!recentExitSerials.has(serial)) {
        pushNotification('warning', 'Script arrêté', `${serial}`);
        try { if (notificationsEnabled && shouldNotify(`toast|stop|${serial}`, 3000)) window.electronAPI.showNotificationWarning('Script arrêté', `${serial}`); } catch {}
        showInlineToast('warning', 'Script arrêté', `${serial}`);
      }
    }
    renderDevices();
  });
}

window.addEventListener('message', async function(ev){
  if(ev.data && ev.data.type === 'save-file'){
    let filePath = ev.data.defaultPath;
    // Si pas de chemin ou "scripts/mon_script.py" (template), propose une boîte saveDialog !
    if(!filePath || filePath === 'scripts/mon_script.py'){
      // Cherche le dossier scripts configuré
      let scriptsFolder = (document.getElementById('scripts-path')?.value || '').trim();
      if(!scriptsFolder) scriptsFolder = '';
      // Pré-rempli le nom
      const savePath = await window.electronAPI.showSaveDialog({ 
        defaultPath: scriptsFolder ? scriptsFolder + '/mon_script.py' : 'mon_script.py' });
      if(!savePath) return; // Annulé
      filePath = savePath;
      // Enregistre ce chemin comme "défaut" pour la prochaine sauvegarde
      window.currentScriptSavePath = filePath;
      // Réinjecte dans l'iframe pour écrasement bouton Save
      const iframe = document.getElementById('script-editor-iframe');
      if(iframe) iframe.contentWindow.postMessage({ type:'set-save-path', defaultPath: filePath }, '*');
    }
    // Sauvegarde le contenu dans le bon fichier
    await window.electronAPI.saveFile(ev.data.content, filePath);
    log('💾 Script enregistré : ' + filePath, 'SUCCESS');
    // Optionnel : recharge la liste des scripts si dans le dossier
    if(filePath && filePath.includes('/scripts/')) await loadScripts();
  }
});

function switchSection(section) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const navBtn = document.querySelector(`[data-section="${section}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Show/hide sections
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.add('hidden');
  });
  const target = document.getElementById(`${section}-section`);
  if (target) target.classList.remove('hidden');
}

async function loadInitialData() {
  log('Chargement des données initiales...', 'INFO');
  await Promise.all([
    refreshDevices(),
    loadScripts()
  ]);
  log('Données chargées avec succès', 'SUCCESS');
}

function postDevicesToEditor(){
  try {
    const iframe = document.getElementById('script-editor-iframe');
    if (iframe && window.currentDeviceSerials && window.currentDeviceSerials.length) {
      iframe.contentWindow.postMessage({
        type: 'set-devices',
        devices: window.currentDeviceSerials
      }, '*');
    }
  } catch {}
}

async function refreshDevices() {
  // Ajouter la classe loading à tous les boutons refresh
  document.querySelectorAll('#refresh-btn, #control-refresh-btn, #header-refresh-btn').forEach(btn => {
    btn.classList.add('loading');
  });
  
  try {
    log(t('refreshing_devices'), 'DEBUG');
    devices = await window.electronAPI.getDevices();
    renderDevices();
    log(`✅ ${devices.length} ${t('device_detected', { count: devices.length })}`, 'SUCCESS');
    updateStatusDeviceCount(devices.length);
    // expose serials globally + push to iframe if dispo
    window.currentDeviceSerials = devices.map(d => d.serial);
    postDevicesToEditor();
  } catch (error) {
    log(`${t('refresh_error')}: ${error.message}`, 'ERROR');
  } finally {
    // Retirer la classe loading de tous les boutons refresh
    document.querySelectorAll('#refresh-btn, #control-refresh-btn, #header-refresh-btn').forEach(btn => {
      btn.classList.remove('loading');
    });
  }
}

async function loadScripts() {
  const btn = document.getElementById('reload-scripts-btn');
  btn.classList.add('loading');
  
  try {
    log('Chargement des scripts...', 'DEBUG');
    const pathInput = document.getElementById('scripts-path');
    const baseDir = pathInput ? pathInput.value : undefined;
    scripts = await window.electronAPI.loadScripts(baseDir);
    renderScripts();
    log(`✅ ${scripts.length} script(s) chargé(s)`, 'SUCCESS');
  } catch (error) {
    log(`Erreur lors du chargement des scripts: ${error.message}`, 'ERROR');
  } finally {
    btn.classList.remove('loading');
  }
}

function renderDevices() {
  const cardHtml = (device) => {
    const isSelected = selectedDevices.has(device.serial);
    const isRunning = runningScripts.has(device.serial);
    const runningScript = isRunning ? runningScripts.get(device.serial) : null;
    const typeLabel = device.type === 'emulator' ? t('emulator') : t('mobile');
    const icon = device.type === 'emulator' ? '🤖' : '📱';
    const cardTypeClass = device.type === 'emulator' ? 'card-emulator' : 'card-mobile';
    const typeClass = device.type === 'emulator' ? 'badge-emulator' : 'badge-device';

    return `
      <div class="device-card ${isSelected ? 'selected' : ''} ${cardTypeClass}" data-serial="${device.serial}">
        <div class="device-header">
          <span class="device-icon" style="font-size: 24px; margin-right:8px;">${icon}</span>
          <div class="device-serial">${device.serial}</div>
          <span class="device-type ${typeClass}" style="margin-left: 8px; font-size:12px; font-weight:bold; padding:2px 6px; border-radius:9px; background:${device.type==='emulator'?'#22d3ee':'#16a34a'}; color:#0b1220;">${typeLabel}</span>
        </div>
        <div class="device-status ${device.status === 'device' ? 'connected' : 'disconnected'}">
          ${device.status === 'device' ? t('connected') : t('disconnected')}
        </div>
        <div class="device-info">
          <div class="device-model">${device.brand || device.manuf ? `${(device.brand||device.manuf||'').toUpperCase()} ${device.model||''}`.trim() : t('model_unknown')}</div>
          <div class="device-script">
            ${runningScript ? `▶️ ${runningScript.name}` : t('no_script')}
          </div>
        </div>
        <div class="device-actions">
          <button class="device-action-btn" data-action="scrcpy" title="Ouvrir Scrcpy">📱</button>
          <button class="device-action-btn" data-action="screenshot" title="Capture d'écran">📸</button>
        </div>
      </div>
    `;
  };
  
  devicesGrid.innerHTML = devices.map(cardHtml).join('');
  if (controlDevicesGrid) controlDevicesGrid.innerHTML = devices.map(cardHtml).join('');
  
  // Update stats
  devicesCount.textContent = devices.length;
  runningCount.textContent = runningScripts.size;
}

function renderScripts() {
  // Filter scripts based on current filter
  let filteredScripts = scripts;
  if (currentScriptFilter === 'favorites') {
    filteredScripts = scripts.filter(s => favoriteScripts.has(s.name));
  } else if (currentScriptFilter === 'recent') {
    const recentNames = new Set(recentScripts.slice(-10).map(r => r.name));
    filteredScripts = scripts.filter(s => recentNames.has(s.name));
  }
  
  scriptsGrid.innerHTML = filteredScripts.map(script => {
    const isSelected = selectedScripts.has(script.name);
    const isFavorite = favoriteScripts.has(script.name);
    
    return `
      <div class="script-card ${isSelected ? 'selected' : ''}" data-script="${script.name}">
        <div class="script-header-row" style="display:flex;justify-content:space-between;align-items:center;">
          <div class="script-name">${script.name}</div>
          <button class="favorite-btn" data-script="${script.name}" style="background:none;border:none;cursor:pointer;font-size:18px;padding:0;opacity:${isFavorite ? '1' : '0.3'};" title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
            ${isFavorite ? '⭐' : '☆'}
          </button>
        </div>
        <div class="script-details">
          <span>v${script.version}</span>
          <span>${script.duration}</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Update stats
  scriptsCount.textContent = filteredScripts.length;
  
  // Bind favorite buttons
  scriptsGrid.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const scriptName = btn.dataset.script;
      if (favoriteScripts.has(scriptName)) {
        favoriteScripts.delete(scriptName);
      } else {
        favoriteScripts.add(scriptName);
      }
      saveFavoriteScripts();
      renderScripts();
    });
  });
  
  // Also update scripts in the scripts section
  const scriptsGridSection = document.getElementById('scripts-grid-section');
  if (scriptsGridSection) {
    scriptsGridSection.innerHTML = scriptsGrid.innerHTML;
    bindScriptsSectionEvents();
    // Rebind favorite buttons in section
    scriptsGridSection.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const scriptName = btn.dataset.script;
        if (favoriteScripts.has(scriptName)) {
          favoriteScripts.delete(scriptName);
        } else {
          favoriteScripts.add(scriptName);
        }
        saveFavoriteScripts();
        renderScripts();
      });
    });
  }
}

function saveFavoriteScripts() {
  try {
    localStorage.setItem('appsmobs-favorites', JSON.stringify(Array.from(favoriteScripts)));
  } catch {}
}

function loadFavoriteScripts() {
  try {
    const saved = localStorage.getItem('appsmobs-favorites');
    if (saved) {
      const favs = JSON.parse(saved);
      favoriteScripts.clear();
      favs.forEach(name => favoriteScripts.add(name));
    }
  } catch {}
}

function addToRecentScripts(scriptName) {
  recentScripts.push({ name: scriptName, timestamp: Date.now() });
  // Keep only last 20
  if (recentScripts.length > 20) recentScripts.shift();
  try {
    localStorage.setItem('appsmobs-recent-scripts', JSON.stringify(recentScripts.slice(-10)));
  } catch {}
}

function loadRecentScripts() {
  try {
    const saved = localStorage.getItem('appsmobs-recent-scripts');
    if (saved) {
      const recents = JSON.parse(saved);
      recentScripts.length = 0;
      recentScripts.push(...recents);
    }
  } catch {}
}

function updateFilterButtons() {
  const buttons = ['filter-favorites', 'filter-recent', 'filter-all', 'filter-favorites-section', 'filter-recent-section', 'filter-all-section'];
  buttons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      const isActive = (id.includes('favorites') && currentScriptFilter === 'favorites') ||
                       (id.includes('recent') && currentScriptFilter === 'recent') ||
                       (id.includes('all') && currentScriptFilter === 'all');
      btn.classList.toggle('active', isActive);
      btn.style.opacity = isActive ? '1' : '0.6';
    }
  });
}

let currentScriptsSectionSelection = null; // {name,file,version,duration}

function bindScriptsSectionEvents() {
  const sgs = document.getElementById('scripts-grid-section');
  if (!sgs) return;
  sgs.querySelectorAll('.script-card').forEach(card => {
    card.addEventListener('click', () => {
      sgs.querySelectorAll('.script-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const name = card.dataset.script;
      const info = scripts.find(s => s.name === name);
      if (!info) return;
      currentScriptsSectionSelection = info;
      updateScriptDetails(info);
    });
  });
  document.getElementById('script-open-editor')?.addEventListener('click', openSelectedScriptInEditor);
  document.getElementById('script-run-selection')?.addEventListener('click', runSelectedScriptFromScriptsSection);
  document.getElementById('script-duplicate')?.addEventListener('click', duplicateSelectedScript);
  document.getElementById('script-delete')?.addEventListener('click', deleteSelectedScript);
  const search = document.getElementById('scripts-search-section');
  if (search) search.addEventListener('input', () => filterScriptsSection(search.value));
  const searchBtn = document.getElementById('scripts-search-btn-section');
  if (searchBtn) searchBtn.addEventListener('click', () => filterScriptsSection(search?.value || ''));
}

function updateScriptDetails(info) {
  document.getElementById('sd-name').textContent = info?.name || '—';
  document.getElementById('sd-version').textContent = info?.version || '—';
  document.getElementById('sd-duration').textContent = info?.duration || '—';
  document.getElementById('sd-file').textContent = info?.file || '—';
}

async function openSelectedScriptInEditor() {
  if (!currentScriptsSectionSelection) { log('Sélectionnez un script', 'WARNING'); return; }
  try {
    // Toujours ouvrir dans l'éditeur intégré (Playground)
    const res = await window.electronAPI.readFileText(currentScriptsSectionSelection.file);
    if (res && res.success) {
      switchSection('editor');
      const iframe = document.getElementById('script-editor-iframe');
      iframe?.contentWindow?.postMessage({ type: 'load-code', content: res.content, defaultPath: currentScriptsSectionSelection.file }, '*');
    } else {
      log(`Erreur ouverture éditeur: ${res && res.message ? res.message : ''}`, 'ERROR');
    }
  } catch (e) {
    log(`Erreur ouverture éditeur: ${e && e.message ? e.message : ''}`, 'ERROR');
  }
}

function filterScriptsSection(q) {
  q = (q || '').toLowerCase();
  const sgs = document.getElementById('scripts-grid-section');
  if (!sgs) return;
  sgs.querySelectorAll('.script-card').forEach(card => {
    const name = (card.dataset.script || '').toLowerCase();
    card.style.display = q === '' || name.includes(q) ? '' : 'none';
  });
}

async function runSelectedScriptFromScriptsSection() {
  if (!currentScriptsSectionSelection) { log('Sélectionnez un script', 'WARNING'); return; }
  if (selectedDevices.size === 0) { log('Sélectionnez des appareils', 'WARNING'); return; }
  const serials = Array.from(selectedDevices);
  log(`🎬 Lancement: ${currentScriptsSectionSelection.name} sur ${serials.length} appareil(s) ...`, 'INFO');
  addToRecentScripts(currentScriptsSectionSelection.name);
  await window.electronAPI.runScriptOnDevices(currentScriptsSectionSelection.file, serials, { openViewer: false });
}

async function duplicateSelectedScript() {
  if (!currentScriptsSectionSelection) { log('Sélectionnez un script', 'WARNING'); return; }
  const res = await window.electronAPI.duplicateScript(currentScriptsSectionSelection.file);
  if (res.success) {
    log(`✅ Script dupliqué: ${res.filePath}`, 'SUCCESS');
    await loadScripts();
  } else {
    log(`❌ Duplication échouée: ${res.message || ''}`, 'ERROR');
  }
}

async function deleteSelectedScript() {
  if (!currentScriptsSectionSelection) { log('Sélectionnez un script', 'WARNING'); return; }
  const ok = confirm(`Supprimer le script ${currentScriptsSectionSelection.name} ?`);
  if (!ok) return;
  const res = await window.electronAPI.deleteScript(currentScriptsSectionSelection.file);
  if (res.success) {
    log('🗑️ Script supprimé', 'SUCCESS');
    currentScriptsSectionSelection = null;
    updateScriptDetails(null);
    await loadScripts();
  } else {
    log(`❌ Suppression échouée: ${res.message || ''}`, 'ERROR');
  }
}

function toggleDeviceSelection(card) {
  const serial = card.dataset.serial;
  if (selectedDevices.has(serial)) {
    selectedDevices.delete(serial);
    card.classList.remove('selected');
  } else {
    selectedDevices.add(serial);
    card.classList.add('selected');
  }
}

function toggleScriptSelection(card) {
  const script = card.dataset.script;
  if (selectedScripts.has(script)) {
    selectedScripts.delete(script);
    card.classList.remove('selected');
  } else {
    selectedScripts.add(script);
    card.classList.add('selected');
  }
}

async function setupSelectedDevices() {
  if (selectedDevices.size === 0) {
    log('Sélectionnez des appareils', 'WARNING');
    return;
  }

  const btn = document.getElementById('setup-btn');
  btn.classList.add('loading');

  try {
    for (const serial of selectedDevices) {
      log(`Configuration de ${serial}...`, 'DEBUG');
      const result = await window.electronAPI.setupDevice(serial);
      if (result.success) {
        log(`✅ ${serial} configuré avec succès`, 'SUCCESS');
      } else {
        log(`❌ Erreur configuration ${serial}`, 'ERROR');
      }
    }
  } catch (error) {
    log(`Erreur lors de la configuration: ${error.message}`, 'ERROR');
  } finally {
    btn.classList.remove('loading');
  }
}

async function openScrcpySelected() {
  if (selectedDevices.size === 0) {
    log('Sélectionnez des appareils', 'WARNING');
    return;
  }

  if (selectedDevices.size === 1) {
    // Un seul appareil : ouvrir directement
    const serial = Array.from(selectedDevices)[0];
    await openScrcpyForDevice(serial);
  } else {
    // Plusieurs appareils : afficher modal de sélection
    showScrcpySelectionModal();
  }
}

// Protection contre les appels multiples
const scrcpyRequests = new Set();

async function openScrcpyForDevice(serial) {
  // Vérifier si une demande est déjà en cours pour cet appareil
  if (scrcpyRequests.has(serial)) {
    console.log(`[UI] Demande scrcpy déjà en cours pour ${serial}, ignorée`);
    return;
  }
  
  // Ajouter la demande en cours
  scrcpyRequests.add(serial);
  
  const btn = document.getElementById('scrcpy-btn');
  btn.classList.add('loading');

  try {
    log(`📱 Ouverture scrcpy pour ${serial}...`, 'DEBUG');
    const result = await window.electronAPI.openScrcpy(serial);
    if (result.success) {
      log(`✅ scrcpy ouvert pour ${serial}${result.path ? ` (${result.path})` : ''}`, 'SUCCESS');
    } else {
      log(`❌ Erreur ouverture scrcpy ${serial}: ${result.message || 'scrcpy introuvable'}`, 'ERROR');
    }
  } catch (error) {
    log(`Erreur lors de l'ouverture de scrcpy: ${error.message}`, 'ERROR');
  } finally {
    btn.classList.remove('loading');
    // Retirer la demande en cours
    scrcpyRequests.delete(serial);
  }
}

function showPaintConfirm(message){
  return new Promise((resolve)=>{
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${t('capture_success') || 'Screenshot saved'}</h2>
          <button class="modal-close" data-close>✕</button>
        </div>
        <div class="modal-body" style="padding:18px 24px;">
          <div style="margin-bottom:8px; color:#cfe3ed;">${message}</div>
          <div style="margin-bottom:16px; color:#cfe3ed;">${t('open_in_paint_prompt') || 'Open the screenshot in Paint to crop?'}</div>
          <div class="modal-actions" style="display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn btn-modern" data-no>${t('no') || 'No'}</button>
            <button class="btn btn-modern selected" data-yes>${t('yes') || 'Yes'}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const done = (val)=>{ try { document.body.removeChild(overlay); } catch {} resolve(val); };
    overlay.addEventListener('click', (e)=>{
      if (e.target.closest('[data-close]') || e.target === overlay || e.target.closest('[data-no]')) done(false);
      if (e.target.closest('[data-yes]')) done(true);
    });
  });
}

async function captureScreenshotForDevice(serial) {
  try {
    log(`📸 Capture d'écran pour ${serial}...`, 'DEBUG');
    const dirInput = document.getElementById('screenshots-path');
    const dir = dirInput ? dirInput.value : undefined;
    const result = await window.electronAPI.captureScreenshot(serial, dir);
    if (result.success) {
      log(`✅ ${t('capture_success') || 'Capture enregistrée'}: ${result.fileName}`, 'SUCCESS');
      const yes = await showPaintConfirm(result.fileName);
      if (yes && result.filePath) { try { await window.electronAPI.openFile(result.filePath); } catch {} }
    } else {
      log(`❌ ${t('capture_failed') || 'Échec de la capture'}: ${result.message || ''}`, 'ERROR');
    }
  } catch (error) {
    log(`Erreur lors de la capture: ${error.message}`, 'ERROR');
  }
}

function showScrcpySelectionModal() {
  const modal = document.getElementById('scrcpy-modal');
  const deviceList = document.getElementById('device-selection-list');
  
  // Populate device options
  deviceList.innerHTML = Array.from(selectedDevices).map(serial => {
    const device = devices.find(d => d.serial === serial);
    return `
      <div class="device-option" data-serial="${serial}">
        <div class="device-option-serial">${serial}</div>
        <div class="device-option-status ${device?.status === 'device' ? 'connected' : 'disconnected'}">
          ${device?.status === 'device' ? 'CONNECTÉ' : 'DÉCONNECTÉ'}
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers for device options
  deviceList.querySelectorAll('.device-option').forEach(option => {
    option.addEventListener('click', () => {
      deviceList.querySelectorAll('.device-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
  
  modal.classList.remove('hidden');
}

function openShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) {
    modal.classList.remove('hidden');
    renderKeyboardShortcuts();
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeShortcutsModal();
      }
    });
  }
}

function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) {
    modal.classList.add('hidden');
    cancelEditingShortcut();
  }
}

function closeScrcpyModal() {
  document.getElementById('scrcpy-modal').classList.add('hidden');
}

async function confirmScrcpySelection() {
  const selectedOption = document.querySelector('.device-option.selected');
  if (!selectedOption) {
    log('Sélectionnez un appareil', 'WARNING');
    return;
  }
  
  const serial = selectedOption.dataset.serial;
  closeScrcpyModal();
  await openScrcpyForDevice(serial);
}

async function captureScreenshotSelected() {
  if (selectedDevices.size === 0) {
    log('Sélectionnez des appareils', 'WARNING');
    return;
  }

  const btn = document.getElementById('screenshot-btn');
  if (btn) btn.classList.add('loading');

  try {
    for (const serial of selectedDevices) {
      log(`📸 Capture d'écran pour ${serial}...`, 'DEBUG');
      const result = await window.electronAPI.captureScreenshot(serial);
      if (result.success) {
        log(`✅ ${t('capture_success') || 'Capture enregistrée'}: ${result.fileName}`, 'SUCCESS');
        const yes = await showPaintConfirm(result.fileName);
        if (yes && result.filePath) { try { await window.electronAPI.openFile(result.filePath); } catch {} }
      } else {
        log(`❌ ${t('capture_failed') || 'Échec de la capture'}: ${result.message || ''}`, 'ERROR');
      }
    }
  } catch (error) {
    log(`Erreur lors de la capture: ${error.message}`, 'ERROR');
  } finally {
    if (btn) btn.classList.remove('loading');
  }
}

async function runScriptSelected() {
  if (selectedDevices.size === 0) {
    log('Sélectionnez des appareils', 'WARNING');
    return;
  }
  if (selectedScripts.size === 0) {
    log('Sélectionnez un script', 'WARNING');
    return;
  }

  const scriptName = Array.from(selectedScripts)[0];
  const script = scripts.find(s => s.name === scriptName);
  if (!script) {
    log('Script introuvable', 'ERROR');
    return;
  }

  const serials = Array.from(selectedDevices);
  log(`🎬 Lancement: ${script.name} sur ${serials.length} appareil(s) ...`, 'INFO');
  updateStatus('● Script(s) en cours...');
  addToRecentScripts(script.name);

  const start = Date.now();
  serials.forEach(s => runningScripts.set(s, { name: script.name, start }));
  renderDevices();

  const results = await window.electronAPI.runScriptOnDevices(script.file, serials, { openViewer: false });
  results.forEach(r => {
    if (!r.ok) {
      log(`[${r.serial}] Erreur lancement: ${r.message || 'inconnue'}`, 'ERROR');
      runningScripts.delete(r.serial);
      pushNotification('error', 'Erreur lancement', `${r.serial}: ${r.message || 'inconnue'}`);
    }
  });
  renderDevices();
}

function runOnAll() {
  if (devices.length === 0) {
    log('Aucun appareil configuré', 'WARNING');
    return;
  }

  log(`🌐 Script lancé sur ${devices.length} appareil(s)`, 'INFO');
  updateStatus('● Script(s) en cours...');
}

function stopAll() {
  log('🛑 Arrêt de tous les scripts...', 'WARNING');
  window.electronAPI.stopAllScripts().then(() => {
    runningScripts.clear();
    renderDevices();
    updateStatus('● Prêt');
    log('✅ Tous les scripts arrêtés', 'SUCCESS');
    try {
      pushNotification('warning', 'Tous arrêtés', 'Tous les scripts ont été arrêtés');
      showInlineToast('warning', 'Tous arrêtés', 'Tous les scripts ont été arrêtés');
    } catch {}
  });
}

async function stopSelected() {
  if (selectedDevices.size === 0) {
    log('Sélectionnez des appareils', 'WARNING');
    return;
  }
  log('🛑 Arrêt des scripts sur la sélection...', 'WARNING');
  for (const serial of selectedDevices) {
    try {
      const res = await window.electronAPI.stopScriptOnDevice(serial);
      if (res.ok) {
        runningScripts.delete(serial);
        log(`[${serial}] Script arrêté`, 'SUCCESS');
        try { pushNotification('warning', 'Script arrêté', `${serial}`); showInlineToast('warning', 'Script arrêté', `${serial}`); } catch {}
      } else {
        log(`[${serial}] Rien à arrêter`, 'DEBUG');
      }
    } catch (e) {
      log(`[${serial}] Erreur stop: ${e?.message || e}`, 'ERROR');
    }
  }
  renderDevices();
  updateStatus('● Prêt');
}

// ==============================
// Pause / Resume (UI-level)
// ==============================
function pauseSelected() {
  if (selectedDevices.size === 0) { log('Sélectionnez des appareils', 'WARNING'); return; }
  let count = 0;
  for (const serial of selectedDevices) {
    if (runningScripts.has(serial)) {
      pausedSerials.add(serial);
      count++;
      try { pushNotification('warning', 'Script en pause', `${serial}`); showInlineToast('warning', 'Script en pause', `${serial}`); } catch {}
    }
  }
  if (count === 0) log('Aucun script en cours à mettre en pause', 'INFO');
}

function resumeSelected() {
  if (selectedDevices.size === 0) { log('Sélectionnez des appareils', 'WARNING'); return; }
  let count = 0;
  for (const serial of selectedDevices) {
    if (pausedSerials.has(serial)) {
      pausedSerials.delete(serial);
      count++;
      try { pushNotification('info', 'Reprise du script', `${serial}`); showInlineToast('info', 'Reprise du script', `${serial}`); } catch {}
    }
  }
  if (count === 0) log('Aucun script en pause à reprendre', 'INFO');
}

function pauseAll() {
  let count = 0;
  for (const serial of runningScripts.keys()) { pausedSerials.add(serial); count++; }
  if (count > 0) { try { pushNotification('warning', 'Pause (tous)', `${count} appareil(s)`); showInlineToast('warning', 'Pause (tous)', `${count} appareil(s)`); } catch {} }
}

function resumeAll() {
  const count = pausedSerials.size;
  pausedSerials.clear();
  if (count > 0) { try { pushNotification('info', 'Reprise (tous)', `${count} appareil(s)`); showInlineToast('info', 'Reprise (tous)', `${count} appareil(s)`); } catch {} }
}


function filterDevices() {
  const query = (devicesSearchInput?.value || '').toLowerCase();
  const cards = devicesGrid.querySelectorAll('.device-card');
  
  cards.forEach(card => {
    const serial = card.dataset.serial.toLowerCase();
    const visible = query === '' || serial.includes(query);
    card.style.display = visible ? '' : 'none';
  });
}

function filterScripts() {
  const query = (scriptsSearchInput?.value || '').toLowerCase();
  const cards = document.getElementById('scripts-grid').querySelectorAll('.script-card');
  cards.forEach(card => {
    const name = (card.dataset.script || '').toLowerCase();
    const visible = query === '' || name.includes(query);
    card.style.display = visible ? '' : 'none';
  });
}

function log(message, level = 'INFO') {
  // Traduction automatique de certains messages standards
  // Ajoute ici toutes les correspondances FR->EN/clé locale
  const tradMap = {
    'Chargement des données initiales...': t('loading_initial_data'),
    'Actualisation des appareils...': t('refreshing_devices_verbose'),
    'Chargement des scripts...': t('loading_scripts'),
    'Données chargées avec succès': t('data_loaded_success'),
    'Console effacée': t('clear'),
  };
  Object.keys(tradMap).forEach(k => {
    if (message && typeof message === 'string' && message.includes(k)) {
      message = message.replace(k, tradMap[k]);
    }
  });
  // Remplacement patterns paramétrés
  message = message.replace(/(\d+) script\(s\) chargé\(s\)/, (m, c) => t('scripts_loaded', {count: c}));
  message = message.replace(/(\d+) appareil\(s\) détecté\(s\)/, (m, c) => t('device_detected_verbose', {count: c}));

  // Niveau
  level = t(level.toLowerCase()) || level.toUpperCase();

  // Scrolling intelligent : n'auto-scroll que si on était tout en bas !
  const isAtBottom = Math.abs(consoleOutput.scrollHeight - consoleOutput.scrollTop - consoleOutput.clientHeight) < 20;
  const timestamp = new Date().toLocaleTimeString();
  // Si le message contient déjà un timestamp (commence par [), ne pas en ajouter
  let logEntry;
  if (message.trim().startsWith('[')) {
    // Le message a déjà son propre formatage (depuis core)
    logEntry = `${message}\n`;
  } else {
    // Format pour les messages locaux
    logEntry = `[${timestamp}] [${level}] ${message}\n`;
  }
  consoleOutput.textContent += logEntry;
  if (isAtBottom) {
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
}

function clearConsole() {
  consoleOutput.textContent = '';
  log('Console effacée', 'INFO');
}

function exportLogs() {
  const logs = consoleOutput.textContent;
  const blob = new Blob([logs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `appsMobs_logs_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  log('Logs exportés', 'SUCCESS');
}

function updateStatus(message) {
  statusElement.textContent = message;
}

// Settings Functions
function setupAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
  
  if (autoRefreshEnabled) {
    // Refresh every 5 seconds
    autoRefreshInterval = setInterval(() => {
      refreshDevices();
    }, 5000);
  }
}

function setupSettingsListeners() {
  // Toggle switches
  const autoRefresh = document.getElementById('auto-refresh');
  const debugMode = document.getElementById('debug-mode');
  const soundAlerts = document.getElementById('sound-alerts');
  const notificationsToggle = document.getElementById('notifications-enabled');
  
  if (autoRefresh) {
    autoRefresh.addEventListener('change', (e) => {
      autoRefreshEnabled = e.target.checked;
      saveSettings();
      setupAutoRefresh();
    });
  }
  if (debugMode) debugMode.addEventListener('change', saveSettings);
  if (soundAlerts) {
    soundAlerts.addEventListener('change', (e) => {
      soundAlertsEnabled = e.target.checked;
      saveSettings();
    });
  }
  if (notificationsToggle) notificationsToggle.addEventListener('change', saveSettings);
  
  // Dark theme toggle
  const darkThemeToggle = document.getElementById('dark-theme');
  if (darkThemeToggle) {
    darkThemeToggle.addEventListener('change', function() {
      saveSettings();
      // Optionnel: appliquer le thème immédiatement
      // toggleDarkTheme(this.checked);
    });
  }

  // Range sliders
  document.getElementById('scrcpy-fps').addEventListener('input', (e) => {
    document.getElementById('fps-value').textContent = e.target.value;
    saveSettings();
  });

  document.getElementById('scrcpy-bitrate').addEventListener('input', (e) => {
    document.getElementById('bitrate-value').textContent = e.target.value;
    saveSettings();
  });

  document.getElementById('scrcpy-width').addEventListener('input', (e) => {
    document.getElementById('width-value').textContent = e.target.value;
    saveSettings();
  });

  // Select dropdowns (log-level removed)

  // Browse buttons
  const browseScripts = document.getElementById('browse-scripts');
  if (browseScripts) {
    browseScripts.addEventListener('click', async () => {
      const res = await window.electronAPI.chooseDirectory();
      if (!res.canceled && res.path) {
        document.getElementById('scripts-path').value = res.path;
        saveSettings();
        await loadScripts();
      }
    });
  }

  const browseScriptsSection = document.getElementById('browse-scripts-section');
  if (browseScriptsSection) {
    browseScriptsSection.addEventListener('click', async () => {
      const res = await window.electronAPI.chooseDirectory();
      if (!res.canceled && res.path) {
        document.getElementById('scripts-path-section').value = res.path;
        document.getElementById('scripts-path').value = res.path;
        saveSettings();
        await loadScripts();
      }
    });
  }

  const reloadScriptsSection = document.getElementById('reload-scripts-btn-section');
  if (reloadScriptsSection) {
    reloadScriptsSection.addEventListener('click', loadScripts);
  }

  document.getElementById('browse-screenshots').addEventListener('click', async () => {
    const res = await window.electronAPI.chooseDirectory();
    if (!res.canceled && res.path) {
      document.getElementById('screenshots-path').value = res.path;
      saveSettings();
      log('Dossier captures mis à jour', 'SUCCESS');
    }
  });

  // Language dropdown
  const langDropdown = document.querySelector('.language-dropdown');
  const langDropdownHeader = document.getElementById('language-dropdown-header');
  const langDropdownList = document.getElementById('language-dropdown-list');
  const langDropdownTitle = document.getElementById('language-dropdown-title');
  
  if (langDropdownHeader && langDropdownList) {
    langDropdownHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
    
    langDropdownList.querySelectorAll('.language-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = item.dataset.lang;
        setLang(selectedLang);
        updateLanguageDropdown();
        langDropdown.classList.remove('open');
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target)) {
        langDropdown.classList.remove('open');
      }
    });
  }
  
  // Update check button
  const checkUpdatesBtn = document.getElementById('check-updates-btn');
  const downloadUpdateBtn = document.getElementById('download-update-btn');
  const installUpdateBtn = document.getElementById('install-update-btn');
  
  if (checkUpdatesBtn && window.electronAPI && window.electronAPI.checkForUpdates) {
    checkUpdatesBtn.addEventListener('click', async () => {
      const statusEl = document.getElementById('update-status');
      const progressEl = document.getElementById('update-progress');
      
      checkUpdatesBtn.disabled = true;
      checkUpdatesBtn.textContent = '🔄 ' + t('checking_updates');
      statusEl.style.display = 'block';
      statusEl.textContent = t('checking_updates');
      statusEl.style.color = '#94a3b8';
      progressEl.style.display = 'none';
      downloadUpdateBtn.classList.add('hidden');
      installUpdateBtn.classList.add('hidden');
      
      try {
        const res = await window.electronAPI.checkForUpdates();
        if (!res.success) {
          let errorMsg = res.message || t('update_error');
          // Traduire les messages d'erreur spécifiques
          if (errorMsg.includes('production')) {
            errorMsg = t('update_error_production_only');
          } else if (errorMsg.includes('désactivées') || errorMsg.includes('disabled')) {
            errorMsg = t('update_error_disabled');
          }
          statusEl.textContent = errorMsg;
          statusEl.style.color = '#fca5a5';
          checkUpdatesBtn.disabled = false;
          checkUpdatesBtn.textContent = '🔄 ' + t('check_for_updates');
        }
      } catch (e) {
        statusEl.textContent = t('update_error') + ': ' + (e.message || 'inconnue');
        statusEl.style.color = '#fca5a5';
        checkUpdatesBtn.disabled = false;
        checkUpdatesBtn.textContent = '🔄 ' + t('check_for_updates');
      }
    });
    
    // Bouton télécharger
    if (downloadUpdateBtn && window.electronAPI && window.electronAPI.downloadUpdate) {
      downloadUpdateBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('update-status');
        const progressEl = document.getElementById('update-progress');
        statusEl.style.display = 'block';
        statusEl.textContent = t('update_downloading');
        statusEl.style.color = '#86efac';
        progressEl.style.display = 'block';
        downloadUpdateBtn.disabled = true;
        try {
          const res = await window.electronAPI.downloadUpdate();
          if (!res.success) {
            statusEl.textContent = t('update_error') + ': ' + (res.message || '');
            statusEl.style.color = '#fca5a5';
            downloadUpdateBtn.disabled = false;
          }
        } catch (e) {
          statusEl.textContent = t('update_error') + ': ' + (e.message || '');
          statusEl.style.color = '#fca5a5';
          downloadUpdateBtn.disabled = false;
        }
      });
    }
    
    // Bouton installer
    if (installUpdateBtn && window.electronAPI && window.electronAPI.installUpdate) {
      installUpdateBtn.addEventListener('click', async () => {
        try {
          await window.electronAPI.installUpdate();
        } catch (e) {
          const statusEl = document.getElementById('update-status');
          statusEl.style.display = 'block';
          statusEl.textContent = t('update_error') + ': ' + (e.message || '');
          statusEl.style.color = '#fca5a5';
        }
      });
    }
    
    // Listeners pour les événements de mise à jour
    if (window.electronAPI.onUpdateAvailable) {
      window.electronAPI.onUpdateAvailable(({ version }) => {
        const statusEl = document.getElementById('update-status');
        const progressEl = document.getElementById('update-progress');
        statusEl.style.display = 'block';
        statusEl.textContent = t('update_available_version', { version });
        statusEl.style.color = '#86efac';
        progressEl.style.display = 'block';
        downloadUpdateBtn.classList.remove('hidden');
        // Le téléchargement démarre automatiquement depuis main.js, mais on laisse aussi l'option manuelle
      });
    }
    
    if (window.electronAPI.onUpdateNotAvailable) {
      window.electronAPI.onUpdateNotAvailable(() => {
        const statusEl = document.getElementById('update-status');
        checkUpdatesBtn.disabled = false;
        checkUpdatesBtn.textContent = '🔄 ' + t('check_for_updates');
        statusEl.style.display = 'block';
        statusEl.textContent = t('update_not_available');
        statusEl.style.color = '#86efac';
        downloadUpdateBtn.classList.add('hidden');
        installUpdateBtn.classList.add('hidden');
      });
    }
    
    if (window.electronAPI.onUpdateDownloadProgress) {
      window.electronAPI.onUpdateDownloadProgress(({ percent }) => {
        const progressBar = document.getElementById('update-progress-bar');
        const progressText = document.getElementById('update-progress-text');
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = percent + '%';
      });
    }
    
    if (window.electronAPI.onUpdateDownloaded) {
      window.electronAPI.onUpdateDownloaded(({ version }) => {
        const statusEl = document.getElementById('update-status');
        checkUpdatesBtn.disabled = false;
        checkUpdatesBtn.textContent = '🔄 ' + t('check_for_updates');
        statusEl.style.display = 'block';
        statusEl.textContent = t('update_downloaded', { version });
        statusEl.style.color = '#86efac';
        downloadUpdateBtn.classList.add('hidden');
        installUpdateBtn.classList.remove('hidden');
      });
    }
    
    if (window.electronAPI.onUpdateError) {
      window.electronAPI.onUpdateError(({ message }) => {
        const statusEl = document.getElementById('update-status');
        checkUpdatesBtn.disabled = false;
        checkUpdatesBtn.textContent = '🔄 ' + t('check_for_updates');
        statusEl.style.display = 'block';
        let errorMsg = message || t('update_error');
        if (errorMsg.includes('production')) {
          errorMsg = t('update_error_production_only');
        } else if (errorMsg.includes('désactivées') || errorMsg.includes('disabled')) {
          errorMsg = t('update_error_disabled');
        }
        statusEl.textContent = errorMsg;
        statusEl.style.color = '#fca5a5';
        downloadUpdateBtn.classList.add('hidden');
        installUpdateBtn.classList.add('hidden');
      });
    }
  }
  
  updateLanguageDropdown();
}

function saveSettings() {
  const settings = {
    autoRefresh: document.getElementById('auto-refresh')?.checked ?? true,
    debugMode: document.getElementById('debug-mode')?.checked ?? false,
    soundAlerts: document.getElementById('sound-alerts')?.checked ?? true,
    notificationsEnabled: document.getElementById('notifications-enabled')?.checked ?? true,
    darkTheme: document.getElementById('dark-theme')?.checked ?? true,
    scrcpyFps: document.getElementById('scrcpy-fps')?.value ?? 15,
    scrcpyBitrate: document.getElementById('scrcpy-bitrate')?.value ?? 8,
    scrcpyWidth: document.getElementById('scrcpy-width')?.value ?? 1080,
    scriptsPath: document.getElementById('scripts-path')?.value ?? '',
    screenshotsPath: document.getElementById('screenshots-path')?.value ?? '',
    language: lang, // Save selected language
    shortcuts: customShortcuts // Save custom shortcuts
  };
  
  localStorage.setItem('appsmobs-settings', JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem('appsmobs-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    
    const autoRefreshEl = document.getElementById('auto-refresh');
    if (autoRefreshEl) autoRefreshEl.checked = settings.autoRefresh ?? true;
    autoRefreshEnabled = settings.autoRefresh ?? true;
    
    if (document.getElementById('debug-mode')) document.getElementById('debug-mode').checked = settings.debugMode ?? false;
    
    const soundAlertsEl = document.getElementById('sound-alerts');
    if (soundAlertsEl) soundAlertsEl.checked = settings.soundAlerts ?? true;
    soundAlertsEnabled = settings.soundAlerts ?? true;
    
    const notifEl = document.getElementById('notifications-enabled');
    if (notifEl) notifEl.checked = settings.notificationsEnabled ?? true;
    notificationsEnabled = settings.notificationsEnabled ?? true;
    
    // Setup auto-refresh after loading settings
    setupAutoRefresh();
    
    // Load dark theme (only if not disabled)
    const darkThemeToggle = document.getElementById('dark-theme');
    if (darkThemeToggle && !darkThemeToggle.disabled) {
      darkThemeToggle.checked = settings.darkTheme ?? true;
    }
    
    document.getElementById('scrcpy-fps').value = settings.scrcpyFps ?? 15;
    document.getElementById('scrcpy-bitrate').value = settings.scrcpyBitrate ?? 8;
    document.getElementById('scrcpy-width').value = settings.scrcpyWidth ?? 1080;
    
    // Load path settings or use defaults
    if (settings.scriptsPath) {
      document.getElementById('scripts-path').value = settings.scriptsPath;
    }
    if (settings.screenshotsPath) {
      document.getElementById('screenshots-path').value = settings.screenshotsPath;
    }
  // Load language
  if (settings.language) {
    loadLang(settings.language);
    updateLanguageDropdown();
  }
    
    // Update display values
    document.getElementById('fps-value').textContent = settings.scrcpyFps ?? 15;
    document.getElementById('bitrate-value').textContent = settings.scrcpyBitrate ?? 8;
    document.getElementById('width-value').textContent = settings.scrcpyWidth ?? 1080;
  }
}

// License Functions
function openLicenseModal() {
  console.log('Opening license modal...');
  const modal = document.getElementById('license-modal');
  if (modal) {
    modal.classList.remove('hidden');
    console.log('License modal should be visible now');
    
    // Focus on email input
    const emailInput = document.getElementById('license-email');
    if (emailInput) {
      emailInput.focus();
    }
  } else {
    console.error('License modal element not found');
  }
}

function closeLicenseModal() {
  const modal = document.getElementById('license-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  const statusText = document.getElementById('license-status-text');
  if (statusText) {
    statusText.textContent = '';
    statusText.className = 'license-status-text';
  }
}

function updateLicenseWarning() {
  const warning = document.getElementById('license-warning');
  if (!warning) return;
  
  // For now, always show the warning (you can integrate with your license check)
  const hasValidLicense = false; // TODO: Replace with actual license check
  
  if (!hasValidLicense) {
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }
}

// Test function to manually open modal
function testLicenseModal() {
  console.log('Testing license modal...');
  openLicenseModal();
}

async function submitLicense() {
  const email = document.getElementById('license-email').value.trim();
  const key = document.getElementById('license-key').value.trim();
  const statusText = document.getElementById('license-status-text');
  
  if (!email || !key) {
    statusText.textContent = 'Veuillez saisir email et clé de licence';
    statusText.className = 'license-status-text error';
    return;
  }

  statusText.textContent = 'Vérification en cours...';
  statusText.className = 'license-status-text info';

  try {
    // TODO: Implement license verification with your Python backend
    const result = await window.electronAPI.verifyLicense(email, key);
    
    if (result.success) {
      statusText.textContent = 'Licence activée avec succès !';
      statusText.className = 'license-status-text success';
      updateLicenseStatus(true, 'Licence valide');
      setTimeout(closeLicenseModal, 2000);
    } else {
      statusText.textContent = result.message || 'Erreur d\'activation';
      statusText.className = 'license-status-text error';
    }
  } catch (error) {
    statusText.textContent = 'Erreur de connexion au serveur';
    statusText.className = 'license-status-text error';
    log(`Erreur licence: ${error.message}`, 'ERROR');
  }
}

async function checkLicenseStatus() {
  try {
    // TODO: Implement license status check
    const result = await window.electronAPI.checkLicenseStatus();
    updateLicenseStatus(result.valid, result.message);
    
    // Update warning banner based on license status
    const warning = document.getElementById('license-warning');
    if (warning) {
      if (result.valid) {
        warning.classList.add('hidden');
      } else {
        warning.classList.remove('hidden');
      }
    }
  } catch (error) {
    log(`Erreur vérification licence: ${error.message}`, 'ERROR');
    updateLicenseStatus(false, 'Erreur de vérification');
    
    // Show warning if license check fails
    const warning = document.getElementById('license-warning');
    if (warning) {
      warning.classList.remove('hidden');
    }
  }
}

function updateLicenseStatus(isValid, message) {
  const indicator = document.getElementById('status-indicator');
  const text = document.getElementById('license-text');
  globalLicenseValid = !!isValid;
  if (indicator && text) {
    if (isValid) {
      indicator.className = 'status-indicator valid';
      text.textContent = message || t('license_ok');
    } else {
      indicator.className = 'status-indicator invalid';
      text.textContent = message || t('license_missing');
    }
  }
  updateLicenseIndicator();
}

function updateLicenseIndicator() {
  const el = document.getElementById('license-indicator');
  if (!el) return;
  el.innerHTML = '';
  if (typeof globalLicenseValid !== 'boolean') return;
  if (globalLicenseValid) {
    el.className = 'license-ok';
    el.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;vertical-align:-2px;">check_circle</span> ' + (t('license_ok') || 'Licence active');
  } else {
    el.className = 'license-bad';
    el.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;vertical-align:-2px;">cancel</span> ' + (t('license_missing') || 'Licence manquante');
  }
}

function updateLanguageDropdown() {
  const langDropdownTitle = document.getElementById('language-dropdown-title');
  const langItems = document.querySelectorAll('.language-dropdown-item');
  
  if (langDropdownTitle) {
    const langNames = {
      'en': 'English',
      'fr': 'Français'
    };
    langDropdownTitle.textContent = langNames[lang] || 'English';
  }
  
  langItems.forEach(item => {
    const itemLang = item.dataset.lang;
    item.classList.toggle('selected', itemLang === lang);
  });
}

function updateLocalizedUI() {
  // Update all data-i18n attributes
  document.querySelectorAll('[data-i18n-text]').forEach(el => {
    const key = el.getAttribute('data-i18n-text');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.placeholder = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.title = t(key);
  });
  
  updateLanguageDropdown();
  
  // Sidebar nav labels
  const navs = [
    { selector: '.nav-card[data-section="devices"] .nav-label', key: 'dashboard' },
    { selector: '.nav-card[data-section="scripts"] .nav-label', key: 'scripts' },
    { selector: '.nav-card[data-section="control"] .nav-label', key: 'control' },
    { selector: '.nav-card[data-section="editor"] .nav-label', key: 'editor' },
    { selector: '.nav-card[data-section="console"] .nav-label', key: 'console' },
    { selector: '.icon-btn[data-section="settings"]', key: 'settings', attr: 'title' }
  ];
  navs.forEach(n => {
    const el = document.querySelector(n.selector);
    if (el) {
      if(n.attr) el.setAttribute(n.attr, t(n.key));
      else el.textContent = t(n.key);
    }
  });

  // Dashboard main header
  const dashH3 = document.querySelector('#devices-section h3');
  if(dashH3) dashH3.textContent = '📱 ' + t('devices_connected');
  const devCardHeader = document.querySelector('#devices-section .card-header h3');
  if(devCardHeader) devCardHeader.textContent = '📱 ' + t('devices_connected');

  // Device search box - only once
  const devSearchInput = document.getElementById('devices-search');
  if(devSearchInput) devSearchInput.placeholder = t('search_device');
  // Scripts search - only once
  const scriptSearchInput = document.getElementById('scripts-search');
  if(scriptSearchInput) scriptSearchInput.placeholder = t('search_script');

  // Stats labels under dashboard
  const statMap = [
    {selector: '#devices-count', key: 'devices_connected'},
    {selector: '#scripts-count', key: 'scripts_loaded_label'},
    {selector: '#running-count', key: 'active_scripts'},
    {selector: '#actions-count', key: 'available_actions'}
  ];
  statMap.forEach(({selector, key}) => {
    const numEl = document.querySelector(selector);
    if(numEl && numEl.parentNode && numEl.nextElementSibling){
      numEl.nextElementSibling.textContent = t(key);
      numEl.nextElementSibling.setAttribute('data-i18n-key', key);
    }
  });

  // Quick actions, script/open/etc buttons
  [
    { id: 'refresh-btn', txt: 'refresh' },
    { id: 'activate-license-banner-btn', txt: 'activate_license' },
    { id: 'reload-scripts-btn', txt: 'reload' }
  ].forEach(x => {
    const btn = document.getElementById(x.id);
    if (btn) btn.innerText = t(x.txt);
  });
  // Pour les quick actions, ne touche QUE le texte du label
  const quickActButtonLabels = [
    { selector: '#run-selected-btn .stat-label', key: 'run_on_selected' },
    { selector: '#run-all-btn .stat-label', key: 'run_on_all' },
    { selector: '#stop-all-btn .stat-label', key: 'stop_all' },
    { selector: '#stop-selected-btn .stat-label', key: 'stop_selected' },
    { selector: '#pause-selected-btn .stat-label', key: 'pause_selected' },
    { selector: '#pause-all-btn .stat-label', key: 'pause_all' },
    { selector: '#resume-selected-btn .stat-label', key: 'resume_selected' },
    { selector: '#resume-all-btn .stat-label', key: 'resume_all' },
    { selector: '#screenshot-btn .stat-label', key: 'take_screenshot' },
    { selector: '#scrcpy-btn .stat-label', key: 'open_scrcpy' },
    // Actions section buttons
    { selector: '#run-selected-btn-section .stat-label', key: 'run_on_selected' },
    { selector: '#run-all-btn-section .stat-label', key: 'run_on_all' },
    { selector: '#stop-all-btn-section .stat-label', key: 'stop_all' },
    { selector: '#stop-selected-btn-section .stat-label', key: 'stop_selected' },
    { selector: '#pause-selected-btn-section .stat-label', key: 'pause_selected' },
    { selector: '#pause-all-btn-section .stat-label', key: 'pause_all' },
    { selector: '#resume-selected-btn-section .stat-label', key: 'resume_selected' },
    { selector: '#resume-all-btn-section .stat-label', key: 'resume_all' },
    { selector: '#screenshot-btn-section .stat-label', key: 'take_screenshot' },
    { selector: '#scrcpy-btn-section .stat-label', key: 'open_scrcpy' }
  ];
  quickActButtonLabels.forEach(({selector, key}) => {
    const lbl = document.querySelector(selector);
    if (lbl) {
      lbl.textContent = t(key);
      lbl.setAttribute('data-i18n-key', key);
    }
  });

  // Card headings (do ones visible)
  document.querySelectorAll('.card-header h3').forEach(h3 => {
    const orig = h3.textContent.toLowerCase();
    if (orig.includes('actions rapides')) h3.textContent = '⚡ ' + t('quick_actions');
    if (orig.includes('scripts disponibles')) h3.textContent = '📜 ' + t('scripts_available');
    if (orig.includes('gestion des scripts') || orig.includes('actions')) h3.textContent = '⚡ ' + t('actions');
    if (orig.includes('détails du script')) h3.textContent = '🧾 ' + t('script_details');
    if (orig.includes('console de debug')) h3.textContent = '📝 ' + t('debug_console');
    if (orig.includes('paramètres généraux')) h3.textContent = '⚙️ ' + t('general_settings');
    if (orig.includes('paramètres scrcpy')) h3.textContent = '📱 ' + t('scrcpy_settings');
    if (orig.includes('gestion licence')) h3.textContent = '🔑 ' + t('license_management');
    if (orig.includes('paramètres avancés')) h3.textContent = '🔧 ' + t('advanced_settings');
    if (orig.includes('appareils connectés')) h3.textContent = '📱 ' + t('devices_connected');
    if (orig.includes('raccourcis clavier')) h3.textContent = '⌨️ ' + t('keyboard_shortcuts');
  });
  
  // Re-render keyboard shortcuts when language changes (only if modal is open)
  if (document.getElementById('shortcuts-modal') && !document.getElementById('shortcuts-modal').classList.contains('hidden')) {
    renderKeyboardShortcuts();
  }

  // Playground & Save/Cancel etc
  document.querySelectorAll('.btn-label,.btn,button').forEach(btn => {
    let txt = btn.textContent.trim().toLowerCase();
    if(txt === 'sauvegarder'||txt==='save') btn.textContent = t('save');
    if(txt === 'annuler'||txt==='cancel') btn.textContent = t('cancel');
    if(txt === 'ouvrir éditeur'||txt === 'open editor') btn.textContent = t('open_editor');
    if(txt === 'dupliquer') btn.textContent = t('duplicate');
    if(txt === 'supprimer') btn.textContent = t('delete');
    if(txt === 'lancer sur sélection' || txt === 'run on selected') btn.textContent = t('run_on_selected');
    if(txt === 'lancer sur tous' || txt === 'run on all') btn.textContent = t('run_on_all');
    if(txt === 'arrêter tout' || txt === 'stop all') btn.textContent = t('stop_all');
    if(txt === 'capture écran') btn.textContent = t('take_screenshot');
    if(txt === 'ouvrir scrcpy') btn.textContent = t('open_scrcpy');
    if(txt === 'effacer') btn.textContent = t('clear');
    if(txt === 'exporter') btn.textContent = t('export');
  });
  // Placeholders for path/directory
  const pathPlch = document.getElementById('scripts-path-section');
  if(pathPlch) pathPlch.placeholder = t('scripts_folder');
  const shotsPlch = document.getElementById('screenshots-path');
  if(shotsPlch) shotsPlch.placeholder = t('screenshots_folder');
  // Label for language select
  const lblLang = document.getElementById('label-language');
  if(lblLang) lblLang.textContent = t('language');
  // Wire select to lang change
  updateLanguageDropdown();
  // Remplace le texte dans .stat-label sans casser le SVG
  const quickActLabels = [
    { selector: '#run-selected-btn .stat-label', key: 'run_on_selected' },
    { selector: '#run-all-btn .stat-label', key: 'run_on_all' },
    { selector: '#stop-all-btn .stat-label', key: 'stop_all' },
    { selector: '#screenshot-btn .stat-label', key: 'take_screenshot' },
    { selector: '#scrcpy-btn .stat-label', key: 'open_scrcpy' }
  ];
  quickActLabels.forEach(({selector, key}) => {
    const labelEl = document.querySelector(selector);
    if(labelEl) { labelEl.textContent = t(key); labelEl.setAttribute('data-i18n-key', key); }
  });
  updateLicenseIndicator();
  
  // Update buttons labels
  const checkBtn = document.getElementById('check-updates-btn');
  if (checkBtn && !checkBtn.disabled) {
    checkBtn.textContent = '🔄 ' + t('check_for_updates');
  }
  const downloadBtn = document.getElementById('download-update-btn');
  if (downloadBtn) {
    downloadBtn.textContent = '📥 ' + t('download_update');
  }
  const installBtn = document.getElementById('install-update-btn');
  if (installBtn) {
    installBtn.textContent = '🚀 ' + t('install_update');
  }
}

// PATCH: Make status and key action labels fully translatable everywhere
function updateStatusDeviceCount(count) {
  // Utilise la clé de langue pour "appareil(s) connecté(s)" ou "devices connected"
  let txt = `● ${count} ` + (count > 1 ? t('devices_connected') : t('device_connected'));
  const statusDiv = document.getElementById('status');
  if (statusDiv) statusDiv.textContent = txt;
}

// PATCH BOUTONS REFRESH
function updateRefreshButtons() {
  document.querySelectorAll('#refresh-btn, #control-refresh-btn, #header-refresh-btn').forEach(btn => {
    if (btn) {
      const refreshLabel = btn.querySelector('.refresh-label');
      if (refreshLabel) {
        refreshLabel.textContent = t('refresh');
        refreshLabel.setAttribute('data-i18n-text', 'refresh');
      } else {
        // Pour le bouton header qui n'a pas de label séparé
        const text = btn.textContent.trim();
        if (text.includes('Actualiser') || text.includes('Refresh')) {
          btn.innerHTML = '🔄 ' + t('refresh');
        }
      }
    }
  });
}
// Appelle updateRefreshButtons depuis updateLocalizedUI
updateRefreshButtons();
// PATCH SCRIPT DETAILS LABELS
function updateScriptDetailsLabels() {
  const fields = [
    { sel: '#script-detail strong[for=name]', key: 'script_name' },
    { sel: '#script-detail strong[for=version]', key: 'script_version' },
    { sel: '#script-detail strong[for=duration]', key: 'max_duration' },
    { sel: '#script-detail strong[for=file]', key: 'file' }
  ];
  fields.forEach(f => {
    const el = document.querySelector(f.sel);
    if (el) el.textContent = t(f.key)+':';
  });
}
// Appelle updateScriptDetailsLabels dans updateLocalizedUI()
updateScriptDetailsLabels();

function updateControlSectionLabels() {
  // Titres principaux
  const titleMap = [
    {sel:'#control-section .card-header h3', key:'devices'},
    {sel:'.control-master .card-header h3', key:'device_controls'},
  ];
  titleMap.forEach(({sel,key})=>{const el=document.querySelector(sel);if(el)el.innerHTML=(key==='device_controls'?'<span class="material-symbols-outlined">tune</span> ':'')+t(key);});
  // Sous-sections
  const secMap=[
    {sel:'.control-section:eq(0) .section-header h4',key:'system'},
    {sel:'.control-section:eq(1) .section-header h4',key:'audio'},
    {sel:'.control-section:eq(2) .section-header h4',key:'display'},
    {sel:'.control-section:eq(3) .section-header h4',key:'actions'},
    {sel:'.control-section:eq(4) .section-header h4',key:'navigation'},
  ];
  document.querySelectorAll('#control-section .section-header h4').forEach((node,i)=>{ 
    const k = ['system','audio','display','actions','navigation'][i];
    if(node)node.textContent=t(k);
  });
  // Boutons
  const btns = [
    {id:'ctrl-poweroff', key:'poweroff'},
    {id:'ctrl-reboot', key:'reboot'},
    {id:'ctrl-screen', key:'screen'},
    {id:'ctrl-airplane-on', key:'airplane_on'},
    {id:'ctrl-airplane-off', key:'airplane_off'},
    {id:'ctrl-screenshot', key:'screenshot'},
    {id:'ctrl-scrcpy', key:'scrcpy'},
    {id:'ctrl-mute', key:'mute'},
    {id:'ctrl-wifi-on', key:'wifi_on'},
    {id:'ctrl-wifi-off', key:'wifi_off'}
  ];
  btns.forEach(({id,key})=>{
    const lbl = document.querySelector(`#${id} .btn-label`);
    if(lbl)lbl.textContent=t(key);
  });
}
// Ajoute dans updateLocalizedUI
updateControlSectionLabels();

function updateControlLabelsUI() {
  // Sliders
  const vol = document.querySelector('.slider-label[for=volume]');
  if (vol) vol.textContent = t('volume');
  const bri = document.querySelector('.slider-label[for=brightness]');
  if (bri) bri.textContent = t('brightness');
  // Buttons nav
  const navBtns = [
    {id:'ctrl-nav-back', key:'back'},
    {id:'ctrl-nav-home', key:'home'},
    {id:'ctrl-nav-recent', key:'recent'},
    {id:'ctrl-nav-menu', key:'menu'}
  ];
  navBtns.forEach(({id, key})=> {
    const lbl = document.querySelector(`#${id} .btn-label`);
    if(lbl) lbl.textContent = t(key);
  });
}
updateControlLabelsUI();

// Ajoute patch updateLocalizedUI pour clear/export
function updateConsoleActionsLabels() {
  const btnClear = document.getElementById('clear-console-btn');
  if(btnClear) btnClear.innerHTML = `🗑️ ${t('clear')}`;
  const btnExport = document.getElementById('export-logs-btn');
  if(btnExport) btnExport.innerHTML = `📋 ${t('export')}`;
  const cardH3 = document.querySelector('#console-section .card-header h3');
  if (cardH3) cardH3.innerHTML = `📝 ${t('debug_console')}`;
}
// Dans updateLocalizedUI() ajoute :

// Keyboard Shortcuts Functions
function formatKeyDisplay(key) {
  if (!key) return '';
  return key
    .replace('Control', 'Ctrl')
    .replace('Meta', 'Cmd')
    .replace('Alt', 'Alt')
    .replace('Shift', 'Shift')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓')
    .replace('ArrowLeft', '←')
    .replace('ArrowRight', '→');
}

function renderKeyboardShortcuts() {
  const container = document.getElementById('shortcuts-container');
  if (!container) {
    // Container might not exist if modal is not open yet
    return;
  }
  
  const shortcutsList = [
    { id: 'run_selected', labelKey: 'run_on_selected' },
    { id: 'pause_selected', labelKey: 'pause_selected' },
    { id: 'resume_selected', labelKey: 'resume_selected' },
    { id: 'stop_all', labelKey: 'stop_all' },
    { id: 'screenshot', labelKey: 'take_screenshot' },
    { id: 'scrcpy', labelKey: 'open_scrcpy' },
    { id: 'refresh_devices', labelKey: 'refresh' }
  ];
  
  container.innerHTML = shortcutsList.map(item => {
    const currentKey = customShortcuts[item.id] || defaultShortcuts[item.id]?.key;
    const displayKey = formatKeyDisplay(currentKey);
    
    return `
      <div class="shortcut-item" data-shortcut-id="${item.id}">
        <span class="shortcut-label">${t(item.labelKey)}</span>
        <div class="shortcut-input">
          <div class="shortcut-key-display ${!currentKey ? 'empty' : ''}" 
               data-shortcut-id="${item.id}"
               title="${t('shortcut_edit')}">
            ${displayKey || t('shortcut_edit')}
          </div>
          <button class="shortcut-reset-btn" data-shortcut-id="${item.id}" title="${t('shortcut_reset')}">
            ${t('shortcut_reset')}
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Attach event listeners
  container.querySelectorAll('.shortcut-key-display').forEach(el => {
    el.addEventListener('click', () => startEditingShortcut(el.dataset.shortcutId));
  });
  
  container.querySelectorAll('.shortcut-reset-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      resetShortcut(el.dataset.shortcutId);
    });
  });
}

let editingShortcutId = null;

function startEditingShortcut(shortcutId) {
  if (editingShortcutId) cancelEditingShortcut();
  
  editingShortcutId = shortcutId;
  const display = document.querySelector(`.shortcut-key-display[data-shortcut-id="${shortcutId}"]`);
  if (!display) return;
  
  display.classList.add('editing');
  display.textContent = t('shortcut_recording');
  
  const handler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.key === 'Escape') {
      cancelEditingShortcut();
      document.removeEventListener('keydown', handler);
      return;
    }
    
    const modifiers = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.altKey) modifiers.push('Alt');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.metaKey) modifiers.push('Meta');
    
    if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') {
      return; // Wait for actual key
    }
    
    const keyString = modifiers.length > 0 
      ? `${modifiers.join('+')}+${e.key}` 
      : e.key;
    
    // Check for conflicts
    const conflict = Object.entries({...defaultShortcuts, ...customShortcuts})
      .find(([id, data]) => {
        if (id === shortcutId) return false;
        const existingKey = customShortcuts[id] || defaultShortcuts[id]?.key;
        return existingKey === keyString;
      });
    
    if (conflict) {
      showInlineToast('error', t('shortcut_conflict'), t('shortcut_conflict'));
      cancelEditingShortcut();
      document.removeEventListener('keydown', handler);
      return;
    }
    
    customShortcuts[shortcutId] = keyString;
    saveSettings();
    setupKeyboardShortcuts();
    renderKeyboardShortcuts();
    showInlineToast('success', t('shortcut_saved'), t('shortcut_saved'));
    
    document.removeEventListener('keydown', handler);
    editingShortcutId = null;
  };
  
  document.addEventListener('keydown', handler);
}

function cancelEditingShortcut() {
  if (editingShortcutId) {
    const display = document.querySelector(`.shortcut-key-display[data-shortcut-id="${editingShortcutId}"]`);
    if (display) {
      display.classList.remove('editing');
      const currentKey = customShortcuts[editingShortcutId] || defaultShortcuts[editingShortcutId]?.key;
      display.textContent = formatKeyDisplay(currentKey) || t('shortcut_edit');
    }
    editingShortcutId = null;
  }
}

function resetShortcut(shortcutId) {
  delete customShortcuts[shortcutId];
  saveSettings();
  setupKeyboardShortcuts();
  renderKeyboardShortcuts();
}

function setupKeyboardShortcuts() {
  // Global keyboard handler
  document.removeEventListener('keydown', handleGlobalShortcut);
  document.addEventListener('keydown', handleGlobalShortcut);
}

function handleGlobalShortcut(e) {
  // Don't interfere with input fields
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }
  
  // Don't interfere if editing a shortcut
  if (editingShortcutId) {
    return;
  }
  
  const modifiers = [];
  if (e.ctrlKey) modifiers.push('Ctrl');
  if (e.altKey) modifiers.push('Alt');
  if (e.shiftKey) modifiers.push('Shift');
  if (e.metaKey) modifiers.push('Meta');
  
  const keyString = modifiers.length > 0 
    ? `${modifiers.join('+')}+${e.key}` 
    : e.key;
  
  // Check custom shortcuts first, then defaults
  for (const [id, def] of Object.entries(defaultShortcuts)) {
    const shortcutKey = customShortcuts[id] || def.key;
    if (shortcutKey === keyString) {
      e.preventDefault();
      def.action();
      return;
    }
  }
}
updateConsoleActionsLabels();