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
        env: { 
          ...process.env, 
          ADB_SERIAL: serial,
          PATH: process.env.PATH
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
