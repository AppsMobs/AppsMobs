(function(){
  let editor = null;
  let isModified = false;
  // Liste de devices accessible pour le clic capture
  let availableDevices = [];
  // --- i18n (iframe) ---
  let lang = (function(){ try { return window.localStorage.getItem('lang') || (window.parent && window.parent.localStorage && window.parent.localStorage.getItem('lang')) || 'en'; } catch { return 'en'; } })();
  let i18n = {};
  async function loadI18n(){
    try { const res = await fetch(`./lang/${lang}.json`); i18n = await res.json(); } catch { i18n = {}; }
  }
  function ti(key, vars){
    let txt = (i18n[key] || key);
    if (vars) { Object.entries(vars).forEach(([k,v]) => { txt = txt.replace(`{{${k}}}`, v); }); }
    // Capitalize first to match style everywhere
    if (typeof txt === 'string' && txt.length) txt = txt[0].toUpperCase()+txt.slice(1);
    return txt;
  }
  async function applyI18n(){
    await loadI18n();
    try{
      const et = document.querySelector('.editor-title'); if(et) et.textContent = `📝 ${ti('play_title')}`;
      const bu = document.getElementById('btn-undo'); if(bu) bu.textContent = `↶ ${ti('undo')}`;
      const br = document.getElementById('btn-redo'); if(br) br.textContent = `↷ ${ti('redo')}`;
      const bp = document.getElementById('btn-preview'); if(bp) bp.textContent = `👁️ ${ti('preview')}`;
      const bs = document.getElementById('btn-save'); if(bs) bs.textContent = `💾 ${ti('save')}`;
      const bsc = document.getElementById('btn-screenshot'); if(bsc) bsc.textContent = `📸 ${ti('capture_ecran')}`;
      const ss = document.getElementById('save-status'); if(ss) ss.textContent = ti('unsaved');
      const lc = document.getElementById('line-count'); if(lc) lc.textContent = ti('line_col', { line: 1, col: 1 });
      const sh = document.querySelector('.status-right .status-item span:last-child'); if(sh) sh.textContent = ti('shortcuts');
      const hint = document.querySelector('.editor-hint .hint-text'); if(hint) hint.innerHTML = `💡 <strong>${ti('tip')}</strong> ${ti('hint_text')}`;
      // Titre des blocs
      const bt = document.querySelector('.blocks-panel h3'); if(bt) bt.textContent = `🧩 ${ti('blocks_title')}`;
      // Catégories (en se basant sur l'ordre)
      const cats = document.querySelectorAll('.category-title');
      const catKeys = ['cat_clicks','cat_swipes','cat_loops','cat_navigation','cat_text','cat_swipes_dir','cat_image','cat_apps','cat_network','cat_utils'];
      cats.forEach((el,i)=>{ const k = catKeys[i]; if(k) el.textContent = el.textContent.replace(/^[^A-Za-zÀ-ÿ]*/,'') && ti(k); });
      // Traduction générique tous blocs
      document.querySelectorAll('.block-btn[data-action]').forEach(block => {
        const type = block.getAttribute('data-action');
        const tt = block.querySelector('.block-title');
        const dd = block.querySelector('.block-desc');
        if (tt) {
          const k = `block_${type}_title`;
          if (i18n[k]) tt.textContent = ti(k);
        }
        if (dd) {
          const k = `block_${type}_desc`;
          if (i18n[k]) dd.textContent = ti(k);
        }
      });
    }catch{}
  }
  // Appelle l'i18n rapidement
  applyI18n();
  // Demande la liste des devices au parent dès le chargement
  try { window.parent.postMessage({ type:'request-devices' }, '*'); } catch {}

  try {
    const amdRequire = (typeof window !== 'undefined' && window.require && typeof window.require.config === 'function') ? window.require : null;
    if (!amdRequire) {
      console.warn('Monaco AMD loader introuvable. Assurez-vous d\'avoir ./vendor/monaco/min/vs/loader.js chargé.');
      return;
    }

    // Charger Monaco depuis le vendor local
    amdRequire.config({ paths: { 'vs': './vendor/monaco/min/vs' } });

    amdRequire(['vs/editor/editor.main'], function () {
      monaco.editor.defineTheme('appsMobsTheme', {
        base: 'vs-dark', inherit: true,
        rules: [
          { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'ff79c6' },
          { token: 'string', foreground: 'f1fa8c' },
          { token: 'number', foreground: 'bd93f9' },
          { token: 'regexp', foreground: 'f1fa8c' },
          { token: 'operator', foreground: 'ff79c6' },
          { token: 'namespace', foreground: '8be9fd' },
          { token: 'type', foreground: '8be9fd' },
          { token: 'struct', foreground: '8be9fd' },
          { token: 'class', foreground: '8be9fd' },
          { token: 'interface', foreground: '8be9fd' },
          { token: 'parameter', foreground: '8be9fd' },
          { token: 'variable', foreground: '8be9fd' },
          { token: 'function', foreground: '50fa7b' },
          { token: 'method', foreground: '50fa7b' },
          { token: 'decorator', foreground: '50fa7b' },
          { token: 'macro', foreground: '50fa7b' },
          { token: 'boolean', foreground: 'bd93f9' },
          { token: 'constant', foreground: 'bd93f9' },
          { token: 'punctuation', foreground: 'f8f8f2' },
          { token: 'delimiter', foreground: 'f8f8f2' },
          { token: 'tag', foreground: 'ff79c6' },
          { token: 'attribute.name', foreground: '8be9fd' },
          { token: 'attribute.value', foreground: 'f1fa8c' }
        ],
        colors: {
          'editor.background': '#0f172a',
          'editor.foreground': '#e2e8f0',
          'editor.lineHighlightBackground': '#1e293b',
          'editor.selectionBackground': '#334155',
          'editor.inactiveSelectionBackground': '#1e293b',
          'editorCursor.foreground': '#00e8ff',
          'editorWhitespace.foreground': '#475569',
          'editorIndentGuide.background': '#334155',
          'editorIndentGuide.activeBackground': '#64748b',
          'editorLineNumber.foreground': '#64748b',
          'editorLineNumber.activeForeground': '#94a3b8',
          'editorGutter.background': '#0f172a',
          'editorBracketMatch.background': '#334155',
          'editorBracketMatch.border': '#00e8ff',
          'editorSuggestWidget.background': '#1e293b',
          'editorSuggestWidget.border': '#334155',
          'editorSuggestWidget.selectedBackground': '#334155',
          'editorHoverWidget.background': '#1e293b',
          'editorHoverWidget.border': '#334155',
          'editorWidget.background': '#1e293b',
          'editorWidget.border': '#334155',
          'scrollbarSlider.background': '#334155',
          'scrollbarSlider.hoverBackground': '#475569',
          'scrollbarSlider.activeBackground': '#64748b'
        }
      });

      const initialCode = `"""
Script personnalisé pour AppsMobs
Modifiez la fonction my_script() pour créer votre automatisation
"""

import time
from core import log, log_step


def my_script(android_client, serial):
    """
    Votre script personnalisé
    
    Args:
        android_client: Instance Android (pour cliquer, swiper, etc.)
        serial: Numéro de série du device
        
    Returns:
        dict: {'success': bool, 'message': str, 'data': {}}
    """
    # Importer les fonctions de logging
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        log(serial, "Début du script")


        # ... Votre code ici ...

        
        log(serial, "Script terminé avec succès!")
        result['success'] = True
        result['message'] = f'Script exécuté sur {serial}'
        result['data']['device'] = serial
    except Exception as e:
        log(serial, f"Erreur: {e}", "ERROR")
        result['success'] = False
        result['message'] = str(e)
        import traceback
        result['data']['traceback'] = traceback.format_exc()
    
    return result
`;

      editor = monaco.editor.create(document.getElementById('monaco-container'), {
        value: initialCode,
        language: 'python',
        theme: 'appsMobsTheme',
        fontSize: 14,
        automaticLayout: true,
        wordWrap: 'on'
      });

      function updateStatusBar(){
        try{
          const position = editor.getPosition();
          const lineCount = editor.getModel().getLineCount();
          const lc = document.getElementById('line-count');
          const ss = document.getElementById('save-status');
          if (lc) lc.textContent = ti('line_col', { line: position.lineNumber, col: position.column });
          if (ss) ss.textContent = isModified ? ti('modified') : ti('saved');
        }catch{}
      }

      updateStatusBar();
      editor.onDidChangeModelContent(()=>{ isModified = true; updateStatusBar(); });
      editor.onDidChangeCursorPosition(()=> updateStatusBar());

      // Expose minimal API globally used by buttons
      window.insertCode = function(type){
        if (!editor) return;
        const position = editor.getPosition();
        const map = {
          // Clics
          click: "# Cliquer à une position\nclick(540, 960)",
          doubleclick: "# Double clic\ndoubleclick(540, 960)",
          back: "back()",
          home: "home()",

          // Swipes directionnels rapides (one-liners)
          swipe_down: "swipe_down()",
          swipe_up: "swipe_up()",
          swipe_left: "swipe_left()",
          swipe_right: "swipe_right()",

          // Swipe personnalisé (choisir les points)
          swipe_custom: "# Swipe personnalisé\n# 1) Choisissez le point de départ (x1, y1) et le point d'arrivée (x2, y2)\n# 2) y augmente vers le bas de l'écran (0 en haut)\n# 3) Ajustez la durée en millisecondes\n# Exemple: milieu-gauche vers milieu-droit\nx1, y1 = 200, 960\nx2, y2 = 900, 960\nduration_ms = 500\nswipe(x1, y1, x2, y2, duration_ms)",

          // Boucles / conditions
          for_loop: "for i in range(5):\n    pass",
          while_loop: "while True:\n    # TODO: remplacez condition et retirez le break\n    break",
          if_condition: "if True:\n    pass",

          // Navigation
          switch: "switch_app()",
          entre: "enter()",

          // Texte / appui long
          write: "write(android_client, 'Votre texte ici')",
          long_press: "long_press(540, 960, 1000)",

          // Swipes directionnels (uniques)

          // Détection d'images
          find_image: "find(\"image.png\", 0.8)",
          find_image_and_click: "find_image_and_click(\"image.png\", 0.85)",
          find_image_click_all: "for x, y in find_all(\"image.png\", 0.8):\n    click(x, y)",
          wait_for_image: "wait_for_image(\"image.png\", timeout=10)",
          find_loop: "find_loop(\"image.png\", 0.8)",
          find_click_loop_sound: "find_and_click_loop_with_sound(\"image.png\", 0.8)",
          find_image_bool: "exists = find_image_bool(\"image.png\", 0.85)\nif exists:\n    print('image trouvée')\nelse:\n    print('image absente')",
          // remplace l'entrée précédente, garde uniquement celle-ci
          find_images_list: "find_images_list([\"a.png\", \"b.png\", \"c.png\"], 0.85)",
          find_images_list_click: "pos = find_images_list([\"a.png\", \"b.png\"], 0.85)\nif pos:\n    click(pos[0], pos[1])",
          click_until_image_appears: "click_until_image_appears([(540,960),(560,980)], \"target.png\", max_clicks=10, confidence=0.85)",
          finddoubleclick: "Finddoubleclick(\"image.png\", 0.85)",
          FindAndDoubleClick: "FindAndDoubleClick([\"a.png\",\"b.png\"], 0.85)",
          FindPosClick: "FindPosClick(\"image.png\", 0.85, region=None, xp=0, yp=0)",
          FindPosClickSound: "FindPosClickSound(\"image.png\", 0.85, region=None, xp=0, yp=0, max_attempts=20)",
          FindPosClickList: "FindPosClickList([\"a.png\",\"b.png\"], 0.85)",
          FindPosClickListLoop: "FindPosClickListLoop([\"a.png\",\"b.png\"], 0.85)",
          long_press_image: "long_press_image(\"image.png\", 1000)",
          FindAllImages: "results = FindAllImages([\"a.png\",\"b.png\"], 0.9)\n# results['a.png'] -> (x,y) ou None",

          // Gestion apps
          restart_app: "restart_app(\"com.example.app\")",
          clear_cache: "clear_cache(\"com.example.app\")",
          screenshot: "screenshot(\"screenshots/capture.png\")",

          // Réseau
          toggle_airplane_mode: "toggle_airplane_mode()",

          // Utilitaires
          wait: "wait(1.0)",
          random_delay: "random_delay(0.5, 2.0)",
          log: "log(serial, \"Message de log\")"
        };
        const text = map[type] || `# Action inconnue: ${type}`;
        editor.executeEdits('insert-code', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text
        }]);
        editor.focus();
      };
      window.undoAction = function(){ if (editor) editor.trigger('keyboard','undo',null); };
      window.redoAction = function(){ if (editor) editor.trigger('keyboard','redo',null); };
      window.previewScript = function(){ if (!editor) return; console.log('Aperçu du script:', editor.getValue()); };
      window.saveScript = async function(){ if (!editor) return; const code = editor.getValue(); window.parent.postMessage({ type:'save-file', content: code, defaultPath: 'scripts/mon_script.py' }, '*'); };

      // Réception de code depuis le parent pour charger un fichier
      window.addEventListener('message', function(ev){
        try {
          if (ev.data && ev.data.type === 'load-code' && typeof ev.data.content === 'string') {
            editor.setValue(ev.data.content);
            // Mettre à jour l'indicateur de sauvegarde
            isModified = false;
            const ss = document.getElementById('save-status');
            if (ss) ss.textContent = ti('loaded');
            // Optionnel: mémoriser le chemin cible pour save
            if (ev.data.defaultPath) {
              window.defaultSavePath = ev.data.defaultPath;
              window.saveScript = async function(){ if (!editor) return; const code = editor.getValue(); window.parent.postMessage({ type:'save-file', content: code, defaultPath: ev.data.defaultPath }, '*'); };
            }
          }
        } catch {}
      });

      // Message du parent pour MAJ chemin d'enregistrement
      window.addEventListener('message', function(ev){
        try {
          if(ev.data && ev.data.type === 'set-save-path' && ev.data.defaultPath){
            window.defaultSavePath = ev.data.defaultPath;
            window.saveScript = async function(){ if (!editor) return; const code = editor.getValue(); window.parent.postMessage({ type:'save-file', content: code, defaultPath: ev.data.defaultPath }, '*'); };
          }
        } catch {}
      });

      // CSR-safe wiring for block buttons and header actions (no inline handlers)
      try {
        document.querySelectorAll('.block-btn[data-action]')
          .forEach(btn => btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action) window.insertCode(action);
          }));
        const bUndo = document.getElementById('btn-undo');
        const bRedo = document.getElementById('btn-redo');
        const bSave = document.getElementById('btn-save');
        const bDocs = document.getElementById('btn-docs');
        if (bUndo) bUndo.addEventListener('click', () => window.undoAction());
        if (bRedo) bRedo.addEventListener('click', () => window.redoAction());
        if (bSave) bSave.addEventListener('click', () => window.saveScript());
        if (bDocs) bDocs.addEventListener('click', () => openDocsModal());
      } catch {}
    });
  } catch (e) {
    console.error('Erreur init Monaco:', e);
  }

  function showDevicePicker(devices){
    return new Promise((resolve)=>{
      if (!devices || devices.length === 0) { resolve(null); return; }
      if (devices.length === 1) { resolve(devices[0]); return; }
      // Créer la modale (i18n)
      const overlay = document.createElement('div');
      overlay.className = 'custom-popup';
      overlay.innerHTML = `
        <div class="custom-popup-content">
          <div class="custom-popup-title">${ti('choose_device_title') || 'Choose a device'}</div>
          <div class="custom-popup-message">${ti('choose_device_message') || 'Select the device to capture:'}</div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;max-height:50vh;overflow:auto;">
            ${devices.map((d,i)=>`<button class="custom-popup-btn custom-popup-btn-secondary" data-serial="${d}">${i+1}. ${d}</button>`).join('')}
          </div>
          <div class="custom-popup-buttons">
            <button class="custom-popup-btn custom-popup-btn-secondary" data-cancel>${ti('cancel') || 'Cancel'}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.hasAttribute('data-cancel')) {
          try { document.body.removeChild(overlay); } catch {}
          resolve(null);
          return;
        }
        const serial = btn.getAttribute('data-serial');
        // Fermer immédiatement la modale dès que l'utilisateur choisit
        try { document.body.removeChild(overlay); } catch {}
        resolve(serial);
      });
    });
  }

  // Modale custom pour confirmation d'ouverture Paint
  function showOpenInPaintConfirm(filename){
    return new Promise((resolve)=>{
      const overlay = document.createElement('div');
      overlay.className = 'custom-popup';
      overlay.innerHTML = `
        <div class="custom-popup-content">
          <div class="custom-popup-title">${ti('capture_success') || 'Screenshot saved'}</div>
          <div class="custom-popup-message">${filename}</div>
          <div class="custom-popup-message" style="margin-top:8px;">${ti('open_in_paint_prompt') || 'Open the screenshot in Paint to crop?'}</div>
          <div class="custom-popup-buttons">
            <button class="custom-popup-btn custom-popup-btn-primary" data-yes>${ti('yes') || 'Yes'}</button>
            <button class="custom-popup-btn custom-popup-btn-secondary" data-no>${ti('no') || 'No'}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (e)=>{
        const yes = e.target.closest('button[data-yes]');
        const no = e.target.closest('button[data-no]');
        if (!yes && !no) return;
        try { document.body.removeChild(overlay); } catch {}
        resolve(!!yes);
      });
    });
  }

  // Réception des devices et résultat capture
  window.addEventListener('message', function(ev) {
    if (ev.data && ev.data.type === 'set-devices') {
      availableDevices = ev.data.devices || [];
    } else if (ev.data && ev.data.type === 'capture-screenshot-result') {
      const result = ev.data.result;
      if (result && result.success) {
        showOpenInPaintConfirm(result.fileName).then(yes => {
          if (yes && result.filePath) {
            try { window.parent.postMessage({ type:'open-file', path: result.filePath }, '*'); } catch {}
          }
        });
      } else {
        alert(`❌ ${ti('capture_failed') || 'Screenshot failed'}: ${result && (result.fileName || result.error) || 'Unknown error'}`);
      }
    }
  });

  // Gestion centralisée du clic Capture écran
  async function handleScreenshotClick(){
    try {
      // 1) Essayez d'utiliser la liste du parent immédiatement
      if ((!availableDevices || availableDevices.length === 0) && window.parent && window.parent.currentDeviceSerials) {
        availableDevices = window.parent.currentDeviceSerials.slice();
      }
      // 2) Si pas de liste, demande-la et attends max 2s
      if (!availableDevices || availableDevices.length === 0) {
        const devicesPromise = new Promise((resolve) => {
          const onMsg = (e) => {
            if (e.data && e.data.type === 'set-devices') {
              availableDevices = e.data.devices || [];
              window.removeEventListener('message', onMsg);
              resolve(availableDevices);
            }
          };
          window.addEventListener('message', onMsg);
          try { window.parent.postMessage({ type:'request-devices' }, '*'); } catch {}
          setTimeout(() => { window.removeEventListener('message', onMsg); resolve([]); }, 2000);
        });
        await devicesPromise;
      }
      if (!availableDevices || availableDevices.length === 0) {
        alert(ti('no_device') || 'No device connected.');
        return;
      }
      // 3) Modale de choix (ou auto si 1)
      let serial = await showDevicePicker(availableDevices);
      if (!serial) return; // annulé
      window.parent.postMessage({ type: 'capture-screenshot', serial }, '*');
    } catch (e) {
      alert(`${ti('capture_error') || 'Capture error'}: `+ (e && e.message ? e.message : 'inconnue'));
    }
  }

  const bScreen = document.getElementById('btn-screenshot');
  if (bScreen) {
    bScreen.addEventListener('click', handleScreenshotClick);
  }
  // Délégation au cas où l'écouteur direct est manqué (bubbling + capture)
  document.addEventListener('click', (e) => {
    try {
      const t = e.target;
      if (t && (t.id === 'btn-screenshot' || (t.closest && t.closest('#btn-screenshot')))) {
        handleScreenshotClick();
      }
    } catch {}
  }, true);
  // Raccourci de secours: F9 déclenche capture
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F9') {
      handleScreenshotClick();
    }
  });
  
  // ===== Docs modal =====
  const functionDocs = [
    // Clics
    {name: 'click(x, y)', snippet: "click(540, 960)", fr: 'Clique à l’endroit indiqué.', en: 'Click at the given position.'},
    {name: 'doubleclick(x, y)', snippet: "doubleclick(540, 960)", fr: 'Double‑clic (utile pour ouvrir).', en: 'Double‑click (e.g. open).'},
    // Texte
    {name: 'write(text)', snippet: "write('Hello')", fr: 'Tape du texte dans le champ actif.', en: 'Type text into the focused field.'},
    // Navigation
    {name: 'back() / home()', snippet: "back()\nhome()", fr: 'Boutons Retour et Accueil.', en: 'Back and Home buttons.'},
    {name: 'enter()', snippet: "enter()", fr: 'Valide (touche Entrée).', en: 'Enter/confirm key.'},
    {name: 'switch_app()', snippet: "switch_app()", fr: 'Ouvre le multitâche.', en: 'Open app switcher.'},
    // Swipes
    {name: 'swipe_up/down/left/right()', snippet: "swipe_up()", fr: 'Glisse directionnelle simple.', en: 'Simple directional swipe.'},
    {name: 'swipe(x1, y1, x2, y2, duration)', snippet: "swipe(200, 960, 900, 960, 500)", fr: 'Swipe personnalisé (point A → B).', en: 'Custom swipe (point A → B).'},
    // Vision
    {name: 'find(image, confidence=0.8, region=None)', snippet: "find('btn.png', 0.85)", fr: 'Recherche 1 fois; retourne (x,y) ou None.', en: 'Single check; return (x,y) or None.'},
    {name: 'find_image_and_click(image, confidence)', snippet: "find_image_and_click('btn.png', 0.85)", fr: 'Clique si l’image est visible.', en: 'Click if image is visible.'},
    {name: 'find_loop(image, confidence, region)', snippet: "find_loop('btn.png', 0.85)", fr: 'Boucle jusqu’à trouver l’image.', en: 'Loop until the image appears.'},
    {name: 'find_and_click_loop(image, ...)', snippet: "find_and_click_loop('btn.png', 0.85)", fr: 'Boucle puis clique dès apparition.', en: 'Loop then click once visible.'},
    {name: 'find_and_click_loop_with_sound(image, ...)', snippet: "find_and_click_loop_with_sound('btn.png', 0.85)", fr: 'Idem avec alerte périodique.', en: 'Same with periodic alert.'},
    {name: 'find_image_bool(image, confidence, region)', snippet: "find_image_bool('ok.png', 0.9)", fr: 'Vérifie en 1 passe (True/False).', en: 'One‑shot boolean check.'},
    {name: 'find_images_list([images], confidence, region)', snippet: "find_images_list(['a.png','b.png'], 0.85)", fr: 'Retourne la première trouvée.', en: 'Return the first found.'},
    {name: 'find_all(image, confidence, region)', snippet: "find_all('star.png', 0.9)", fr: 'Toutes les occurrences visibles.', en: 'All visible occurrences.'},
    {name: 'click_until_image_appears(positions, target, ...)', snippet: "click_until_image_appears([(540,960)], 'ok.png', 10, 0.85)", fr: 'Clique une liste de points jusqu’à apparition.', en: 'Click positions until appears.'},
    {name: 'wait_for_image(image, confidence, timeout, region)', snippet: "wait_for_image('ok.png', 0.85, timeout=30)", fr: 'Attend l’apparition (ou timeout).', en: 'Wait until appears (or timeout).'},
    // Système / réseau
    {name: 'screenshot(filename)', snippet: "screenshot('cap.png')", fr: 'Sauvegarde une capture.', en: 'Save a screenshot.'},
    {name: 'toggle_airplane_mode()', snippet: "toggle_airplane_mode()", fr: 'ON puis OFF (réseau).', en: 'Toggle airplane mode.'},
    // Utilitaires
    {name: 'random_delay(min_s, max_s)', snippet: "random_delay(0.5, 1.5)", fr: 'Attente aléatoire (anti‑bot).', en: 'Random sleep.'},
    {name: 'long_press(x, y, duration_ms)', snippet: "long_press(540, 960, 1000)", fr: 'Appui long (ms).', en: 'Long press (ms).'},
    {name: 'long_press_image(image, duration_ms, confidence)', snippet: "long_press_image('pin.png', 800, 0.9)", fr: 'Appui long si l’image est visible.', en: 'Long press if image is visible.'}
  ];

  function openDocsModal(){
    const overlay = document.createElement('div');
    overlay.className = 'custom-popup';
    const rows = functionDocs.map(d => {
      const desc = lang === 'fr' ? d.fr : d.en;
      return `<div style="padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:10px;background:rgba(16,39,51,.6)">
        <div style="color:#00e8ff;font-weight:700;margin-bottom:6px;">${d.name}</div>
        <div style="color:#94a3b8;margin-bottom:8px;">${desc}</div>
        <pre style="background:#0f172a;color:#cfe3ed;padding:8px;border-radius:6px;white-space:pre-wrap;">${d.snippet}</pre>
      </div>`;
    }).join('');
    overlay.innerHTML = `
      <div class="custom-popup-content" style="max-width:820px;">
        <div class="custom-popup-title">${lang==='fr'?'Référence des fonctions Core':'Core functions reference'}</div>
        <div class="custom-popup-message" style="text-align:left;max-height:60vh;overflow:auto;">${rows}</div>
        <div class="custom-popup-buttons">
          <button class="custom-popup-btn custom-popup-btn-primary" data-close>OK</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e)=>{
      if (e.target.closest('[data-close]') || e.target === overlay) {
        try { document.body.removeChild(overlay); } catch {}
      }
    });
  }
})();
