import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'child_process';
import fs from 'fs';

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

      // Configuration spécifique Windows pour éviter les fenêtres CMD
      const spawnConfig = {
        detached: true,
        stdio: 'ignore',
        shell: false
      };

      // Flags Windows pour masquer complètement la console
      if (process.platform === 'win32') {
        spawnConfig.windowsHide = true;
        spawnConfig.creationFlags = 0x08000000; // CREATE_NO_WINDOW
      }

      console.log(`[scrcpy] Configuration:`, spawnConfig);
      
      const child = spawn(scrcpyPath, args, spawnConfig);
      
      // Stocker le processus pour pouvoir l'arrêter plus tard
      activeScrcpyProcesses.set(serial, child);
      
      // Nettoyer la référence pour éviter les fuites mémoire
      child.unref();
      
      console.log(`[scrcpy] Processus lancé avec PID: ${child.pid}`);
      
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
      }, 1000);
      
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

// Handler IPC pour ouvrir scrcpy
ipcMain.handle('open-scrcpy', async (event, serial) => {
  console.log(`[IPC] Demande d'ouverture scrcpy pour ${serial}`);
  return await launchScrcpy(serial);
});

// Handler IPC pour arrêter scrcpy
ipcMain.handle('stop-scrcpy', async (event, serial) => {
  console.log(`[IPC] Demande d'arrêt scrcpy pour ${serial}`);
  return { success: stopScrcpy(serial) };
});

// Handler IPC pour obtenir la liste des processus scrcpy actifs
ipcMain.handle('get-active-scrcpy', async () => {
  const active = Array.from(activeScrcpyProcesses.keys());
  console.log(`[IPC] Processus scrcpy actifs: ${active.join(', ')}`);
  return active;
});

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
ipcMain.handle('get-devices', async () => {
  return new Promise((resolve) => {
    const adb = spawn('adb', ['devices'], { shell: false });
    let output = '';
    
    adb.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    adb.on('close', () => {
      const lines = output.split('\n').filter(line => line.trim() && !line.includes('List of devices'));
      const devices = lines.map(line => {
        const [serial, status] = line.split('\t');
        return { serial: serial.trim(), status: status.trim() };
      }).filter(device => device.status === 'device');
      
      resolve(devices);
    });
    
    adb.on('error', () => {
      resolve([]);
    });
  });
});

ipcMain.handle('setup-device', async (event, serial) => {
  // Validation du serial pour prévenir l'injection de commande
  if (!serial || typeof serial !== 'string' || !/^[a-zA-Z0-9:._-]+$/.test(serial)) {
    return { success: false, serial, error: 'Invalid serial format' };
  }

  return new Promise((resolve) => {
    const adb = spawn('adb', ['-s', serial, 'shell', 'echo', 'setup'], { shell: false });
    
    adb.on('close', (code) => {
      resolve({ success: code === 0, serial });
    });
    
    adb.on('error', () => {
      resolve({ success: false, serial });
    });
  });
});

