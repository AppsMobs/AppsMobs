// AppsMobs Pro - Electron Renderer
// Initialization complete

// State management
let devices = [];
let scripts = [];
let selectedDevices = new Set();
let selectedScripts = new Set();
const runningScripts = new Map(); // serial -> { name, start }

// DOM elements
const devicesGrid = document.getElementById('devices-grid');
const controlDevicesGrid = document.getElementById('control-devices-grid');
const scriptsGrid = document.getElementById('scripts-grid');
const consoleOutput = document.getElementById('console-output');
const statusElement = document.getElementById('status');
const devicesSearchInput = document.getElementById('devices-search');
const scriptsSearchInput = document.getElementById('scripts-search');

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
  // maj UI settings select
  const langSelect = document.getElementById('select-language');
  if(langSelect && langSelect.value !== l){
    langSelect.value = l;
  }
}
function t(key, options = {}) {
  let translated = translations[key] || key;
  if (options && typeof translated === 'string') {
    for (const [k, v] of Object.entries(options)) {
      translated = translated.replace(`{{${k}}}`, v);
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

  // Device actions
  on('refresh-btn', 'click', refreshDevices);
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
  on('report-btn', 'click', showReport);

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

  // Settings toggles and sliders
  setupSettingsListeners();

  // Search (devices & scripts)
  if (devicesSearchInput) devicesSearchInput.addEventListener('input', filterDevices);
  const devicesSearchBtn = document.getElementById('devices-search-btn');
  if (devicesSearchBtn) devicesSearchBtn.addEventListener('click', filterDevices);

  if (scriptsSearchInput) scriptsSearchInput.addEventListener('input', filterScripts);
  const scriptsSearchBtn = document.getElementById('scripts-search-btn');
  if (scriptsSearchBtn) scriptsSearchBtn.addEventListener('click', filterScripts);

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
  });
  window.electronAPI.onScriptExit(({ serial, code }) => {
    log(`[${serial}] Script terminé (code ${code})`, code === 0 ? 'SUCCESS' : 'ERROR');
    runningScripts.delete(serial);
    renderDevices();
    updateStatus('● Prêt');
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
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.classList.add('loading');
  const btn2 = document.getElementById('control-refresh-btn');
  if (btn2) btn2.classList.add('loading');
  
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
    if (btn) btn.classList.remove('loading');
    if (btn2) btn2.classList.remove('loading');
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
          <span class="device-type ${typeClass}" style="margin-left: 8px; font-size:12px; font-weight:bold; padding:2px 6px; border-radius:9px; background:${device.type==='emulator'?'#7cdfff50':'#35ef6150'}; color:${device.type==='emulator'?'#069':'#063'}">${typeLabel}</span>
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
  scriptsGrid.innerHTML = scripts.map(script => {
    const isSelected = selectedScripts.has(script.name);
    
    return `
      <div class="script-card ${isSelected ? 'selected' : ''}" data-script="${script.name}">
        <div class="script-name">${script.name}</div>
        <div class="script-details">
          <span>v${script.version}</span>
          <span>${script.duration}</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Update stats
  scriptsCount.textContent = scripts.length;
  
  // Also update scripts in the scripts section
  const scriptsGridSection = document.getElementById('scripts-grid-section');
  if (scriptsGridSection) {
    scriptsGridSection.innerHTML = scriptsGrid.innerHTML;
    bindScriptsSectionEvents();
  }
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

  const start = Date.now();
  serials.forEach(s => runningScripts.set(s, { name: script.name, start }));
  renderDevices();

  const results = await window.electronAPI.runScriptOnDevices(script.file, serials, { openViewer: false });
  results.forEach(r => {
    if (!r.ok) {
      log(`[${r.serial}] Erreur lancement: ${r.message || 'inconnue'}`, 'ERROR');
      runningScripts.delete(r.serial);
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
  });
}

function showReport() {
  const report = `📊 RAPPORT APPSMOBS PRO
${'='.repeat(50)}

Appareils connectés: ${devices.length}
Scripts chargés: ${scripts.length}
Appareils sélectionnés: ${selectedDevices.size}
Scripts sélectionnés: ${selectedScripts.size}

Détails des appareils:
${devices.map(d => `- ${d.serial}: ${d.status}`).join('\n')}

Scripts disponibles:
${scripts.map(s => `- ${s.name} (v${s.version})`).join('\n')}`;

  log(report, 'INFO');
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
function setupSettingsListeners() {
  // Toggle switches
  const autoRefresh = document.getElementById('auto-refresh');
  const debugMode = document.getElementById('debug-mode');
  const soundAlerts = document.getElementById('sound-alerts');
  
  if (autoRefresh) autoRefresh.addEventListener('change', saveSettings);
  if (debugMode) debugMode.addEventListener('change', saveSettings);
  if (soundAlerts) soundAlerts.addEventListener('change', saveSettings);
  
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

  // Select dropdowns
  document.getElementById('log-level').addEventListener('change', saveSettings);

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

  // Language select
  const langSelect = document.getElementById('select-language');
  if(langSelect){
    langSelect.value = lang;
    langSelect.onchange = e => setLang(e.target.value);
  }
}

function saveSettings() {
  const settings = {
    autoRefresh: document.getElementById('auto-refresh')?.checked ?? true,
    debugMode: document.getElementById('debug-mode')?.checked ?? false,
    soundAlerts: document.getElementById('sound-alerts')?.checked ?? true,
    darkTheme: document.getElementById('dark-theme')?.checked ?? true,
    scrcpyFps: document.getElementById('scrcpy-fps')?.value ?? 15,
    scrcpyBitrate: document.getElementById('scrcpy-bitrate')?.value ?? 8,
    scrcpyWidth: document.getElementById('scrcpy-width')?.value ?? 1080,
    logLevel: document.getElementById('log-level')?.value ?? 'INFO',
    scriptsPath: document.getElementById('scripts-path')?.value ?? '',
    screenshotsPath: document.getElementById('screenshots-path')?.value ?? '',
    language: document.getElementById('select-language')?.value ?? 'en' // Save selected language
  };
  
  localStorage.setItem('appsmobs-settings', JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem('appsmobs-settings');
  if (saved) {
    const settings = JSON.parse(saved);
    document.getElementById('auto-refresh').checked = settings.autoRefresh ?? true;
    document.getElementById('debug-mode').checked = settings.debugMode ?? false;
    document.getElementById('sound-alerts').checked = settings.soundAlerts ?? true;
    
    // Load dark theme (only if not disabled)
    const darkThemeToggle = document.getElementById('dark-theme');
    if (darkThemeToggle && !darkThemeToggle.disabled) {
      darkThemeToggle.checked = settings.darkTheme ?? true;
    }
    
    document.getElementById('scrcpy-fps').value = settings.scrcpyFps ?? 15;
    document.getElementById('scrcpy-bitrate').value = settings.scrcpyBitrate ?? 8;
    document.getElementById('scrcpy-width').value = settings.scrcpyWidth ?? 1080;
    document.getElementById('log-level').value = settings.logLevel ?? 'INFO';
    
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

function updateLocalizedUI() {
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
    {selector: '#scripts-count', key: 'scripts_loaded'},
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
    { selector: '#screenshot-btn .stat-label', key: 'take_screenshot' },
    { selector: '#scrcpy-btn .stat-label', key: 'open_scrcpy' },
    { selector: '#report-btn .stat-label', key: 'report' }
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
    if (orig.includes('gestion des scripts')) h3.textContent = '⚙️ ' + t('manage_scripts');
    if (orig.includes('détails du script')) h3.textContent = '🧾 ' + t('script_details');
    if (orig.includes('console de debug')) h3.textContent = '📝 ' + t('debug_console');
  });

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
    if(txt === 'rapport' || txt === 'report') btn.textContent = t('report');
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
  const langSelect = document.getElementById('select-language');
  if(langSelect){
    langSelect.value = lang;
    langSelect.onchange = e => setLang(e.target.value);
  }
  // Remplace le texte dans .stat-label sans casser le SVG
  const quickActLabels = [
    { selector: '#run-selected-btn .stat-label', key: 'run_on_selected' },
    { selector: '#run-all-btn .stat-label', key: 'run_on_all' },
    { selector: '#stop-all-btn .stat-label', key: 'stop_all' },
    { selector: '#screenshot-btn .stat-label', key: 'take_screenshot' },
    { selector: '#scrcpy-btn .stat-label', key: 'open_scrcpy' },
    { selector: '#report-btn .stat-label', key: 'report' }
  ];
  quickActLabels.forEach(({selector, key}) => {
    const labelEl = document.querySelector(selector);
    if(labelEl) { labelEl.textContent = t(key); labelEl.setAttribute('data-i18n-key', key); }
  });
  updateLicenseIndicator();
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
  const btns = [document.getElementById('refresh-btn'), document.getElementById('control-refresh-btn')];
  btns.forEach(btn => {
    if (btn) {
      btn.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle;margin-right:3px;">refresh</span>' + t('refresh');
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
// Dans updateLocalizedUI() ajoute :
updateConsoleActionsLabels();