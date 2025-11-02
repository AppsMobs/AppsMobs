import { app, BrowserWindow, ipcMain, dialog, shell, Notification } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { showNotification, showInfo, showSuccess, showWarning, showError } from './utils/notifications.js';
import { showAlert, showConfirm, createModal } from './utils/popups.js';

// Expose version (for IPC)
import pkg from './package.json' assert { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Réduire les erreurs de cache GPU sous Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disk-cache-size', '0');
app.commandLine.appendSwitch('disable-http-cache');

// ============================================================================
// NOUVELLE IMPLÉMENTATION SCRCPY - SANS FENÊTRES CMD
// ============================================================================

// Gestionnaire des processus scrcpy actifs
const activeScrcpyProcesses = new Map();

// Gestionnaire d'authentification
let authWindow = null;
let mainWindow = null;
let isAuthenticated = false;
let licenseInfo = null; // { token, plan, expires_at }

// Génération/stockage d'un identifiant appareil stable (device_id)
function getUserConfigPath() {
  try {
    const userData = app.getPath('userData');
    return path.join(userData, 'config.json');
  } catch {
    // Fallback: dossier parent du projet (moins idéal, mais évite l'échec)
    return path.join(__dirname, '..', 'config.json');
  }
}

function computeDeviceId() {
  try {
    const parts = [];
    const hostname = os.hostname();
    if (hostname) parts.push(hostname);
    const ifaces = os.networkInterfaces() || {};
    for (const name of Object.keys(ifaces)) {
      for (const net of ifaces[name] || []) {
        if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
          parts.push(net.mac);
        }
      }
    }
    const base = parts.join('|') || `${hostname}|${process.platform}`;
    const hash = require('crypto').createHash('sha256').update(base).digest('hex');
    return hash.slice(0, 32);
  } catch {
    // Fallback aléatoire persistant si stocké ensuite
    return Math.random().toString(36).slice(2).padEnd(16, '0');
  }
}

function readJsonSafe(p) {
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {}
  return {};
}

function writeJsonSafe(p, obj) {
  try {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
  } catch {}
}

function getOrCreateDeviceId() {
  const cfgPath = getUserConfigPath();
  const cfg = readJsonSafe(cfgPath);
  if (cfg.device_id && typeof cfg.device_id === 'string') return cfg.device_id;
  const dev = computeDeviceId();
  cfg.device_id = dev;
  writeJsonSafe(cfgPath, cfg);
  return dev;
}

function readAuthConfig() {
  const cfgPath = getUserConfigPath();
  const cfg = readJsonSafe(cfgPath);
  const lic = cfg.license;
  if (lic && typeof lic === 'object') {
    return {
      token: lic.token,
      plan: lic.plan,
      expires_at: lic.expires_at || null
    };
  }
  return null;
}

function saveAuthConfig(plan, token, expires_at) {
  const cfgPath = getUserConfigPath();
  const cfg = readJsonSafe(cfgPath);
  cfg.license = { plan, token, expires_at, saved_at: Math.floor(Date.now() / 1000), device_id: getOrCreateDeviceId() };
  cfg.plan = plan;
  writeJsonSafe(cfgPath, cfg);
}

// ============================================================================
// SYSTÈME D'AUTHENTIFICATION
// ============================================================================

function createAuthWindow() {
  const iconPath = path.join(__dirname, '..', 'assets', 'icons', 'Logo.png');
  const hasIcon = fs.existsSync(iconPath);
  const authWindowOptions = {
    width: 560,
    height: 990,
    resizable: true,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'AppsMobs - Authentification',
    show: false
  };
  if (hasIcon) authWindowOptions.icon = iconPath;
  authWindow = new BrowserWindow(authWindowOptions);
  if (app.isPackaged) {
    try { authWindow.webContents.on('devtools-opened', () => authWindow.webContents.closeDevTools()); } catch {}
  }

  authWindow.loadFile(path.join(__dirname, 'renderer', 'auth.html'));

  authWindow.once('ready-to-show', () => {
    authWindow.show();
  });

  // Ouvrir les liens externes dans le navigateur par défaut
  authWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  authWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  authWindow.on('closed', () => {
    authWindow = null;
    if (!isAuthenticated) {
      app.quit();
    }
  });
}

