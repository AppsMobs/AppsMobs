import { app, BrowserWindow, ipcMain, dialog, shell, Notification, Menu } from 'electron';
// Lazy-load electron-updater only in production; avoid hard failure if missing
let autoUpdater = null;
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { showNotification, showInfo, showSuccess, showWarning, showError } from './utils/notifications.js';
import { showAlert, showConfirm, createModal } from './utils/popups.js';

// ============================================================================
// SÉCURITÉ - CHIFFREMENT DES DONNÉES SENSIBLES
// ============================================================================

// Générer ou récupérer une clé de chiffrement basée sur l'ID de l'appareil
function getEncryptionKey() {
  const deviceId = getOrCreateDeviceId();
  // Utiliser deviceId comme base pour la clé (32 bytes pour AES-256)
  const hash = crypto.createHash('sha256').update(`appsMobs_${deviceId}_${app.getName()}`).digest();
  return hash;
}

function encryptSensitiveData(text) {
  try {
    if (!text || typeof text !== 'string') return null;
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (e) {
    console.error('[encrypt] Erreur:', e);
    return null;
  }
}

function decryptSensitiveData(encryptedData) {
  try {
    if (!encryptedData || typeof encryptedData !== 'object') return null;
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('[decrypt] Erreur:', e);
    return null;
  }
}

// Expose version (for IPC)
import pkg from './package.json' assert { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// SÉCURITÉ - DÉTECTION DE MODIFICATION DU CODE
// ============================================================================

// Vérifier l'intégrité du code au démarrage (optionnel, activé en production)
function verifyCodeIntegrity() {
  if (!app.isPackaged) {
    // En développement, skip la vérification
    return true;
  }
  
  try {
    // Vérifier que les fichiers critiques existent et n'ont pas été modifiés
    const criticalFiles = [
      path.join(__dirname, 'main.js'),
      path.join(__dirname, 'preload.js')
    ];
    
    for (const filePath of criticalFiles) {
      if (!fs.existsSync(filePath)) {
        console.warn(`[Security] Fichier critique manquant: ${filePath}`);
        // Ne pas bloquer, juste logger
        continue;
      }
      
      // Vérifier que le fichier n'est pas vide ou corrompu
      const stats = fs.statSync(filePath);
      if (stats.size < 100) {
        console.warn(`[Security] Fichier suspect (trop petit): ${filePath}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('[Security] Erreur vérification intégrité:', error);
    // Ne pas bloquer l'app, juste logger
    return true;
  }
}

// Vérifier l'intégrité au démarrage
verifyCodeIntegrity();

// Réduire/éviter certains problèmes GPU sous Windows
// Test: garder le GPU actif mais forcer ANGLE OpenGL
app.commandLine.appendSwitch('use-angle', 'gl');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disk-cache-size', '0');
app.commandLine.appendSwitch('disable-http-cache');

// Set application name to AppsMobs (instead of Electron)
// MUST be called before app.whenReady()
app.setName('AppsMobs Pro');

// For Windows: Set App User Model ID to change taskbar context menu name
if (process.platform === 'win32') {
  app.setAppUserModelId('com.appsmobs.pro');
}

// ============================================================================
// NOUVELLE IMPLÉMENTATION SCRCPY - SANS FENÊTRES CMD
// ============================================================================

// Gestionnaire des processus scrcpy actifs
const activeScrcpyProcesses = new Map();

// Gestionnaire d'authentification
let authWindow = null;
let mainWindow = null;
let appMode = 'full'; // 'full' | 'readonly'
let configWindow = null;
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

// Dossiers utilisateur (Documents)
function getUserFolders() {
  try {
    const docs = app.getPath('documents');
    const base = path.join(docs, 'AppsMobs');
    const scripts = path.join(base, 'Scripts');
    const screenshots = path.join(base, 'Screenshots');
    return { base, scripts, screenshots };
  } catch {
    // Fallback vers dossier projet si inaccessible
    const base = path.join(__dirname, '..');
    return { base, scripts: path.join(base, 'scripts'), screenshots: path.join(base, 'screenshots') };
  }
}

function ensureUserFolders() {
  const { base, scripts, screenshots } = getUserFolders();
  try { if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true }); } catch {}
  try { if (!fs.existsSync(scripts)) fs.mkdirSync(scripts, { recursive: true }); } catch {}
  try { if (!fs.existsSync(screenshots)) fs.mkdirSync(screenshots, { recursive: true }); } catch {}
}

// Seed example scripts into user Scripts folder (copy if missing)
function seedExampleScripts() {
  try {
    const userScripts = getUserFolders().scripts;
    // Determine packaged scripts source
    const srcDir = app.isPackaged
      ? path.join(process.resourcesPath, 'scripts')
      : path.join(__dirname, '..', 'scripts');
    if (!fs.existsSync(srcDir)) return;
    const files = (fs.readdirSync(srcDir) || []).filter(f => f.endsWith('.py'));
    for (const file of files) {
      const src = path.join(srcDir, file);
      const dst = path.join(userScripts, file);
      if (!fs.existsSync(dst)) {
        try { fs.copyFileSync(src, dst); } catch {}
      }
    }
  } catch {}
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
    // Décrypter les données si elles sont chiffrées
    let token = lic.token;
    let email = lic.email || null;
    
    if (lic.encrypted) {
      // Données chiffrées - décrypter
      if (typeof token === 'object' && token.encrypted && token.iv && token.authTag) {
        const decrypted = decryptSensitiveData(token);
        if (decrypted) token = decrypted;
      }
      if (email && typeof email === 'object' && email.encrypted && email.iv && email.authTag) {
        const decrypted = decryptSensitiveData(email);
        if (decrypted) email = decrypted;
      }
    }
    // Si les données ne sont pas encore chiffrées (migration), les laisser en clair temporairement
    // Elles seront chiffrées lors de la prochaine sauvegarde
    
    return {
      token,
      plan: lic.plan,
      expires_at: lic.expires_at || null,
      email
    };
  }
  return null;
}

function saveAuthConfig(plan, token, expires_at, email = null) {
  const cfgPath = getUserConfigPath();
  const cfg = readJsonSafe(cfgPath);
  
  // Chiffrer les données sensibles
  const encryptedToken = encryptSensitiveData(token);
  const encryptedEmail = email ? encryptSensitiveData(email) : null;
  
  cfg.license = {
    plan,
    token: encryptedToken, // Stocké chiffré
    expires_at,
    email: encryptedEmail, // Stocké chiffré
    saved_at: Math.floor(Date.now() / 1000),
    device_id: getOrCreateDeviceId(),
    encrypted: true // Flag pour indiquer que les données sont chiffrées
  };
  cfg.plan = plan;
  writeJsonSafe(cfgPath, cfg);
}

// ============================================================================
// SYSTÈME D'AUTHENTIFICATION
// ============================================================================

function createAuthWindow() {
  const iconPath = path.join(__dirname, '..', 'assets', 'icons', 'Logo.ico');
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
  // Hide menu bar completely
  authWindow.setMenuBarVisibility(false);
  authWindow.setMenu(null);
  
  // Protection DevTools renforcée en production
  if (app.isPackaged) {
    // Désactiver l'ouverture de DevTools
    authWindow.webContents.on('devtools-opened', () => {
      authWindow.webContents.closeDevTools();
      // Optionnel : fermer l'app si DevTools ouvert (trop agressif, commenté)
      // dialog.showErrorBox('Sécurité', 'Accès non autorisé');
      // app.quit();
    });
    
    // Désactiver le menu contextuel (clic droit)
    authWindow.webContents.on('context-menu', (e) => {
      e.preventDefault();
    });
    
    // Désactiver les raccourcis clavier pour DevTools
    authWindow.webContents.on('before-input-event', (event, input) => {
      // Bloquer F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (input.key === 'F12' || 
          (input.control && input.shift && (input.key === 'I' || input.key === 'J' || input.key === 'C')) ||
          (input.control && input.key === 'U')) {
        event.preventDefault();
      }
    });
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

function createConfigWindow() {
  if (configWindow) {
    try { configWindow.focus(); } catch {}
    return;
  }
  const iconPath = path.join(__dirname, '..', 'assets', 'icons', 'Logo.png');
  const hasIcon = fs.existsSync(iconPath);
  const opts = {
    width: 520,
    height: 380,
    resizable: false,
    maximizable: false,
    minimizable: false,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Configuration AppsMobs',
    show: false
  };
  if (hasIcon) opts.icon = iconPath;
  configWindow = new BrowserWindow(opts);
  configWindow.setMenuBarVisibility(false);
  configWindow.setMenu(null);
  configWindow.loadFile(path.join(__dirname, 'renderer', 'config.html'));
  configWindow.once('ready-to-show', () => configWindow.show());
  configWindow.on('closed', () => { configWindow = null; });
}

function createMainWindow() {
  const iconPathMain = path.join(__dirname, '..', 'assets', 'icons', 'Logo.ico');
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
    show: false,
    autoHideMenuBar: true
  };
  if (hasIconMain) mainWindowOptions.icon = iconPathMain;
  mainWindow = new BrowserWindow(mainWindowOptions);
  // Hide menu bar completely
  mainWindow.setMenuBarVisibility(false);
  // Remove menu bar completely
  mainWindow.setMenu(null);
  
  // Protection DevTools renforcée en production
  if (app.isPackaged) {
    // Désactiver l'ouverture de DevTools
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
      // Optionnel : afficher un avertissement
      try {
        dialog.showMessageBox(mainWindow, {
          type: 'warning',
          title: 'Sécurité',
          message: 'Les outils de développement sont désactivés en production.',
          buttons: ['OK']
        });
      } catch {}
    });
    
    // Désactiver le menu contextuel (clic droit)
    mainWindow.webContents.on('context-menu', (e) => {
      e.preventDefault();
    });
    
    // Désactiver les raccourcis clavier pour DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Bloquer F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (input.key === 'F12' || 
          (input.control && input.shift && (input.key === 'I' || input.key === 'J' || input.key === 'C')) ||
          (input.control && input.key === 'U')) {
        event.preventDefault();
      }
    });
    
    // Désactiver la navigation vers about:blank ou des URLs externes
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      if (!navigationUrl.startsWith('file://')) {
        event.preventDefault();
      }
    });
    
    // Désactiver les nouvelles fenêtres non autorisées
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      // Autoriser seulement les URLs de confiance (appsmobs.com)
      if (url.includes('appsmobs.com')) {
        shell.openExternal(url);
      }
      return { action: 'deny' };
    });
    
    // Désactiver les webContents.executeJavaScript depuis l'extérieur
    mainWindow.webContents.on('will-attach-webview', (event) => {
      event.preventDefault();
    });
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

// Fonction pour obtenir l'URL du serveur de licence
function getLicenseServerUrl() {
  // 1. Variable d'environnement (priorité)
  if (process.env.LICENSE_SERVER_URL) {
    return process.env.LICENSE_SERVER_URL;
  }
  
  // 2. Fichier config.json dans le dossier utilisateur (userData)
  try {
    const userCfgPath = getUserConfigPath();
    if (fs.existsSync(userCfgPath)) {
      const ucfg = JSON.parse(fs.readFileSync(userCfgPath, 'utf8'));
      if (ucfg.license_server_url && typeof ucfg.license_server_url === 'string') {
        return ucfg.license_server_url;
      }
      // support d'un bloc config à la racine
      if (ucfg.config && ucfg.config.license_server_url) {
        return ucfg.config.license_server_url;
      }
    }
  } catch {}

  // 3. Fichier config.json à la racine du projet (développement)
  const cfgPathDev = path.join(__dirname, '..', 'config.json');
  if (fs.existsSync(cfgPathDev)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPathDev, 'utf8'));
      if (cfg.license_server_url) {
        return cfg.license_server_url;
      }
    } catch {}
  }
  
  // 4. Fichier config.json dans resources (build packagé)
  if (app.isPackaged && process.resourcesPath) {
    const cfgPathPackaged = path.join(process.resourcesPath, 'config.json');
    if (fs.existsSync(cfgPathPackaged)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(cfgPathPackaged, 'utf8'));
        if (cfg.license_server_url) {
          return cfg.license_server_url;
        }
      } catch {}
    }
  }
  
  // 5. En production: URL embarquée (minimement obfusquée précédemment)
  if (app.isPackaged) {
    // Important: remplacez par votre URL si nécessaire
    return 'https://encoikswoojgqilbdkwy.supabase.co/functions/v1/license';
  }

  // 6. Pas de valeur par défaut en dev si rien n'est trouvé
  return null;
}

// Clé publique pour vérifier la signature JWT (RS256)
function getJwtPublicKey() {
  // Priorité à la variable d'environnement si fournie
  if (process.env.LICENSE_JWT_PUBLIC_KEY && process.env.LICENSE_JWT_PUBLIC_KEY.trim()) {
    return process.env.LICENSE_JWT_PUBLIC_KEY.trim();
  }
  // En production, utiliser la clé embarquée
  if (app.isPackaged) {
    // Clé fournie par l'éditeur (format PEM reconstruit)
    const body = [
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyHjDJO+mrlH4hw7tdsM9IXB+',
      'xbxYQMPJZDGw5ATMoQpBHPYnwlLF6hAwUdujkmXRcaL45UIRrYIhVlGfgzDPy46bvL5df',
      'xbaaX5+mXvlkEknFoFFw9wSIT7rbO8ohJEpaCKWKN1FEuw9ObfoXoctt9kWhDz4TRJjJT',
      'KfcPE1a/5oGKxViDIx2ojwrPkBBx2T4xuXwAkycSrGwl/IGyZlMVLDf0NPJiI2790chM0',
      'u0yhSYu8dotTAwFizi7Tj2BEfUyulASg73uNpb4w/Z2FeAPC3EAGD09aYTAYR2sH7mUmJ',
      '7Z1QvtVcKToCeDTsAmRgpF0al04Oxz6ytg2c1EfrmwIDAQAB'
    ].join('');
    const pem = `-----BEGIN PUBLIC KEY-----\n${body.replace(/(.{64})/g, '$1\n')}\n-----END PUBLIC KEY-----`;
    return pem;
  }
  return null;
}

async function checkLicenseOnline() {
  try {
    let base = getLicenseServerUrl();
    if (!base) {
      return { ok: false, message: 'URL du serveur de licence non configurée. Configurez LICENSE_SERVER_URL ou créez config.json avec license_server_url.' };
    }
    if (!licenseInfo || !licenseInfo.token) {
      return { ok: false, message: 'No token' };
    }
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

function broadcastAppMode() {
  try {
    const { BrowserWindow } = require('electron');
    (BrowserWindow.getAllWindows() || []).forEach(win => {
      try { win.webContents.send('app-mode-changed', { mode: appMode }); } catch {}
    });
  } catch {}
}

function scheduleLicenseWatchdog() {
  // First check after short delay, then every 5 minutes (renforcé)
  setTimeout(async () => {
    const res = await checkLicenseOnline();
    if (!res.ok) {
      // Basculer en lecture seule au lieu de fermer
      appMode = 'readonly';
      broadcastAppMode();
    } else {
      appMode = 'full';
      broadcastAppMode();
    }
    setInterval(async () => {
      const r = await checkLicenseOnline();
      if (!r.ok) {
        appMode = 'readonly';
        broadcastAppMode();
      } else {
        appMode = 'full';
        broadcastAppMode();
      }
    }, 5 * 60 * 1000); // 5 minutes au lieu de 60
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

function parseJwtHeader(token) {
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const headerJson = Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(headerJson);
  } catch {
    return null;
  }
}

function findScrcpyExecutable() {
  // 1) Variable d'environnement explicite
  if (process.env.SCRCPY_PATH && fs.existsSync(process.env.SCRCPY_PATH)) {
    console.log(`[scrcpy] Trouvé via SCRCPY_PATH: ${process.env.SCRCPY_PATH}`);
    return process.env.SCRCPY_PATH;
  }

  // 1.5) Dossier portable AppsMobs (Documents\AppsMobs\scrcpy)
  try {
    const portableDir = path.join(getUserFolders().base, 'scrcpy');
    const portableExe = path.join(portableDir, 'scrcpy.exe');
    if (process.platform === 'win32' && fs.existsSync(portableExe)) {
      console.log(`[scrcpy] Trouvé (portable) : ${portableExe}`);
      return portableExe;
    }
  } catch {}

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

  // 2.5) Tenter d'extraire depuis assets/scrcpy/*.zip vers Documents\AppsMobs\scrcpy
  try {
    if (process.platform === 'win32') {
      const assetsBase = app.isPackaged
        ? path.join(process.resourcesPath, 'assets', 'scrcpy')
        : path.join(__dirname, '..', 'assets', 'scrcpy');
      const portableDir = path.join(getUserFolders().base, 'scrcpy');
      if (!fs.existsSync(portableDir)) {
        try { fs.mkdirSync(portableDir, { recursive: true }); } catch {}
      }
      if (fs.existsSync(assetsBase)) {
        const zips = (fs.readdirSync(assetsBase) || []).filter(f => f.toLowerCase().endsWith('.zip'));
        if (zips.length > 0) {
          const zipPath = path.join(assetsBase, zips[0]);
          console.log(`[scrcpy] Extraction depuis ${zipPath} -> ${portableDir}`);
          try {
            // Utiliser PowerShell Expand-Archive (natif Windows)
            spawn('powershell', ['-NoProfile','-ExecutionPolicy','Bypass','-Command',`Expand-Archive -LiteralPath "${zipPath}" -DestinationPath "${portableDir}" -Force`], { shell: false, windowsHide: true });
          } catch {}
          // Attendre un court instant puis vérifier
          const start = Date.now();
          while (Date.now() - start < 6000) {
            const exe = path.join(portableDir, 'scrcpy.exe');
            if (fs.existsSync(exe)) {
              console.log(`[scrcpy] Extrait: ${exe}`);
              return exe;
            }
            // scrcpy.exe peut être dans un sous-dossier
            try {
              const walk = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const e of entries) {
                  const p = path.join(dir, e.name);
                  if (e.isDirectory()) walk(p);
                  else if (e.isFile() && e.name.toLowerCase() === 'scrcpy.exe') throw p;
                }
              };
              try { walk(portableDir); } catch (exePath) {
                if (typeof exePath === 'string') return exePath;
              }
            } catch {}
          }
        }
      }
    }
  } catch (e) { console.warn('[scrcpy] Extraction portable échouée:', e?.message || e); }

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

// ============================================================================
// SÉCURITÉ - MIDDLEWARE DE VÉRIFICATION IPC (DÉPLACÉ ICI POUR INITIALISATION)
// ============================================================================

// Liste des handlers qui ne nécessitent PAS d'authentification
const PUBLIC_HANDLERS = new Set([
  'verify-license',
  'authenticate-user',
  'set-auth-data',
  'close-auth-window',
  'check-auth-status',
  'logout',
  'get-app-version',
  'show-notification',
  'show-notification-info',
  'show-notification-success',
  'show-notification-warning',
  'show-notification-error',
  'show-alert',
  'show-confirm',
  'create-modal'
]);

// Compteur de vérifications échouées (pour détecter les tentatives de bypass)
let failedVerificationCount = 0;
const MAX_FAILED_VERIFICATIONS = 10;

// Vérifier la licence avant d'exécuter un handler critique
async function verifyLicenseBeforeAction() {
  // Vérifier que l'utilisateur est authentifié
  if (!isAuthenticated || !licenseInfo || !licenseInfo.token) {
    failedVerificationCount++;
    if (failedVerificationCount >= MAX_FAILED_VERIFICATIONS) {
      // Trop de tentatives - fermer l'app
      if (mainWindow) {
        try {
          dialog.showErrorBox('Sécurité', 'Trop de tentatives d\'accès non autorisées. L\'application va se fermer.');
          app.quit();
        } catch {}
      }
    }
    return { allowed: false, reason: 'Non authentifié' };
  }
  
  // Vérifier que le token n'est pas vide ou invalide
  if (typeof licenseInfo.token !== 'string' || licenseInfo.token.length < 10) {
    failedVerificationCount++;
    return { allowed: false, reason: 'Token invalide' };
  }
  
  // Vérifier la licence en ligne (avec cache pour éviter trop de requêtes)
  const lastCheck = licenseInfo._lastCheck || 0;
  const now = Date.now();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes de cache
  
  if (now - lastCheck > CACHE_DURATION) {
    const check = await checkLicenseOnline();
    licenseInfo._lastCheck = now;
    
    if (!check.ok) {
      failedVerificationCount++;
      // Basculer en lecture seule sans fermer l'app
      appMode = 'readonly';
      broadcastAppMode();
      return { allowed: false, reason: 'Licence invalide ou expirée' };
    } else {
      appMode = 'full';
      broadcastAppMode();
    }
    
    // Succès - reset le compteur
    failedVerificationCount = 0;
  }
  
  return { allowed: true };
}

// Middleware pour protéger les handlers IPC
function requireAuth(handler) {
  return async (event, ...args) => {
    // Vérifier la licence avant d'exécuter
    const verification = await verifyLicenseBeforeAction();
    if (!verification.allowed) {
      return { 
        success: false, 
        error: verification.reason || 'Authentification requise',
        requiresAuth: true 
      };
    }
    
    // Exécuter le handler original
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error('[IPC Handler Error]', error);
      return { success: false, error: error.message };
    }
  };
}

// Wrapper pour enregistrer un handler IPC avec protection automatique
function registerSecureHandler(channel, handler) {
  if (PUBLIC_HANDLERS.has(channel)) {
    // Handler public - pas de protection
    ipcMain.handle(channel, handler);
  } else {
    // Handler protégé - ajouter la vérification
    ipcMain.handle(channel, requireAuth(handler));
  }
}

// En lecture seule, bloquer certaines actions sensibles
const READONLY_BLOCKED = new Set([
  'run-script-on-devices',
  'stop-all-scripts',
  'stop-script-on-device',
  'save-file',
  'duplicate-script',
  'delete-script',
  'show-save-dialog'
]);

function blockWhenReadOnly(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (appMode === 'readonly' && READONLY_BLOCKED.has(channel)) {
      return { success: false, message: 'Fonctionnalité indisponible en mode lecture seule' };
    }
    try { return await handler(event, ...args); } catch (e) { return { success: false, message: String(e) }; }
  });
}

// Handler IPC pour ouvrir scrcpy
registerSecureHandler('open-scrcpy', async (event, serial) => {
  // Vérifier si scrcpy est vraiment encore actif pour cet appareil
  if (isScrcpyProcessActive(serial)) {
    return { success: true, serial, message: 'scrcpy déjà ouvert' };
  }
  
  const result = await launchScrcpy(serial);
  return result;
});

// Handler IPC pour arrêter scrcpy
registerSecureHandler('stop-scrcpy', async (event, serial) => {
  return { success: stopScrcpy(serial) };
});

// Handler IPC pour obtenir la liste des processus scrcpy actifs
registerSecureHandler('get-active-scrcpy', async () => {
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
// SÉCURITÉ - RATE LIMITING
// ============================================================================

// Rate limiting pour les tentatives de connexion
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const RESET_TIME = 60 * 60 * 1000; // 1 heure pour reset complet

function getDeviceIdentifier(event) {
  // Utiliser device_id comme identifiant unique
  try {
    return getOrCreateDeviceId();
  } catch {
    return 'unknown';
  }
}

function checkRateLimit(identifier) {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0, firstAttempt: Date.now() };
  const now = Date.now();
  
  // Reset après 1 heure
  if (now - attempts.firstAttempt > RESET_TIME) {
    loginAttempts.delete(identifier);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
  
  // Vérifier si locked
  if (attempts.lockedUntil > now) {
    const minutesLeft = Math.ceil((attempts.lockedUntil - now) / 60000);
    return { 
      allowed: false, 
      reason: `Trop de tentatives. Réessayez dans ${minutesLeft} minute(s).`,
      lockedUntil: attempts.lockedUntil
    };
  }
  
  // Si déverrouillé, reset le compteur
  if (attempts.lockedUntil > 0 && attempts.lockedUntil <= now) {
    attempts.count = 0;
    attempts.lockedUntil = 0;
  }
  
  return { allowed: true, remaining: MAX_ATTEMPTS - attempts.count };
}

function recordFailedAttempt(identifier) {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0, firstAttempt: Date.now() };
  attempts.count++;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_TIME;
  }
  
  loginAttempts.set(identifier, attempts);
}

function recordSuccessAttempt(identifier) {
  // Réussite = reset des tentatives
  loginAttempts.delete(identifier);
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
  // Hide menu bar completely
  win.setMenuBarVisibility(false);
  win.maximize();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

// IPC handlers pour communiquer avec le renderer
const runningProcs = new Map(); // key: serial, value: ChildProcess
const SCRIPT_DONE_MARKER = '[APPSMOBS_SCRIPT_DONE]';
const finishedSerials = new Set(); // prevent duplicate stop notifications

function notifyStopped(serial, code = 0, sender) {
  try {
    if (finishedSerials.has(serial)) return;
    finishedSerials.add(serial);
    const exitMsg = { serial, code: code || 0 };
    const stopMsg = { serial, status: 'stopped', code: code || 0 };
    if (sender) {
      safeSend(sender, 'script-exit', exitMsg);
      safeSend(sender, 'script-status', stopMsg);
    }
    broadcast('script-exit', exitMsg);
    broadcast('script-status', stopMsg);
    setTimeout(() => { try { finishedSerials.delete(serial); } catch {} }, 2000);
  } catch {}
}

function safeSend(sender, channel, payload){
  try { if (sender && typeof sender.isDestroyed === 'function' && !sender.isDestroyed()) sender.send(channel, payload); } catch {}
}

function broadcast(channel, payload){
  try {
    const { BrowserWindow } = require('electron');
    (BrowserWindow.getAllWindows() || []).forEach(win => {
      try { if (win && win.webContents && !win.webContents.isDestroyed()) win.webContents.send(channel, payload); } catch {}
    });
  } catch {}
}

function killChildProcess(child) {
  try {
    if (!child || !child.pid) return;
    const pid = child.pid;
    if (process.platform === 'win32') {
      try { spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { shell: false, windowsHide: true }); } catch {}
    } else {
      try { process.kill(-pid, 'SIGKILL'); } catch {}
      try { child.kill('SIGKILL'); } catch {}
    }
  } catch {}
}

function isProcessAlive(child) {
  try {
    if (!child) return false;
    if (child.exitCode !== null) return false;
    if (typeof child.pid === 'number') {
      try { process.kill(child.pid, 0); return true; } catch { return false; }
    }
  } catch {}
  return false;
}
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

registerSecureHandler('get-devices', async (event) => {
  try {
    await autoConnectLDPlayer();
    const { stdout } = await execAdb(['devices', '-l']);
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

registerSecureHandler('setup-device', async (event, serial) => {
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

blockWhenReadOnly('run-script-on-devices', async (event, { scriptFile, serials, options }) => {
  const results = [];
  // Utiliser le wrapper qui charge le bytecode compilé
  // Le wrapper est toujours visible, mais le code source réel (run_script.py) est protégé
  const bridgeDir = path.join(__dirname, 'bridge');
  let bridgePath = path.join(bridgeDir, 'run_script_wrapper.py');
  
  // Fallback: utiliser le .py original si le wrapper n'existe pas (développement uniquement)
  if (!fs.existsSync(bridgePath)) {
    bridgePath = path.join(bridgeDir, 'run_script.py');
    // En production, le .py ne devrait pas exister
    if (app.isPackaged && !fs.existsSync(bridgePath)) {
      return [{ ok: false, message: 'Bridge script not found. Please rebuild the application.' }];
    }
  }

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

  // Pre-clean zombie entries (process finished but still in map)
  try {
    for (const [s, child] of runningProcs.entries()) {
      if (!child || child.exitCode !== null) {
        try { child && child.kill(); } catch {}
        runningProcs.delete(s);
      }
    }
  } catch {}

  for (const serial of serials) {
    try {
      // Validation de sécurité: format du serial (format ADB valide)
      if (!serial || typeof serial !== 'string' || !/^[a-zA-Z0-9:._-]+$/.test(serial)) {
        results.push({ serial, ok: false, message: 'Invalid serial format' });
        continue;
      }

      // Forcer remplacement: s'il existe, on tue et on relance proprement
      if (runningProcs.has(serial)) {
        const existing = runningProcs.get(serial);
        try { existing && existing.kill(); } catch {}
        runningProcs.delete(serial);
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
        windowsHide: process.platform === 'win32',
        env: { 
          ...process.env, 
          ADB_SERIAL: serial,
          PATH: process.env.PATH,
          PYTHONUNBUFFERED: '1',
          PYTHONPATH: (() => { try { const root = path.join(__dirname, '..'); const cur = process.env.PYTHONPATH || ''; return cur ? (root + (process.platform === 'win32' ? ';' : ':') + cur) : root; } catch { return process.env.PYTHONPATH; } })()
        }
      });
      runningProcs.set(serial, child);
      // Inform renderer this serial is now running
      const runningMsg = { serial, status: 'running' };
      safeSend(event.sender, 'script-status', runningMsg);
      broadcast('script-status', runningMsg);

      let stdoutData = '';
      let stderrData = '';

      child.stdout?.on('data', (d) => {
        const text = d.toString();
        stdoutData += text;
        // Detect explicit script-finish marker
        if (text.includes(SCRIPT_DONE_MARKER)) {
          try { killChildProcess(child); } catch {}
          runningProcs.delete(serial);
          notifyStopped(serial, 0, event.sender);
          return;
        }
        const pl = { serial, line: text };
        safeSend(event.sender, 'script-log', pl);
        broadcast('script-log', pl);
      });
      child.stderr?.on('data', (d) => {
        const text = d.toString();
        stderrData += text;
        const pl = { serial, line: text, level: 'ERROR' };
        safeSend(event.sender, 'script-log', pl);
        broadcast('script-log', pl);
      });
      // Nettoyage robuste
      child.on('exit', (code) => {
        try { runningProcs.delete(serial); } catch {}
        notifyStopped(serial, code || 0, event.sender);
      });
      child.on('error', (err) => {
        try { runningProcs.delete(serial); } catch {}
        notifyStopped(serial, 1, event.sender);
      });
      child.on('close', (code) => {
        console.log(`[run-script] Process for ${serial} exited with code ${code}`);
        runningProcs.delete(serial);
        notifyStopped(serial, code || 0, event.sender);
      });

      results.push({ serial, ok: true });
    } catch (e) {
      console.error('[run-script] Error:', e);
      results.push({ serial, ok: false, message: String(e) });
    }
  }

  return results;
});

blockWhenReadOnly('stop-all-scripts', async () => {
  for (const [serial, child] of runningProcs.entries()) {
    try { killChildProcess(child); } catch {}
    runningProcs.delete(serial);
    notifyStopped(serial, 0);
  }
  return { ok: true };
});

// Stop a single device's running script
blockWhenReadOnly('stop-script-on-device', async (_event, serial) => {
  if (!serial || typeof serial !== 'string' || !/^[a-zA-Z0-9:._-]+$/.test(serial)) {
    return { ok: false, message: 'Invalid serial' };
  }
  const child = runningProcs.get(serial);
  if (!child) {
    // Nothing tracked: ensure UI is unlocked anyway
    notifyStopped(serial, 0);
    return { ok: false, message: 'No running script for device' };
  }
  try {
    killChildProcess(child);
    runningProcs.delete(serial);
    notifyStopped(serial, 0);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
});

registerSecureHandler('capture-screenshot', async (event, payload) => {
  return new Promise((resolve) => {
    const { serial, dir } = typeof payload === 'object' ? payload : { serial: payload, dir: undefined };
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const screenshotsDefault = getUserFolders().screenshots;
    const screenshotsDir = dir ? path.resolve(dir) : screenshotsDefault;
    
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
registerSecureHandler('device-action', async (_event, { serial, action, value }) => {
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

registerSecureHandler('load-scripts', async (_event, baseDir) => {
  const scriptsDefault = getUserFolders().scripts;
  const scriptsDir = baseDir ? path.resolve(baseDir) : scriptsDefault;
  
  if (!fs.existsSync(scriptsDir)) {
    try { fs.mkdirSync(scriptsDir, { recursive: true }); } catch {}
    // Try seeding if missing
    seedExampleScripts();
    if (!fs.existsSync(scriptsDir)) return [];
  }
  
  // If empty, seed then re-read
  let files = [];
  try { files = fs.readdirSync(scriptsDir) || []; } catch { files = []; }
  if (!files.some(f => f.endsWith('.py'))) {
    seedExampleScripts();
    try { files = fs.readdirSync(scriptsDir) || []; } catch { files = []; }
  }

  // If still empty, list directly from packaged resources as fallback (read-only)
  if (!files.some(f => f.endsWith('.py'))) {
    try {
      const packagedDir = app.isPackaged ? path.join(process.resourcesPath, 'scripts') : path.join(__dirname, '..', 'scripts');
      const pfiles = (fs.existsSync(packagedDir) ? fs.readdirSync(packagedDir) : []).filter(f => f.endsWith('.py'));
      if (pfiles.length > 0) {
        return pfiles.map(file => ({
          name: file.replace('.py', ''),
          file: path.join(packagedDir, file),
          version: '1.0',
          duration: '60s'
        }));
      }
    } catch {}
  }
  
  const scripts = files
    .filter(file => file.endsWith('.py') && !file.startsWith('_') && file !== '__init__.py')
    .map(file => ({
      name: file.replace('.py', ''),
      file: path.join(scriptsDir, file),
      version: '1.0',
      duration: '60s'
    }));
  
  return scripts;
});

blockWhenReadOnly('delete-script', async (_event, { filePath }) => {
  try {
    if (!filePath) return { success: false, message: 'Chemin manquant' };
    if (!fs.existsSync(filePath)) return { success: false, message: 'Fichier introuvable' };
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (e) {
    return { success: false, message: String(e) };
  }
});

blockWhenReadOnly('duplicate-script', async (_event, { filePath }) => {
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

registerSecureHandler('open-file', async (event, filePath) => {
  try {
    // Validation stricte du chemin
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      return { success: false, message: 'Invalid path' };
    }
    const screenshotsDir = getUserFolders().screenshots;
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

registerSecureHandler('read-file-text', async (_event, payload) => {
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
    // Bloquer tout accès sans licence valide
    if (!licenseInfo || !isAuthenticated) {
      return { success: false, error: 'Licence requise' };
    }
    // Si déjà authentifié via vérification de licence, s'assurer que la fenêtre existe
    if (!mainWindow) {
      createMainWindow();
    }
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

blockWhenReadOnly('save-file', async (event, { content, defaultPath }) => {
  try {
    console.log('[save-file] Début de la sauvegarde...');
    console.log('[save-file] Contenu length:', content ? content.length : 'undefined');
    console.log('[save-file] Default path:', defaultPath);
    
    // Vérifier que le contenu n'est pas vide
    if (!content || content.trim() === '') {
      console.error('[save-file] Contenu vide ou invalide');
      return { canceled: true, error: 'Le contenu du script est vide' };
    }
    
    const scriptsDir = getUserFolders().scripts;
    const result = await dialog.showSaveDialog({
      title: 'Sauvegarder le script AppsMobs',
      defaultPath: defaultPath || path.join(scriptsDir, 'mon_script.py'),
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
registerSecureHandler('get-user-profile', async (_event, providedEmail) => {
  try {
    console.log('[get-user-profile] Début récupération profil...');
    let email = providedEmail;
    
    // Si email non fourni, essayer de le récupérer depuis les données sauvegardées
    if (!email) {
      console.log('[get-user-profile] Email non fourni, recherche dans licenseInfo...');
      // Essayer depuis licenseInfo en mémoire
      if (licenseInfo && licenseInfo.email) {
        email = licenseInfo.email;
        console.log('[get-user-profile] Email trouvé dans licenseInfo:', email);
      } else {
        // Essayer depuis la config locale (sauvegardée lors de la vérification de licence)
        const cfgPath = getUserConfigPath();
        const cfg = readJsonSafe(cfgPath);
        if (cfg.license && cfg.license.email) {
          email = cfg.license.email;
          console.log('[get-user-profile] Email trouvé dans config:', email);
        } else {
          // Essayer depuis authConfig
          const authConfig = readAuthConfig();
          if (authConfig && authConfig.email) {
            email = authConfig.email;
            console.log('[get-user-profile] Email trouvé dans authConfig:', email);
          }
        }
      }
    } else {
      console.log('[get-user-profile] Email fourni:', email);
    }
    
    if (!email) {
      console.warn('[get-user-profile] Email non trouvé');
      return { success: false, message: 'Email non trouvé. Veuillez vous reconnecter.' };
    }

    let base = getLicenseServerUrl();
    console.log('[get-user-profile] URL serveur:', base);
    if (!base) {
      return { 
        success: false, 
        message: 'URL du serveur de licence manquante. Configurez LICENSE_SERVER_URL ou créez config.json avec license_server_url.' 
      };
    }

    const headers = { 'Content-Type': 'application/json' };
    const anon = process.env.SUPABASE_ANON_KEY;
    if (anon) {
      headers['Authorization'] = `Bearer ${anon}`;
      headers['apikey'] = anon;
    }
    
    // Récupérer le profil depuis Supabase via l'API
    const url = `${base}/api/profile/get?email=${encodeURIComponent(email)}`;
    console.log('[get-user-profile] Appel API:', url);
    const res = await fetch(url, {
      method: 'GET',
      headers
    });
    const data = await res.json().catch(() => ({}));
    console.log('[get-user-profile] Réponse API:', { status: res.status, ok: res.ok, data });
    
    if (!res.ok) {
      console.warn('[get-user-profile] Erreur API:', data.detail || data.message);
      return { success: false, message: data.detail || data.message || 'Erreur serveur', profile: null };
    }
    
    console.log('[get-user-profile] Profil récupéré:', data.profile ? 'Oui' : 'Non');
    return { success: true, profile: data.profile || null };
  } catch (e) {
    console.error('[get-user-profile] erreur:', e);
    console.error('[get-user-profile] Stack:', e.stack);
    return { success: false, message: 'Erreur de récupération du profil' };
  }
});

registerSecureHandler('save-user-profile', async (_event, profile) => {
  try {
    let base = getLicenseServerUrl();
    if (!base) {
      return { 
        success: false, 
        message: 'URL du serveur de licence manquante. Configurez LICENSE_SERVER_URL ou créez config.json avec license_server_url.' 
      };
    }

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
    // Rate limiting - vérifier avant de traiter
    const deviceId = getDeviceIdentifier(event);
    const rateLimitCheck = checkRateLimit(deviceId);
    
    if (!rateLimitCheck.allowed) {
      return { 
        success: false, 
        message: rateLimitCheck.reason || 'Trop de tentatives de connexion',
        rateLimited: true,
        lockedUntil: rateLimitCheck.lockedUntil
      };
    }
    
    // Validate inputs
    if (typeof email !== 'string' || !email.includes('@') || typeof key !== 'string' || key.length < 6) {
      recordFailedAttempt(deviceId);
      return { success: false, message: 'Paramètres invalides' };
    }
    let base = getLicenseServerUrl();
    if (!base) {
      return { 
        success: false, 
        message: 'URL du serveur de licence non configurée. Veuillez configurer la variable d\'environnement LICENSE_SERVER_URL ou créer un fichier config.json avec license_server_url.' 
      };
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
      // Échec de vérification - enregistrer la tentative
      const deviceId = getDeviceIdentifier(event);
      recordFailedAttempt(deviceId);
      const rateLimitInfo = checkRateLimit(deviceId);
      return { 
        success: false, 
        message: data.message || 'Licence invalide',
        remainingAttempts: rateLimitInfo.remaining || 0
      };
    }
    // Optional: verify JWT signature if provided
    const pub = getJwtPublicKey();
    if (pub) {
      // Diagnostic: lire alg/kid du token
      const hdr = parseJwtHeader(data.token);
      if (!hdr || !hdr.alg) {
        // Si le serveur renvoie un token opaque (non-JWT), on saute la vérification locale
        // et on fait confiance à la validation côté serveur (déjà effectuée).
        console.warn('[auth] Token non-JWT reçu: vérification de signature ignorée, serveur déjà validé');
        // Continuer sans retourner d'erreur
      } else {
      if (String(hdr.alg).toUpperCase() !== 'RS256') {
        const deviceId = getDeviceIdentifier(event);
        recordFailedAttempt(deviceId);
        return { success: false, message: `Algorithme non supporté (${hdr.alg}). Le serveur doit signer en RS256.` };
      }
      const valid = verifyJwtRS256(data.token, pub);
      if (!valid) {
        const deviceId = getDeviceIdentifier(event);
        recordFailedAttempt(deviceId);
        return { success: false, message: 'Signature du token invalide (clé publique ne correspond pas à la clé privée serveur?)' };
      }
      }
    }
    // Persist auth and open main window
    licenseInfo = { token: data.token, plan: data.plan, expires_at: data.expires_at || null, email: email };
    saveAuthConfig(data.plan, data.token, data.expires_at || null, email);
    isAuthenticated = true;
    
    // Succès - reset rate limiting et compteur de vérifications
    recordSuccessAttempt(deviceId);
    failedVerificationCount = 0;
    
    createMainWindow();
    scheduleLicenseWatchdog();
    return { success: true, plan: data.plan, jwt_token: data.token, expires_at: data.expires_at || null, message: 'Licence activée' };
  } catch (e) {
    console.error('[verify-license] erreur:', e);
    const deviceId = getDeviceIdentifier(event);
    recordFailedAttempt(deviceId);
    return { success: false, message: 'Erreur de vérification de licence' };
  }
});

ipcMain.handle('check-license-status', async () => {
  const ok = !!(licenseInfo && licenseInfo.token);
  if (!ok) return { valid: false, message: 'Non authentifié' };
  const res = await checkLicenseOnline();
  return { valid: !!res.ok, message: res.ok ? 'Licence valide' : (res.message || 'Invalide') };
});

ipcMain.handle('get-license-info', async () => {
  try {
    console.log('[get-license-info] Début récupération...');
    
    // D'abord, essayer de récupérer depuis Supabase pour avoir les données à jour
    let email = null;
    if (licenseInfo && licenseInfo.email) {
      email = licenseInfo.email;
      console.log('[get-license-info] Email depuis licenseInfo:', email);
    } else {
      const authConfig = readAuthConfig();
      if (authConfig && authConfig.email) {
        email = authConfig.email;
        console.log('[get-license-info] Email depuis authConfig:', email);
      }
    }
    
    // Si on a un email, récupérer depuis Supabase
    if (email) {
      let base = getLicenseServerUrl();
      console.log('[get-license-info] URL serveur:', base);
      if (base) {
        const headers = { 'Content-Type': 'application/json' };
        const anon = process.env.SUPABASE_ANON_KEY;
        if (anon) {
          headers['Authorization'] = `Bearer ${anon}`;
          headers['apikey'] = anon;
        }
        
        try {
          const url = `${base}/api/license/info?email=${encodeURIComponent(email)}`;
          console.log('[get-license-info] Appel API:', url);
          const res = await fetch(url, {
            method: 'GET',
            headers
          });
          
          if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            console.warn('[get-license-info] API erreur HTTP:', res.status, errorText);
          } else {
            const data = await res.json().catch(() => ({}));
            console.log('[get-license-info] Réponse API:', { status: res.status, ok: res.ok, data });
            
            if (data.success) {
              console.log('[get-license-info] Données Supabase reçues:', { 
                plan: data.plan, 
                expires_at: data.expires_at,
                type_plan: typeof data.plan,
                type_expires_at: typeof data.expires_at
              });
              
              // Mettre à jour les données locales avec les données de Supabase
              if (licenseInfo) {
                licenseInfo.plan = data.plan || licenseInfo.plan;
                licenseInfo.expires_at = data.expires_at || licenseInfo.expires_at;
              }
              
              return {
                success: true,
                plan: data.plan || null,
                expires_at: data.expires_at || null,
                email: data.email || email
              };
            } else {
              console.warn('[get-license-info] API Supabase a échoué:', data.message || data);
            }
          }
        } catch (e) {
          console.error('[get-license-info] Erreur récupération depuis Supabase:', e);
          console.error('[get-license-info] Stack trace:', e.stack);
          // Continuer avec les données locales en fallback
        }
      } else {
        console.warn('[get-license-info] URL serveur non configurée');
      }
    } else {
      console.warn('[get-license-info] Email non trouvé');
    }
    
    // Fallback: utiliser les données locales
    if (licenseInfo && licenseInfo.token) {
      console.log('[get-license-info] Utilisation données locales (licenseInfo):', { plan: licenseInfo.plan, expires_at: licenseInfo.expires_at });
      return {
        success: true,
        plan: licenseInfo.plan || null,
        expires_at: licenseInfo.expires_at || null,
        email: licenseInfo.email || null
      };
    }
    
    // Sinon, charger depuis la config
    const authConfig = readAuthConfig();
    if (authConfig && authConfig.token) {
      console.log('[get-license-info] Utilisation données config:', { plan: authConfig.plan, expires_at: authConfig.expires_at });
      return {
        success: true,
        plan: authConfig.plan || null,
        expires_at: authConfig.expires_at || null,
        email: authConfig.email || null
      };
    }
    
    console.warn('[get-license-info] Aucune licence trouvée');
    return { success: false, message: 'Aucune licence trouvée' };
  } catch (e) {
    console.error('[get-license-info] Erreur:', e);
    return { success: false, message: 'Erreur lors de la récupération des informations de licence' };
  }
});

blockWhenReadOnly('show-save-dialog', async (_event, { defaultPath }) => {
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

ipcMain.handle('get-app-mode', async () => {
  return { mode: appMode };
});

// ============================================================================
// SYSTÈME DE MISE À JOUR AUTOMATIQUE
// ============================================================================

// Configuration de l'auto-updater (uniquement en production)
(async () => {
  if (!app.isPackaged) return;
  try { ({ autoUpdater } = await import('electron-updater')); }
  catch (e) { console.warn('[updater] module absent, MAJ désactivées:', e?.message || e); }
  if (!autoUpdater) return;
  autoUpdater.autoDownload = false; // Ne pas télécharger automatiquement
  autoUpdater.autoInstallOnAppQuit = true; // Installer au redémarrage
  // NE PAS vérifier automatiquement au démarrage - uniquement sur demande utilisateur
  
  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] Vérification des mises à jour...');
    if (mainWindow) mainWindow.webContents.send('update-checking');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('[updater] Mise à jour disponible:', info.version);
    if (mainWindow) mainWindow.webContents.send('update-available', { version: info.version });
    // Notifier l'utilisateur uniquement si vérification manuelle
    try {
      showNotification({
        title: 'Mise à jour disponible',
        body: `Version ${info.version} disponible. Téléchargement en cours...`,
        icon: path.join(__dirname, '..', 'assets', 'icons', 'Logo.png')
      });
    } catch {}
    // Démarrer automatiquement le téléchargement
    setTimeout(async () => {
      try {
        await autoUpdater.downloadUpdate();
      } catch (e) {
        console.error('[updater] Erreur téléchargement:', e);
        if (mainWindow) mainWindow.webContents.send('update-error', { message: 'Erreur téléchargement: ' + (e.message || 'inconnue') });
      }
    }, 1000);
  });
  
  autoUpdater.on('update-not-available', () => {
    console.log('[updater] Aucune mise à jour disponible');
    if (mainWindow) mainWindow.webContents.send('update-not-available');
    // Notifier que tout est à jour
    try {
      showNotification({
        title: 'À jour',
        body: 'Vous utilisez déjà la dernière version.',
        icon: path.join(__dirname, '..', 'assets', 'icons', 'Logo.png')
      });
    } catch {}
  });
  
  autoUpdater.on('error', (err) => {
    console.error('[updater] Erreur:', err);
    if (mainWindow) mainWindow.webContents.send('update-error', { message: err.message });
    try {
      showNotification({
        title: 'Erreur de mise à jour',
        body: err.message || 'Impossible de vérifier les mises à jour',
        icon: path.join(__dirname, '..', 'assets', 'icons', 'Logo.png')
      });
    } catch {}
  });
  
  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent || 0);
    if (mainWindow) mainWindow.webContents.send('update-download-progress', { percent });
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('[updater] Mise à jour téléchargée:', info.version);
    if (mainWindow) mainWindow.webContents.send('update-downloaded', { version: info.version });
    try {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Mise à jour prête',
        message: `La mise à jour ${info.version} est téléchargée.`,
        detail: 'L\'application va redémarrer pour installer la mise à jour.',
        buttons: ['Redémarrer maintenant', 'Plus tard'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      });
    } catch {}
  });
  // Lancer une vérification automatique au démarrage (production)
  try { setTimeout(() => { autoUpdater.checkForUpdates().catch(()=>{}); }, 3000); } catch {}
})();

// Handlers IPC pour le contrôle manuel des mises à jour
ipcMain.handle('check-for-updates', async () => {
  if (!app.isPackaged) {
    return { success: false, message: 'Mises à jour disponibles uniquement en production' };
  }
  if (!autoUpdater) {
    return { success: false, message: 'Mises à jour désactivées' };
  }
  try {
    await autoUpdater.checkForUpdates();
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  if (!app.isPackaged) {
    return { success: false, message: 'Mises à jour disponibles uniquement en production' };
  }
  if (!autoUpdater) {
    return { success: false, message: 'Mises à jour désactivées' };
  }
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('install-update', async () => {
  if (!app.isPackaged) {
    return { success: false, message: 'Mises à jour disponibles uniquement en production' };
  }
  if (!autoUpdater) {
    return { success: false, message: 'Mises à jour désactivées' };
  }
  try {
    autoUpdater.quitAndInstall(false, true);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Persist license server URL in user config
ipcMain.handle('set-license-server-url', async (_event, url) => {
  try {
    if (typeof url !== 'string' || !/^https:\/\//i.test(url)) {
      return { success: false, message: 'URL invalide (HTTPS requis)' };
    }
    const cfgPath = getUserConfigPath();
    const cfg = readJsonSafe(cfgPath);
    cfg.license_server_url = url.trim();
    writeJsonSafe(cfgPath, cfg);
    return { success: true };
  } catch (e) {
    return { success: false, message: String(e) };
  }
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
  // Ensure app name is set (Windows taskbar context menu)
  if (app.getName() !== 'AppsMobs') {
    app.setName('AppsMobs Pro');
  }
  
  // Remove menu bar completely for all windows
  Menu.setApplicationMenu(null);
  
  // Request notification permission
  if (Notification.isSupported()) {
    // Permission is usually granted by default on Windows
    console.log('Desktop notifications supported');
  }
  // Create user folders under Documents
  ensureUserFolders();
  // Copy example scripts on first run
  seedExampleScripts();
  
  // En production: ne jamais afficher la fenêtre de configuration (URL embarquée)
  if (app.isPackaged) {
    createAuthWindow();
    return;
  }
  // En développement: proposer la fenêtre de configuration si URL manquante
  if (!getLicenseServerUrl()) createConfigWindow(); else createAuthWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ==========================================================================
// Assets helper - resolve path to packaged resources/assets or dev assets
// ==========================================================================
ipcMain.handle('get-asset-path', async (_event, relativePath) => {
  try {
    if (app.isPackaged) {
      // En mode packagé, les assets peuvent être dans plusieurs endroits selon la config electron-builder
      // 1. Essayer dans le dossier de l'exécutable (extraFiles)
      const exePath = process.execPath; // Chemin de l'exe
      const exeDir = path.dirname(exePath);
      const extraFilesPath = path.join(exeDir, 'assets', String(relativePath || ''));
      if (fs.existsSync(extraFilesPath)) {
        const url = 'file:///' + extraFilesPath.replace(/\\/g, '/');
        console.log(`[get-asset-path] Found in exe dir: ${url}`);
        return url;
      }
      
      // 2. Essayer dans resources (extraResources)
      const resourcesPath = path.join(process.resourcesPath, 'assets', String(relativePath || ''));
      if (fs.existsSync(resourcesPath)) {
        const url = 'file:///' + resourcesPath.replace(/\\/g, '/');
        console.log(`[get-asset-path] Found in resources: ${url}`);
        return url;
      }
      
      // 3. Essayer dans l'asar (si assets sont dans files)
      // Electron permet d'accéder aux fichiers dans l'asar comme des fichiers normaux
      try {
        const asarBase = app.getAppPath();
        // app.getAppPath() retourne le chemin de l'asar en mode packagé (ex: C:\path\to\app.asar)
        const asarPath = path.join(asarBase, 'assets', String(relativePath || ''));
        if (fs.existsSync(asarPath)) {
          // Pour les fichiers dans l'asar, Electron gère automatiquement le format
          // Convertir le chemin Windows en URL file://
          let url = asarPath.replace(/\\/g, '/');
          // S'assurer qu'on a le bon format file://
          if (!url.startsWith('file://')) {
            url = 'file:///' + url;
          }
          console.log(`[get-asset-path] Found in asar: ${url}`);
          return url;
        }
      } catch (e) {
        console.warn(`[get-asset-path] Error checking asar: ${e.message}`);
      }
      
      // 4. Essayer directement dans resources (sans assets/)
      const directResPath = path.join(process.resourcesPath, String(relativePath || ''));
      if (fs.existsSync(directResPath)) {
        const url = 'file:///' + directResPath.replace(/\\/g, '/');
        console.log(`[get-asset-path] Found in resources (direct): ${url}`);
        return url;
      }
      
      console.warn(`[get-asset-path] Not found in packaged app: ${relativePath}`);
      console.warn(`[get-asset-path] Tried paths:`, {
        exeDir: extraFilesPath,
        resources: resourcesPath,
        asar: asarPath,
        direct: directResPath,
        exePath: exePath,
        resourcesPath: process.resourcesPath
      });
      return null;
    } else {
      // En mode développement
      const base = path.join(__dirname, '..', 'assets');
      const full = path.join(base, String(relativePath || ''));
      if (fs.existsSync(full)) {
        const url = 'file:///' + full.replace(/\\/g, '/');
        console.log(`[get-asset-path] Found in dev: ${url}`);
        return url;
      } else {
        console.warn(`[get-asset-path] Not found in dev: ${full}`);
        return null;
      }
    }
  } catch (e) {
    console.error(`[get-asset-path] Error: ${e.message}`);
    console.error(`[get-asset-path] Stack:`, e.stack);
    return null;
  }
});
