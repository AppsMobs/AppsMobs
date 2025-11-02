# 🔧 Correction des Paramètres

## ✅ Modifications effectuées

### 1. **HTML** (`electron-app/renderer/index.html`)
**Problème :** Toggle "Thème sombre" était `disabled`
```html
<!-- AVANT -->
<input type="checkbox" id="dark-theme" checked disabled>

<!-- APRÈS -->
<input type="checkbox" id="dark-theme" checked>
```

### 2. **JavaScript** (`electron-app/renderer/renderer.js`)

#### A. **setupSettingsListeners()** - Ligne 620
Ajout du listener pour le dark theme :
```javascript
// Dark theme toggle
const darkThemeToggle = document.getElementById('dark-theme');
if (darkThemeToggle) {
  darkThemeToggle.addEventListener('change', function() {
    saveSettings();
  });
}
```

#### B. **saveSettings()** - Ligne 693
Ajout du dark theme dans les paramètres sauvegardés :
```javascript
const settings = {
  autoRefresh: document.getElementById('auto-refresh').checked,
  debugMode: document.getElementById('debug-mode').checked,
  soundAlerts: document.getElementById('sound-alerts').checked,
  darkTheme: document.getElementById('dark-theme')?.checked ?? true,  // ← Ajouté
  // ...
};
```

#### C. **loadSettings()** - Ligne 710
Ajout du chargement du dark theme :
```javascript
// Load dark theme (only if not disabled)
const darkThemeToggle = document.getElementById('dark-theme');
if (darkThemeToggle && !darkThemeToggle.disabled) {
  darkThemeToggle.checked = settings.darkTheme ?? true;
}
```

---

## 🎯 Tests à effectuer

1. ✅ Vérifier que tous les toggles fonctionnent
2. ✅ Vérifier que les changements sont sauvegardés
3. ✅ Vérifier que les paramètres sont chargés au redémarrage
4. ✅ Vérifier que le dark theme peut être activé/désactivé

---

## 📝 Paramètres fonctionnels

### ✅ Paramètres qui fonctionnent maintenant :
- ☑️ Auto-refresh appareils
- ☑️ Mode debug
- ☑️ Alertes sonores
- ☑️ **Thème sombre** (corrigé)
- ☑️ FPS scrcpy
- ☑️ Bitrate scrcpy
- ☑️ Largeur scrcpy
- ☑️ Niveau de log
- ☑️ Chemins (scripts, screenshots)

---

## 🔍 Détails techniques

### **localStorage**
Les paramètres sont sauvegardés dans `localStorage` sous la clé `'appsmobs-settings'`

### **Format JSON**
```json
{
  "autoRefresh": true,
  "debugMode": false,
  "soundAlerts": true,
  "darkTheme": true,
  "scrcpyFps": 15,
  "scrcpyBitrate": 8,
  "scrcpyWidth": 1080,
  "logLevel": "INFO",
  "scriptsPath": "...",
  "screenshotsPath": "..."
}
```

# Code signing (Windows)

Pour reduire les avertissements SmartScreen et augmenter la confiance, signez l'exe final.

Pre-requis:
- Certificat PFX de signature de code + mot de passe
- Windows SDK (signtool)

PowerShell (variables):

```
$env:CODESIGN_PFX="C:\certs\codesign.pfx"
$env:CODESIGN_PFX_PASSWORD="votre_mot_de_passe"
```

Signature:

```
signtool sign /f "$env:CODESIGN_PFX" /p "$env:CODESIGN_PFX_PASSWORD" /tr "http://timestamp.digicert.com" /td SHA256 /fd SHA256 "..\dist\BootyBot\BootyBot.exe"
```

Signez egalement les DLLs et l'installeur si vous en avez un.