function createMainWindow() {
  const iconPathMain = path.join(__dirname, '..', 'assets', 'icons', 'Logo.png');
  const hasIconMain = fs.existsSync(iconPathMain);
  const mainWindowOptions = {
    width: 1400,
    height: 960,
    minWidth: 1200,
    minHeight: 760,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'AppsMobs Pro',
    show: false
  };
  if (hasIconMain) mainWindowOptions.icon = iconPathMain;
  mainWindow = new BrowserWindow(mainWindowOptions);
  if (app.isPackaged) {
    try { mainWindow.webContents.on('devtools-opened', () => mainWindow.webContents.closeDevTools()); } catch {}
  }

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    try { mainWindow.maximize(); } catch {}
    if (authWindow) {
      authWindow.close();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function checkLicenseOnline() {
  try {
    const cfgPath = path.join(__dirname, '..', 'config.json');
    let base = process.env.LICENSE_SERVER_URL;
    if (!base && fs.existsSync(cfgPath)) {
      try { const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); base = cfg.license_server_url; } catch {}
    }
    if (!base || !licenseInfo || !licenseInfo.token) return { ok: false, message: 'No token' };
    const headers = { 'Content-Type': 'application/json' };
    const anon = process.env.SUPABASE_ANON_KEY;
    if (anon) { headers['Authorization'] = `Bearer ${anon}`; headers['apikey'] = anon; }
    const device_id = getOrCreateDeviceId();
    const res = await fetch(`${base}/api/check`, { method: 'POST', headers, body: JSON.stringify({ token: licenseInfo.token, device_id }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, message: data.message || 'Invalid' };
    // Optionally refresh expires_at
    if (data.expires_at) {
      licenseInfo.expires_at = data.expires_at;
      saveAuthConfig(data.plan || licenseInfo.plan, licenseInfo.token, data.expires_at);
    }
    return { ok: true };
  } catch (e) { return { ok: false, message: String(e) }; }
}

function scheduleLicenseWatchdog() {
  // First check after short delay, then every 60 minutes
  setTimeout(async () => {
    const res = await checkLicenseOnline();
    if (!res.ok) {
      try { dialog.showErrorBox('Licence', `Votre licence n'est plus valide: ${res.message || ''}`); } catch {}
      isAuthenticated = false; licenseInfo = null;
      try { if (mainWindow) mainWindow.close(); } catch {}
      createAuthWindow();
      return;
    }
    setInterval(async () => {
      const r = await checkLicenseOnline();
      if (!r.ok) {
        try { dialog.showErrorBox('Licence', `Votre licence n'est plus valide: ${r.message || ''}`); } catch {}
        isAuthenticated = false; licenseInfo = null;
        try { if (mainWindow) mainWindow.close(); } catch {}
        createAuthWindow();
      }
    }, 60 * 60 * 1000);
  }, 15000);
}

function base64urlToBuffer(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = 4 - (input.length % 4);
  if (pad !== 4) input += '='.repeat(pad);
  return Buffer.from(input, 'base64');
}

function verifyJwtRS256(token, publicKeyPem) {
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) return false;
    const [h, p, s] = parts;
    const data = Buffer.from(`${h}.${p}`);
    const sig = base64urlToBuffer(s);
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(data);
    verifier.end();
    return verifier.verify(publicKeyPem, sig);
  } catch { return false; }
}

function findScrcpyExecutable() {
  // 1) Variable d'environnement explicite
  if (process.env.SCRCPY_PATH && fs.existsSync(process.env.SCRCPY_PATH)) {
    console.log(`[scrcpy] Trouvé via SCRCPY_PATH: ${process.env.SCRCPY_PATH}`);
    return process.env.SCRCPY_PATH;
  }

  // 2) Chemins Windows communs (sans execSync pour éviter les CMD)
  if (process.platform === 'win32') {
    const commonPaths = [
      'C:/Program Files/scrcpy/scrcpy.exe',
      'C:/Program Files (x86)/scrcpy/scrcpy.exe',
      'C:/scrcpy/scrcpy.exe',
      'C:/tools/scrcpy/scrcpy.exe',
      'scrcpy.exe', // Dans PATH
      'scrcpy'      // Dans PATH
    ];
    
    for (const path of commonPaths) {
      if (fs.existsSync(path)) {
        console.log(`[scrcpy] Trouvé: ${path}`);
        return path;
      }
    }
  }

  // 3) Fallback: essayer directement
  console.log(`[scrcpy] Utilisation du fallback: scrcpy`);
  return 'scrcpy';
}

function launchScrcpy(serial) {
  return new Promise((resolve) => {
    try {
      // Validation de sécurité: format du serial
      if (!serial || typeof serial !== 'string' || !/^[a-zA-Z0-9:._-]+$/.test(serial)) {
        return resolve({ success: false, serial, message: 'Invalid serial format' });
      }

      console.log(`[scrcpy] === DEBUT LANCEMENT POUR ${serial} ===`);
      const scrcpyPath = findScrcpyExecutable();
      console.log(`[scrcpy] Lancement pour ${serial} avec: ${scrcpyPath}`);
      
      // Arguments optimisés pour Windows
      const args = [
        '-s', serial,
        '--max-fps', '15',
        '--video-bit-rate', '2M',
        '--max-size', '1920',
        '--stay-awake'
      ];

      // Configuration minimal pour scrcpy
      const spawnConfig = {
        stdio: 'ignore',
        shell: false
      };

      // Configuration Windows
      // NE PAS utiliser windowsHide ni CREATE_NO_WINDOW
      // car ils masquent aussi la fenêtre scrcpy
      // On utilise seulement la configuration de base

      console.log(`[scrcpy] Configuration:`, spawnConfig);
      console.log(`[scrcpy] Arguments:`, args);
      
      const child = spawn(scrcpyPath, args, spawnConfig);
      
      // Stocker le processus pour pouvoir l'arrêter plus tard
      activeScrcpyProcesses.set(serial, child);
      
      // Nettoyer la référence pour éviter les fuites mémoire
      child.unref();
      
      console.log(`[scrcpy] Processus lancé avec PID: ${child.pid}`);
      
      // Écouter les événements du processus
      child.on('exit', (code, signal) => {
        console.log(`[scrcpy] Processus ${serial} terminé (code: ${code}, signal: ${signal})`);
        activeScrcpyProcesses.delete(serial);
      });
      
      child.on('error', (error) => {
        console.error(`[scrcpy] Erreur processus ${serial}:`, error);
        activeScrcpyProcesses.delete(serial);
        resolve({ success: false, serial, message: `Erreur: ${error.message}` });
      });
      
      // Vérifier que le processus démarre correctement
      setTimeout(() => {
        if (child.exitCode === null) {
          console.log(`[scrcpy] ✅ Succès pour ${serial}`);
          resolve({ success: true, serial, path: scrcpyPath, pid: child.pid });
        } else {
          console.log(`[scrcpy] ❌ Échec pour ${serial} (code: ${child.exitCode})`);
          activeScrcpyProcesses.delete(serial);
          resolve({ success: false, serial, message: 'scrcpy s\'est arrêté immédiatement' });
        }
      }, 2000); // Augmenté à 2 secondes pour laisser plus de temps
      
    } catch (error) {
      console.error(`[scrcpy] Erreur:`, error);
      resolve({ success: false, serial, message: error.message });
    }
  });
}

function stopScrcpy(serial) {
  const process = activeScrcpyProcesses.get(serial);
  if (process) {
    try {
      process.kill();
      activeScrcpyProcesses.delete(serial);
      console.log(`[scrcpy] Arrêté pour ${serial}`);
      return true;
    } catch (error) {
      console.error(`[scrcpy] Erreur arrêt:`, error);
      return false;
    }
  }
  return false;
}

function isScrcpyProcessActive(serial) {
  const process = activeScrcpyProcesses.get(serial);
  if (!process) {
    return false;
  }
  
  // Vérifier si le processus est encore en vie
  // Sur Windows, on peut vérifier directement exitCode
  if (process.exitCode !== null) {
    // Le processus s'est terminé
    activeScrcpyProcesses.delete(serial);
    console.log(`[scrcpy] Processus ${serial} terminé (code: ${process.exitCode}), nettoyé`);
    return false;
  }
  
  return true;
}

// Handler IPC pour ouvrir scrcpy
ipcMain.handle('open-scrcpy', async (event, serial) => {
  // Vérifier si scrcpy est vraiment encore actif pour cet appareil
  if (isScrcpyProcessActive(serial)) {
    return { success: true, serial, message: 'scrcpy déjà ouvert' };
  }
  
  const result = await launchScrcpy(serial);
  return result;
});

// Handler IPC pour arrêter scrcpy
ipcMain.handle('stop-scrcpy', async (event, serial) => {
  return { success: stopScrcpy(serial) };
});

// Handler IPC pour obtenir la liste des processus scrcpy actifs
ipcMain.handle('get-active-scrcpy', async () => {
  // Nettoyer les processus morts avant de retourner la liste
  cleanupDeadProcesses();
  const active = Array.from(activeScrcpyProcesses.keys());
  return active;
});

// Fonction pour nettoyer les processus morts
function cleanupDeadProcesses() {
  const deadProcesses = [];
  for (const [serial, process] of activeScrcpyProcesses.entries()) {
    // Vérifier directement exitCode au lieu d'utiliser kill(0)
    if (process.exitCode !== null) {
      deadProcesses.push(serial);
    }
  }
  
  // Supprimer les processus morts
  deadProcesses.forEach(serial => {
    activeScrcpyProcesses.delete(serial);
    console.log(`[scrcpy] Nettoyage processus mort: ${serial}`);
  });
  
  if (deadProcesses.length > 0) {
    console.log(`[scrcpy] ${deadProcesses.length} processus mort(s) nettoyé(s)`);
  }
}

// ============================================================================
// RESTE DU CODE EXISTANT
// ============================================================================

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#0b1e27',
    title: 'AppsMobs Pro',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.maximize();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

// IPC handlers pour communiquer avec le renderer
const runningProcs = new Map(); // key: serial, value: ChildProcess
async function execAdb(args, opts = {}) {
  return new Promise((resolve) => {
    const adb = spawn('adb', args, {
      shell: process.platform === 'win32',
      windowsHide: process.platform === 'win32',
      creationFlags: process.platform === 'win32' ? 0x08000000 : undefined,
      ...opts
    });
    let stdout = '';
    let stderr = '';
    adb.stdout?.on('data', d => (stdout += d.toString()));
    adb.stderr?.on('data', d => (stderr += d.toString()));
    adb.on('close', () => resolve({ stdout, stderr }));
    adb.on('error', () => resolve({ stdout: '', stderr: 'error' }));
  });
}

// Replace autoConnectLDPlayer to only connect 5555
async function autoConnectLDPlayer() {
  try { await execAdb(['connect', '127.0.0.1:5555']); } catch {}
}

// Replace classifyDevice to use a single getprop
async function classifyDevice(serial) {
  // Get all properties in one shot
  const { stdout } = await execAdb(['-s', serial, 'shell', 'getprop']);
  const lines = (stdout || '').split(/\r?\n/);
  const m = new Map();
  lines.forEach(line => {
    const match = line.match(/^\[(.*?)\]: \[(.*)\]$/);
    if (match) m.set(match[1].toLowerCase(), match[2].toLowerCase());
  });

  const isLocalSerial = /^(127\.0\.0\.1|localhost):\d+$/.test(serial);
  const isStdEmuSerial = /^emulator-\d+$/.test(serial);
  const kqemu = m.get('ro.kernel.qemu') || '';
  const brand = m.get('ro.product.brand') || '';
  const manuf = m.get('ro.product.manufacturer') || '';
  const model = m.get('ro.product.model') || '';
  const chars = m.get('ro.build.characteristics') || '';
  const emuWords = ['emulator','sdk','ldplayer','bluestacks','vbox','generic','goldfish'];
  const hasEmu = emuWords.some(w => [brand, manuf, model, chars].join(' ').includes(w));
  const isEmulator = kqemu === '1' || isLocalSerial || isStdEmuSerial || hasEmu;
  return { type: isEmulator ? 'emulator' : 'device', brand, manuf, model };
}

ipcMain.handle('get-devices', async (event) => {
  try {
    console.log('ADB HANDLE GET-DEVICES...');
    await autoConnectLDPlayer();
    const { stdout } = await execAdb(['devices', '-l']);
    console.log('RAW:', stdout);
    const lines = (stdout || '').split(/\r?\n/).filter(line => line && !/list of devices/i.test(line));
    const base = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const serial = (parts[0] || '').trim();
      const status = (parts[1] || '').trim().toLowerCase();
      return { serial, status };
    }).filter(device => device.serial);

    // Pré-sépare mobiles et émulateurs
    const isEmuSerial = s => /(^127\.0\.0\.1:\d+$)|(^emulator-\d+$)/.test(s);
    const mobiles = base.filter(d => !isEmuSerial(d.serial) && d.status === 'device');
    const emulators = base.filter(d => isEmuSerial(d.serial) && d.status === 'device');

    // Enrichit tout de suite les mobiles (très rapide car réels)
    const mobOut = await Promise.all(mobiles.map(async d => {
      try {
        const info = await classifyDevice(d.serial); // peut aussi réduire à données fixes si besoin
        return { ...d, ...info };
      } catch {
        return { ...d, type: 'device' };
      }
    }));
    // Répond immédiatement avec les mobiles
    event.sender.send('partial-devices', mobOut); // canal dédié JS côté renderer (si tu veux l'utiliser)

    // EN PARALLÈLE, enrichit tous les émulateurs mais limite à 1.5 s timeout
    const classifyWithTimeout = (serial) => {
      return Promise.race([
        classifyDevice(serial),
        new Promise((_,rej) => setTimeout(()=>rej(`[TIMEOUT] classifyDevice ${serial}`), 1500))
      ]).catch(e => {
        console.warn('[EMU_CLASSIFY_ERROR]', serial, e);
        return { type: 'emulator', brand: '', manuf: '', model: '' };
      });
    };
    const emuOut = await Promise.all(emulators.map(async d => {
      try {
        const info = await classifyWithTimeout(d.serial);
        return { ...d, ...info };
      } catch {
        return { ...d, type: 'emulator' };
      }
    }));

    let enriched = [...mobOut, ...emuOut];
    console.log('ENRICHED:', enriched);
    let filtered = [];
    let filteredSerials = new Set();
    for (const d of enriched) {
      let portMatch = d.serial.match(/^127\.0\.0\.1:(\d+)$/);
      if (portMatch) {
        let emulatorNum = parseInt(portMatch[1], 10) - 1;
        let emuSerial = `emulator-${emulatorNum}`;
        if (enriched.some(e => e.serial === emuSerial && e.status === 'device')) continue;
      }
      if (/^emulator-\d+$/.test(d.serial)) {
        let portAlt = d.serial.match(/^emulator-(\d+)$/);
        if (portAlt) {
          let ipSerial = `127.0.0.1:${parseInt(portAlt[1], 10) + 1}`;
          if (filteredSerials.has(ipSerial)) continue;
        }
      }
      if (!filteredSerials.has(d.serial) && d.status === 'device') {
        filtered.push(d);
        filteredSerials.add(d.serial);
      }
    }
    setTimeout(()=>{},10);
    console.log('FILTERED:', filtered);
    return filtered;
  } catch (e) {
    console.error('ERROR IN ADB GET-DEVICES:', e && e.stack || e);
    return [];
  }
});