function getPythonCommand() {
  // Essaye python d'abord, sinon py -3 (Windows), sinon python3
  try {
    execSync('python --version', { stdio: 'ignore' });
    return 'python';
  } catch {}
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

  console.log('[run-script] Starting scripts:', scriptFile, 'on devices:', serials);

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
        args = ['-3', bridgePath, resolvedScriptPath, serial];
      } else {
        args = [bridgePath, resolvedScriptPath, serial];
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
          PATH: process.env.PATH
        }
      });
      runningProcs.set(serial, child);
      // Inform renderer this serial is now running
      const runningMsg = { serial, status: 'running' };
      safeSend(event.sender, 'script-status', runningMsg);
      broadcast('script-status', runningMsg);
      child.on('error', (err) => {
        console.error(`[run-script] spawn error for ${serial}:`, err);
        try { runningProcs.delete(serial); } catch {}
        try { event.sender.send('script-status', { serial, status: 'stopped', error: String(err) }); } catch {}
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout?.on('data', (d) => {
        stdoutData += d.toString();
        const pl = { serial, line: d.toString() };
        safeSend(event.sender, 'script-log', pl);
        broadcast('script-log', pl);
      });
      child.stderr?.on('data', (d) => {
        stderrData += d.toString();
        const pl = { serial, line: d.toString(), level: 'ERROR' };
        safeSend(event.sender, 'script-log', pl);
        broadcast('script-log', pl);
      });
      // Cleanup on exit and close to be robust on Windows
      child.on('exit', (code) => {
        console.log(`[run-script] (exit) Process for ${serial} exited with code ${code}`);
        runningProcs.delete(serial);
        const exitMsg = { serial, code: code || 0 };
        const stopMsg = { serial, status: 'stopped', code: code || 0 };
        safeSend(event.sender, 'script-exit', exitMsg);
        safeSend(event.sender, 'script-status', stopMsg);
        broadcast('script-exit', exitMsg);
        broadcast('script-status', stopMsg);
      });
      child.on('close', (code) => {
        console.log(`[run-script] Process for ${serial} exited with code ${code}`);
        runningProcs.delete(serial);
        const exitMsg = { serial, code: code || 0 };
        const stopMsg = { serial, status: 'stopped', code: code || 0 };
        safeSend(event.sender, 'script-exit', exitMsg);
        safeSend(event.sender, 'script-status', stopMsg);
        // Also broadcast stopped status so UI can re-enable actions
        broadcast('script-exit', exitMsg);
        broadcast('script-status', stopMsg);
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
    try { killChildProcess(child); } catch {}
    runningProcs.delete(serial);
  }
  return { ok: true };
});

// Stop a single device's running script
ipcMain.handle('stop-script-on-device', async (_event, serial) => {
  if (!serial || typeof serial !== 'string' || !/^[a-zA-Z0-9:._-]+$/.test(serial)) {
    return { ok: false, message: 'Invalid serial' };
  }
  const child = runningProcs.get(serial);
  if (!child) {
    return { ok: false, message: 'No running script for device' };
  }
  try {
    killChildProcess(child);
    runningProcs.delete(serial);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
});

ipcMain.handle('capture-screenshot', async (event, payload) => {
  return new Promise((resolve) => {
    const { serial, dir } = typeof payload === 'object' ? payload : { serial: payload, dir: undefined };
    
    // Validation du serial pour prévenir l'injection de commande
    if (!serial || typeof serial !== 'string' || !/^[a-zA-Z0-9:._-]+$/.test(serial)) {
      return resolve({ success: false, serial, error: 'Invalid serial format' });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const screenshotsDir = dir ? path.resolve(dir) : path.join(__dirname, '..', 'screenshots');
    
    // Créer le dossier screenshots s'il n'existe pas
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const outputFile = path.join(screenshotsDir, `${serial}_${timestamp}.png`);
    const adb = spawn('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { shell: false });
    
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

ipcMain.handle('load-scripts', async (_event, baseDir) => {
  const scriptsDir = baseDir ? path.resolve(baseDir) : path.join(__dirname, '..', 'scripts');
  
  console.log('[load-scripts] Looking in:', scriptsDir);
  
  if (!fs.existsSync(scriptsDir)) {
    console.log('[load-scripts] Directory does not exist');
    return [];
  }
  
  const files = fs.readdirSync(scriptsDir);
  console.log('[load-scripts] Found files:', files);
  
  const scripts = files
    .filter(file => file.endsWith('.py') && !file.startsWith('_') && file !== '__init__.py')
    .map(file => ({
      name: file.replace('.py', ''),
      file: path.join(scriptsDir, file), // Use absolute path for bridge
      version: '1.0',
      duration: '60s'
    }));
  
  console.log('[load-scripts] Returning scripts:', scripts.map(s => s.name));
  return scripts;
});

ipcMain.handle('open-file', async (event, filePath) => {
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    exec(`start "" "${filePath}"`, (error) => {
      resolve({ success: !error });
    });
  });
});

ipcMain.handle('choose-directory', async () => {
  const res = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (res.canceled || !res.filePaths || res.filePaths.length === 0) return { canceled: true };
  return { canceled: false, path: res.filePaths[0] };
});

ipcMain.handle('verify-license', async (event, { email, key }) => {
  return new Promise((resolve) => {
    // TODO: Integrate with your existing Python license verification
    // For now, simulate a successful verification
    setTimeout(() => {
      resolve({ success: true, message: 'Licence activée avec succès' });
    }, 1000);
  });
});

ipcMain.handle('check-license-status', async () => {
  return new Promise((resolve) => {
    // TODO: Check actual license status from your Python backend
    // For now, simulate a valid license
    resolve({ valid: true, message: 'Licence valide' });
  });
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