ipcMain.handle('setup-device', async (event, serial) => {
  return new Promise((resolve) => {
    const adb = spawn('adb', ['-s', serial, 'shell', 'echo', 'setup'], { 
      shell: false,
      windowsHide: process.platform === 'win32',
      creationFlags: process.platform === 'win32' ? 0x08000000 : undefined
    });
    
    adb.on('close', (code) => {
      resolve({ success: code === 0, serial });
    });
    
    adb.on('error', () => {
      resolve({ success: false, serial });
    });
  });
});

function getPythonCommand() {
  // 1) Préfère le venv local si présent
  try {
    const venvPy = process.platform === 'win32'
      ? path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe')
      : path.join(__dirname, '..', '.venv', 'bin', 'python');
    if (fs.existsSync(venvPy)) return venvPy;
  } catch {}
  // 2) Sinon python système
  try { execSync('python --version', { stdio: 'ignore' }); return 'python'; } catch {}
  if (process.platform === 'win32') return 'py';
  return 'python3';
}

ipcMain.handle('run-script-on-devices', async (event, { scriptFile, serials, options }) => {
  const results = [];
  const bridgePath = path.join(__dirname, 'bridge', 'run_script.py');

  // Validation de sécurité: scriptFile
  if (!scriptFile || typeof scriptFile !== 'string') {
    return [{ ok: false, message: 'Invalid scriptFile parameter' }];
  }

  // Validation de sécurité: path traversal protection
  const scriptsDir = path.join(__dirname, '..', 'scripts');
  let resolvedScriptPath;
  try {
    // Résoudre le chemin de manière sécurisée
    resolvedScriptPath = path.resolve(scriptsDir, scriptFile);
    const normalizedScriptsDir = path.resolve(scriptsDir) + path.sep;
    
    // Vérifier que le chemin résolu est bien dans le répertoire scripts
    if (!resolvedScriptPath.startsWith(normalizedScriptsDir)) {
      return [{ ok: false, message: 'Path traversal attempt detected' }];
    }
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(resolvedScriptPath)) {
      return [{ ok: false, message: 'Script file not found' }];
    }
  } catch (error) {
    return [{ ok: false, message: 'Invalid script path' }];
  }

  // Validation de sécurité: serials
  if (!Array.isArray(serials) || serials.length === 0) {
    return [{ ok: false, message: 'Invalid serials parameter' }];
  }

  for (const serial of serials) {
    try {
      // Validation de sécurité: format du serial (format ADB valide)
      if (!serial || typeof serial !== 'string' || !/^[a-zA-Z0-9:._-]+$/.test(serial)) {
        results.push({ serial, ok: false, message: 'Invalid serial format' });
        continue;
      }

      // Évite doublons
      if (runningProcs.has(serial)) {
        results.push({ serial, ok: false, message: 'Déjà en cours' });
        continue;
      }

      const py = getPythonCommand();
      // Build args: if using the Windows launcher 'py', add '-3';
      // otherwise (python/python3), call script directly without '-3'
      let args;
      // Utiliser le chemin résolu et validé
      if (process.platform === 'win32' && /(^|\\|\/)py(\.exe)?$/i.test(py)) {
        args = ['-3', '-u', bridgePath, resolvedScriptPath, serial];
      } else {
        args = ['-u', bridgePath, resolvedScriptPath, serial];
      }

      console.log('[run-script] Launching:', py, args);

      // Optionnel: ouvrir scrcpy avant d'exécuter
      if (options && options.openViewer === true) {
        await launchScrcpy(serial);
      }

      const child = spawn(py, args, { 
        cwd: path.join(__dirname, '..'), 
        shell: false,
        env: { 
          ...process.env, 
          ADB_SERIAL: serial,
          PATH: process.env.PATH,
          PYTHONUNBUFFERED: '1',
          PYTHONPATH: (() => { try { const root = path.join(__dirname, '..'); const cur = process.env.PYTHONPATH || ''; return cur ? (root + (process.platform === 'win32' ? ';' : ':') + cur) : root; } catch { return process.env.PYTHONPATH; } })()
        }
      });
      runningProcs.set(serial, child);

      let stdoutData = '';
      let stderrData = '';

      child.stdout?.on('data', (d) => {
        stdoutData += d.toString();
        event.sender.send('script-log', { serial, line: d.toString() });
      });
      child.stderr?.on('data', (d) => {
        stderrData += d.toString();
        event.sender.send('script-log', { serial, line: d.toString(), level: 'ERROR' });
      });
      child.on('close', (code) => {
        console.log(`[run-script] Process for ${serial} exited with code ${code}`);
        runningProcs.delete(serial);
        event.sender.send('script-exit', { serial, code: code || 0 });
      });

      results.push({ serial, ok: true });
    } catch (e) {
      console.error('[run-script] Error:', e);
      results.push({ serial, ok: false, message: String(e) });
    }
  }

  return results;
});

ipcMain.handle('stop-all-scripts', async () => {
  for (const [serial, child] of runningProcs.entries()) {
    try { child.kill(); } catch {}
    runningProcs.delete(serial);
  }
  return { ok: true };
});

ipcMain.handle('capture-screenshot', async (event, payload) => {
  return new Promise((resolve) => {
    const { serial, dir } = typeof payload === 'object' ? payload : { serial: payload, dir: undefined };
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const screenshotsDir = dir ? path.resolve(dir) : path.join(__dirname, '..', 'screenshots');
    
    // Créer le dossier screenshots s'il n'existe pas
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const outputFile = path.join(screenshotsDir, `${serial}_${timestamp}.png`);
    const adb = spawn('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { 
      shell: false,
      windowsHide: process.platform === 'win32',
      creationFlags: process.platform === 'win32' ? 0x08000000 : undefined
    });
    
    const writeStream = fs.createWriteStream(outputFile);
    adb.stdout.pipe(writeStream);
    
    adb.on('close', (code) => {
      writeStream.end();
      resolve({ 
        success: code === 0, 
        serial, 
        filePath: outputFile,
        fileName: path.basename(outputFile)
      });
    });
    
    adb.on('error', () => {
      writeStream.end();
      resolve({ success: false, serial });
    });
  });
});

// Contrôles appareil via ADB keyevents/commands
ipcMain.handle('device-action', async (_event, { serial, action, value }) => {
  try {
    if (!serial || !action) return { success: false, message: 'Paramètres manquants' };
    const map = {
      poweroff: ['-s', serial, 'shell', 'reboot', '-p'],
      reboot: ['-s', serial, 'shell', 'reboot'],
      screen_toggle: ['-s', serial, 'shell', 'input', 'keyevent', '26'],
      volume_up: ['-s', serial, 'shell', 'input', 'keyevent', '24'],
      volume_down: ['-s', serial, 'shell', 'input', 'keyevent', '25'],
      mute: ['-s', serial, 'shell', 'input', 'keyevent', '164'],
      bright_up: ['-s', serial, 'shell', 'input', 'keyevent', '221'],
      bright_down: ['-s', serial, 'shell', 'input', 'keyevent', '220'],
      airplane_on: ['-s', serial, 'shell', 'cmd', 'connectivity', 'airplane-mode', 'enable'],
      airplane_off: ['-s', serial, 'shell', 'cmd', 'connectivity', 'airplane-mode', 'disable'],
      wifi_on: ['-s', serial, 'shell', 'svc', 'wifi', 'enable'],
      wifi_off: ['-s', serial, 'shell', 'svc', 'wifi', 'disable'],
      nav_home: ['-s', serial, 'shell', 'input', 'keyevent', '3'],
      nav_back: ['-s', serial, 'shell', 'input', 'keyevent', '4'],
      nav_recent: ['-s', serial, 'shell', 'input', 'keyevent', '187'],
      nav_menu: ['-s', serial, 'shell', 'input', 'keyevent', '82'],
    };
    if (action === 'set_brightness') {
      const v = Math.max(0, Math.min(255, Number(value) || 0));
      // Forcer mode manuel + définir valeur
      const seq = [
        ['-s', serial, 'shell', 'settings', 'put', 'system', 'screen_brightness_mode', '0'],
        ['-s', serial, 'shell', 'settings', 'put', 'system', 'screen_brightness', String(v)],
      ];
      for (const args of seq) {
        const ok = await new Promise((resolve) => {
          const child = spawn('adb', args, { shell: false, windowsHide: process.platform === 'win32', creationFlags: process.platform === 'win32' ? 0x08000000 : undefined });
          child.on('close', (code) => resolve(code === 0));
          child.on('error', () => resolve(false));
        });
        if (!ok) return { success: false };
      }
      return { success: true };
    }
    const args = map[action];
    if (!args) return { success: false, message: `Action inconnue: ${action}` };
    return await new Promise((resolve) => {
      const child = spawn('adb', args, { shell: false, windowsHide: process.platform === 'win32', creationFlags: process.platform === 'win32' ? 0x08000000 : undefined });
      child.on('close', (code) => resolve({ success: code === 0 }));
      child.on('error', () => resolve({ success: false }));
    });
  } catch (e) {
    return { success: false, message: String(e) };
  }
});

ipcMain.handle('load-scripts', async (_event, baseDir) => {
  const scriptsDir = baseDir ? path.resolve(baseDir) : path.join(__dirname, '..', 'scripts');
  
  if (!fs.existsSync(scriptsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(scriptsDir);
  
  const scripts = files
    .filter(file => file.endsWith('.py') && !file.startsWith('_') && file !== '__init__.py')
    .map(file => ({
      name: file.replace('.py', ''),
      file: path.join(scriptsDir, file), // Use absolute path for bridge
      version: '1.0',
      duration: '60s'
    }));
  
  return scripts;
});

ipcMain.handle('delete-script', async (_event, { filePath }) => {
  try {
    if (!filePath) return { success: false, message: 'Chemin manquant' };
    if (!fs.existsSync(filePath)) return { success: false, message: 'Fichier introuvable' };
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (e) {
    return { success: false, message: String(e) };
  }
});

ipcMain.handle('duplicate-script', async (_event, { filePath }) => {
  try {
    if (!filePath) return { success: false, message: 'Chemin manquant' };
    if (!fs.existsSync(filePath)) return { success: false, message: 'Fichier introuvable' };
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, '.py');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19);
    const target = path.join(dir, `${base}_copy_${stamp}.py`);
    fs.copyFileSync(filePath, target);
    return { success: true, filePath: target };
  } catch (e) {
    return { success: false, message: String(e) };
  }
});

ipcMain.handle('open-file', async (event, filePath) => {
  try {
    // Validation stricte du chemin
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      return { success: false, message: 'Invalid path' };
    }
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    const resolved = path.resolve(filePath);
    const normalizedBase = path.resolve(screenshotsDir) + path.sep;
    const isUnderScreens = resolved.startsWith(normalizedBase);
    const ext = (path.extname(resolved) || '').toLowerCase();
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'];
    if (!isUnderScreens || !allowed.includes(ext) || !fs.existsSync(resolved)) {
      return { success: false, message: 'Access denied' };
    }
    const res = await shell.openPath(resolved);
    return { success: !res, message: res || '' };
  } catch (e) {
    return { success: false, message: String(e) };
  }
});

ipcMain.handle('read-file-text', async (_event, payload) => {
  try {
    const p = typeof payload === 'string' ? payload : (payload && payload.path);
    if (!p) return { success: false, message: 'Chemin manquant' };
    const txt = fs.readFileSync(p, 'utf8');
    return { success: true, content: txt };
  } catch (e) {
    return { success: false, message: String(e) };
  }
});

ipcMain.handle('choose-directory', async () => {
  const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (res.canceled || !res.filePaths || res.filePaths.length === 0) return { canceled: true };
  return { canceled: false, path: res.filePaths[0] };
});

// ============================================================================
// IPC HANDLERS - AUTHENTIFICATION
// ============================================================================

ipcMain.handle('authenticate-user', async (event, { email, licenseKey }) => {
  try {
    console.log(`[auth] Tentative d'authentification pour: ${email}`);
    const result = await ipcMain.handle('verify-license');
    return result;
  } catch (error) {
    console.error('[auth] Erreur d\'authentification:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur'
    };
  }
});

ipcMain.handle('set-auth-data', async (event, authData) => {
  try {
    console.log('[auth] Données d\'authentification reçues:', authData);
    isAuthenticated = true;
    
    // Créer la fenêtre principale
    createMainWindow();
    
    return { success: true };
  } catch (error) {
    console.error('[auth] Erreur lors de la définition des données d\'auth:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('close-auth-window', async () => {
  try {
    if (authWindow) {
      authWindow.close();
    }
    return { success: true };
  } catch (error) {
    console.error('[auth] Erreur lors de la fermeture de la fenêtre d\'auth:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-auth-status', async () => {
  return {
    authenticated: isAuthenticated,
    user: isAuthenticated ? { plan: 'pro' } : null
  };
});

ipcMain.handle('logout', async () => {
  try {
    isAuthenticated = false;
    if (mainWindow) {
      mainWindow.close();
    }
    createAuthWindow();
    return { success: true };
  } catch (error) {
    console.error('[auth] Erreur lors de la déconnexion:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file', async (event, { content, defaultPath }) => {
  try {
    console.log('[save-file] Début de la sauvegarde...');
    console.log('[save-file] Contenu length:', content ? content.length : 'undefined');
    console.log('[save-file] Default path:', defaultPath);
    
    // Vérifier que le contenu n'est pas vide
    if (!content || content.trim() === '') {
      console.error('[save-file] Contenu vide ou invalide');
      return { canceled: true, error: 'Le contenu du script est vide' };
    }
    
    const result = await dialog.showSaveDialog({
      title: 'Sauvegarder le script AppsMobs',
      defaultPath: defaultPath || path.join(__dirname, '..', 'scripts', 'mon_script.py'),
      filters: [
        { name: 'Fichiers Python', extensions: ['py'] },
        { name: 'Tous les fichiers', extensions: ['*'] }
      ],
      properties: ['createDirectory']
    });

    console.log('[save-file] Résultat du dialogue:', result);

    if (result.canceled || !result.filePath) {
      console.log('[save-file] Sauvegarde annulée par l\'utilisateur');
      return { canceled: true };
    }

    // Créer le dossier parent si nécessaire
    const dir = path.dirname(result.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('[save-file] Dossier créé:', dir);
    }

    // Sauvegarder le fichier
    fs.writeFileSync(result.filePath, content, 'utf8');
    console.log('[save-file] Fichier sauvegardé:', result.filePath);
    
    return { 
      canceled: false, 
      filePath: result.filePath,
      fileName: path.basename(result.filePath)
    };
  } catch (error) {
    console.error('[save-file] Erreur lors de la sauvegarde:', error);
    return { canceled: true, error: error.message };
  }
});

// Profil utilisateur - upsert vers serveur de licence
ipcMain.handle('save-user-profile', async (_event, profile) => {
  try {
    const cfgPath = path.join(__dirname, '..', 'config.json');
    let base = process.env.LICENSE_SERVER_URL;
    if (!base && fs.existsSync(cfgPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        base = cfg.license_server_url;
      } catch {}
    }
    if (!base) return { success: false, message: 'URL du serveur de licence manquante' };

    const headers = { 'Content-Type': 'application/json' };
    const anon = process.env.SUPABASE_ANON_KEY;
    if (anon) {
      headers['Authorization'] = `Bearer ${anon}`;
      headers['apikey'] = anon;
    }
    const res = await fetch(`${base}/api/profile/upsert`, {
      method: 'POST',
      headers,
      body: JSON.stringify(profile)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) return { success: false, message: data.detail || 'Erreur serveur' };
    return { success: true, profile: data.profile };
  } catch (e) {
    console.error('[save-user-profile] erreur:', e);
    return { success: false, message: 'Erreur de sauvegarde du profil' };
  }
});

ipcMain.handle('verify-license', async (event, { email, key }) => {
  try {
    // Validate inputs
    if (typeof email !== 'string' || !email.includes('@') || typeof key !== 'string' || key.length < 6) {
      return { success: false, message: 'Paramètres invalides' };
    }
    const cfgPath = path.join(__dirname, '..', 'config.json');
    let base = process.env.LICENSE_SERVER_URL;
    if (!base && fs.existsSync(cfgPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        base = cfg.license_server_url;
      } catch {}
    }
    if (!base) {
      return { success: false, message: 'URL du serveur de licence non configurée' };
    }

    const headers = { 'Content-Type': 'application/json' };
    const anon = process.env.SUPABASE_ANON_KEY;
    if (anon) {
      headers['Authorization'] = `Bearer ${anon}`;
      headers['apikey'] = anon;
    }
    const device_id = getOrCreateDeviceId();
    const res = await fetch(`${base}/api/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, key, device_id })
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      return { success: false, message: data.message || 'Licence invalide' };
    }
    // Optional: verify JWT signature if provided
    const pub = process.env.LICENSE_JWT_PUBLIC_KEY;
    if (pub) {
      const valid = verifyJwtRS256(data.token, pub);
      if (!valid) return { success: false, message: 'Signature du token invalide' };
    }
    // Persist auth and open main window
    licenseInfo = { token: data.token, plan: data.plan, expires_at: data.expires_at || null };
    saveAuthConfig(data.plan, data.token, data.expires_at || null);
    isAuthenticated = true;
    createMainWindow();
    scheduleLicenseWatchdog();
    return { success: true, plan: data.plan, jwt_token: data.token, expires_at: data.expires_at || null, message: 'Licence activée' };
  } catch (e) {
    console.error('[verify-license] erreur:', e);
    return { success: false, message: 'Erreur de vérification de licence' };
  }
});

ipcMain.handle('check-license-status', async () => {
  const ok = !!(licenseInfo && licenseInfo.token);
  if (!ok) return { valid: false, message: 'Non authentifié' };
  const res = await checkLicenseOnline();
  return { valid: !!res.ok, message: res.ok ? 'Licence valide' : (res.message || 'Invalide') };
});

ipcMain.handle('show-save-dialog', async (_event, { defaultPath }) => {
  const res = await dialog.showSaveDialog({
    title: 'Enregistrer le script',
    defaultPath,
    buttonLabel: 'Enregistrer',
    filters: [{ name: 'Python Scripts', extensions: ['py'] }],
    properties: []
  });
  return res.filePath || null;
});

ipcMain.handle('get-app-version', async () => {
  return pkg.version || '0.0.0';
});

// ============================================================================
// SYSTÈME DE NOTIFICATIONS
// ============================================================================

ipcMain.handle('show-notification', async (_event, options) => {
  try {
    const notification = showNotification(options);
    return { success: true, id: notification?.id || null };
  } catch (error) {
    console.error('[notification] error:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('show-notification-info', async (_event, title, body, options = {}) => {
  try {
    showInfo(title, body, options);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('show-notification-success', async (_event, title, body, options = {}) => {
  try {
    showSuccess(title, body, options);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('show-notification-warning', async (_event, title, body, options = {}) => {
  try {
    showWarning(title, body, options);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('show-notification-error', async (_event, title, body, options = {}) => {
  try {
    showError(title, body, options);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// ============================================================================
// SYSTÈME DE POPUPS
// ============================================================================

ipcMain.handle('show-alert', async (_event, title, message, type = 'info') => {
  try {
    await showAlert(mainWindow, title, message, type);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('show-confirm', async (_event, title, message, buttons = ['Yes', 'No']) => {
  try {
    const result = await showConfirm(mainWindow, title, message, buttons);
    return { success: true, response: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('create-modal', async (_event, options) => {
  try {
    const modal = createModal(mainWindow, options);
    return { success: true, windowId: modal.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

app.whenReady().then(() => {
  // Request notification permission
  if (Notification.isSupported()) {
    // Permission is usually granted by default on Windows
    console.log('Desktop notifications supported');
  }
  
  // Commencer par l'authentification
  createAuthWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
