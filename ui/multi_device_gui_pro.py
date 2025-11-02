"""
Interface Multi-Appareils Professionnelle avec debug avancé
"""
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import threading
import sys
import time
from pathlib import Path
from datetime import datetime
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.multi_device_manager import MultiDeviceManager, load_custom_script
from adbutils import adb
from core.license import is_pro, is_licensed, max_concurrent_devices, verify_license_with_server, save_license_token, load_license_token, check_license_token_online
import subprocess
import os
try:
    from PIL import Image, ImageTk
except Exception:
    Image = None
    ImageTk = None
try:
    import customtkinter as ctk  # type: ignore
except Exception:
    ctk = None  # type: ignore


class MultiDeviceAppPro:
    """Interface professionnelle avec debug et interaction"""
    
    def __init__(self, root, mirror_prints_to_console=True):
        self.root = root
        self.root.title("AppsMobs Pro - Multi-Appareils & Scripts")
        # Plein écran au lancement
        try:
            self.root.state('zoomed')
        except Exception:
            try:
                self.root.attributes('-zoomed', True)
            except Exception:
                self.root.geometry("1200x800")
        
        self.manager = MultiDeviceManager()
        self.loaded_scripts = {}
        self.running_scripts_info = {}  # Statut détaillé de chaque script
        self.activation_window = None  # Assure une seule fenêtre d'activation
        self._license_state = None  # 'valid' | 'invalid' | None
        self.theme_path = Path('ui_theme.json')
        # Mode unique: dark
        self.theme_mode = 'dark'
        
        self._bg_cache = None  # cache image bg
        self.setup_ui()
        # Déclencher après rendu initial pour accélérer l'ouverture
        self.root.after(200, self._load_background_once)
        self.root.after(400, self.load_scripts)
        self.root.after(600, self.refresh_devices)
        
        # Timer pour mettre à jour les statuts
        self.update_timer()

        # Rediriger stdout/stderr vers la console intégrée si demandé
        if mirror_prints_to_console:
            self._install_console_redirect()

        # Prompt d'activation si non licencié
        # Vérification en ligne du token (révocation/expiration)
        try:
            # Reporter la vérification licence juste après l'affichage
            res = check_license_token_online()
            if res.get('ok'):
                self._license_state = 'valid'
            else:
                if self._license_state != 'invalid':
                    self.log(f"Vérification licence: {res.get('message', 'Non valide')}", "WARNING")
                    self._apply_license_restrictions()
                self._license_state = 'invalid'
        except Exception:
            pass

        if not is_licensed():
            self.root.after(300, self.prompt_activation)

        # Démarrer un watchdog de licence pour invalidation immédiate
        self.root.after(800, self._start_license_watchdog)
    
    def setup_ui(self):
        """Configure l'interface avancée"""
        # Style personnalisé
        style = ttk.Style()
        style.theme_use('clam')

        # Palette moderne
        if self.theme_mode == 'dark':
            # Palette inspirée de ton screen (bleu/teal néon)
            palette = {
                'bg': '#0b1e27',
                'panel': '#102733',
                'fg': '#cfe3ed',
                'muted': '#6b98b1',
                'accent': '#22d3ee',
                'success': '#22c55e',
                'error': '#ef4444',
            }
        else:
            palette = {
                'bg': '#e6f6fb',
                'panel': '#ffffff',
                'fg': '#0b1e27',
                'muted': '#406578',
                'accent': '#0ea5b7',
                'success': '#16a34a',
                'error': '#dc2626',
            }
        self.palette = palette

        self.root.configure(background=palette['bg'])

        # L'image de fond est chargée en différé via _load_background_once

        style.configure('TFrame', background=palette['bg'])
        style.configure('TLabelframe', background=palette['panel'], foreground=palette['fg'])
        style.configure('TLabelframe.Label', background=palette['panel'], foreground=palette['fg'])
        style.configure('TLabel', background=palette['bg'], foreground=palette['fg'])
        # Boutons
        style.configure('TButton', padding=6)
        style.configure('Accent.TButton', foreground='#ffffff')
        style.map('Accent.TButton', 
                   background=[('!disabled', palette['accent']), ('active', palette['accent'])],
                   foreground=[('disabled', '#9ca3af'), ('!disabled', '#ffffff')])
        style.configure('Treeview', background=palette['panel'], fieldbackground=palette['panel'], foreground=palette['fg'])
        style.configure('TNotebook', background=palette['bg'])
        style.configure('TNotebook.Tab', background=palette['panel'], foreground=palette['fg'])
        
        # Conteneur principal avec sidebar
        container = ttk.Frame(self.root)
        container.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        container.columnconfigure(0, weight=0)
        container.columnconfigure(1, weight=1)
        container.rowconfigure(0, weight=1)

        # Sidebar (navigation)
        sidebar = ttk.Frame(container, padding="10")
        sidebar.grid(row=0, column=0, sticky=(tk.N, tk.S))
        ttk.Label(sidebar, text="🕹️", font=('Segoe UI', 24, 'bold'), foreground=self.palette['accent']).pack(pady=(4, 16))
        self._mk_button(sidebar, "Dashboard", lambda: None).pack(fill=tk.X, pady=4)
        self._mk_button(sidebar, "Appareils", lambda: None).pack(fill=tk.X, pady=4)
        self._mk_button(sidebar, "Scripts", lambda: None).pack(fill=tk.X, pady=4)
        self._mk_button(sidebar, "Paramètres", self.show_settings).pack(fill=tk.X, pady=4)

        # Frame principal (contenu)
        main_frame = ttk.Frame(container, padding="10")
        main_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(1, weight=1)
        
        # Header
        header = ttk.Frame(main_frame)
        header.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        title = ttk.Label(header, text="🎮 AppsMobs Pro", font=('Segoe UI', 18, 'bold'), foreground=self.palette['accent'])
        title.pack(side=tk.LEFT)
        
        self.status_label = ttk.Label(header, text="● Prêt", font=('Segoe UI', 10))
        self.status_label.pack(side=tk.RIGHT)

        # Mode dark uniquement: pas de bouton de changement de thème
        
        # Panel gauche: Appareils et Scripts
        left_panel = ttk.Frame(main_frame)
        left_panel.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))
        main_frame.rowconfigure(1, weight=1)
        main_frame.columnconfigure(0, weight=1)
        
        # Panel droit: Console de debug
        right_panel = ttk.Frame(main_frame)
        right_panel.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(5, 0))
        main_frame.columnconfigure(1, weight=1)
        
        # === BARRE DE RECHERCHE ===
        search = ttk.Frame(main_frame)
        search.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        search.columnconfigure(0, weight=1)
        self.search_var = tk.StringVar()
        entry = tk.Entry(search, textvariable=self.search_var, relief='flat')
        entry.grid(row=0, column=0, sticky=(tk.W, tk.E), padx=10, pady=6)
        self._mk_button(search, "🔍 Rechercher", self._on_search).grid(row=0, column=1, padx=10, pady=6)

        # === PANEL GAUCHE ===
        self.setup_left_panel(left_panel)
        
        # === PANEL DROIT ===
        self.setup_right_panel(right_panel)
    
    def setup_left_panel(self, parent):
        """Panel gauche: Contrôles"""
        # Appareils
        devices_frame = ttk.LabelFrame(parent, text="📱 Appareils Connectés", padding="10")
        devices_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        self.devices_tree = ttk.Treeview(devices_frame, columns=('model', 'status', 'script'), show='tree headings', height=8)
        self.devices_tree.heading('#0', text='Serial')
        self.devices_tree.heading('model', text='Modèle')
        self.devices_tree.heading('status', text='Statut')
        self.devices_tree.heading('script', text='Script')
        self.devices_tree.column('#0', width=150)
        self.devices_tree.column('model', width=100)
        self.devices_tree.column('status', width=100)
        self.devices_tree.column('script', width=120)
        
        scrollbar_devices = ttk.Scrollbar(devices_frame, orient=tk.VERTICAL, command=self.devices_tree.yview)
        self.devices_tree.config(yscrollcommand=scrollbar_devices.set)
        
        self.devices_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar_devices.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Boutons appareils
        devices_buttons = ttk.Frame(devices_frame)
        devices_buttons.pack(fill=tk.X, pady=(5, 0))
        
        self.btn_refresh = self._mk_button(devices_buttons, "🔄 Actualiser", self.refresh_devices)
        self.btn_refresh.pack(side=tk.LEFT, padx=2)
        self.btn_setup = self._mk_button(devices_buttons, "✅ Configurer", self.setup_selected)
        self.btn_setup.pack(side=tk.LEFT, padx=2)
        self.btn_scrcpy = self._mk_button(devices_buttons, "📱 Scrcpy", self.open_scrcpy_selected)
        self.btn_scrcpy.pack(side=tk.LEFT, padx=2)
        
        # Scripts
        scripts_frame = ttk.LabelFrame(parent, text="📜 Scripts", padding="10")
        scripts_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        self.scripts_tree = ttk.Treeview(scripts_frame, columns=('version', 'duration'), show='tree headings', height=6)
        self.scripts_tree.heading('#0', text='Script')
        self.scripts_tree.heading('version', text='Version')
        self.scripts_tree.heading('duration', text='Durée max')
        self.scripts_tree.column('#0', width=200)
        self.scripts_tree.column('version', width=80)
        self.scripts_tree.column('duration', width=80)
        
        self.scripts_tree.pack(fill=tk.BOTH, expand=True)
        
        # Boutons scripts
        scripts_buttons = ttk.Frame(scripts_frame)
        scripts_buttons.pack(fill=tk.X, pady=(5, 0))
        
        self._mk_button(scripts_buttons, "🔄 Recharger", self.load_scripts).pack(side=tk.LEFT, padx=2)
        self._mk_button(scripts_buttons, "➕ Charger", self.load_custom_script).pack(side=tk.LEFT, padx=2)
        
        # Actions
        actions_frame = ttk.LabelFrame(parent, text="⚡ Actions", padding="10")
        actions_frame.grid(row=2, column=0, sticky=(tk.W, tk.E))
        
        action_grid = ttk.Frame(actions_frame)
        action_grid.pack(fill=tk.BOTH, expand=True)
        
        self.btn_run_selected = self._mk_button(action_grid, "🎬 Lancer sur sélectionnés", self.run_script_selected)
        self.btn_run_selected.grid(row=0, column=0, padx=2, pady=2, sticky=(tk.W, tk.E))
        self.btn_run_all = self._mk_button(action_grid, "🌐 Lancer sur TOUS", self.run_on_all)
        self.btn_run_all.grid(row=0, column=1, padx=2, pady=2, sticky=(tk.W, tk.E))
        self.btn_stop_all = self._mk_button(action_grid, "🛑 Arrêter tout", self.stop_all)
        self.btn_stop_all.grid(row=1, column=0, padx=2, pady=2, sticky=(tk.W, tk.E))
        self.btn_report = self._mk_button(action_grid, "📊 Rapport", self.show_report)
        self.btn_report.grid(row=1, column=1, padx=2, pady=2, sticky=(tk.W, tk.E))

        # Bouton capture d'écran
        self.btn_screenshot = self._mk_button(action_grid, "📸 Capture écran (sélection)", self.capture_screenshot_selected)
        self.btn_screenshot.grid(row=2, column=0, columnspan=2, padx=2, pady=2, sticky=(tk.W, tk.E))
        
        action_grid.columnconfigure(0, weight=1)
        action_grid.columnconfigure(1, weight=1)

    def _on_search(self):
        q = (self.search_var.get() or '').strip().lower()
        for item in self.devices_tree.get_children():
            serial = (self.devices_tree.item(item, 'text') or '').lower()
            model = (self.devices_tree.set(item, 'model') or '').lower()
            visible = (q in serial) or (q in model)
            try:
                if visible:
                    self.devices_tree.reattach(item, '', 'end')
                else:
                    self.devices_tree.detach(item)
            except Exception:
                pass
    
    def setup_right_panel(self, parent):
        """Panel droit: Debug et logs"""
        # Frame notebook
        notebook = ttk.Notebook(parent)
        notebook.pack(fill=tk.BOTH, expand=True)
        
        # Tab 1: Console
        console_frame = ttk.Frame(notebook, padding="5")
        notebook.add(console_frame, text="📝 Console")
        
        self.console_text = tk.Text(
            console_frame,
            wrap=tk.WORD,
            font=('Consolas', 10),
            bg=("#0b1220" if self.theme_mode == 'dark' else '#ffffff'),
            fg=("#e5e7eb" if self.theme_mode == 'dark' else '#0f172a'),
            insertbackground=("#e5e7eb" if self.theme_mode == 'dark' else '#0f172a'),
            relief='flat',
            borderwidth=8,
        )
        console_scroll = ttk.Scrollbar(console_frame, orient=tk.VERTICAL, command=self.console_text.yview)
        self.console_text.config(yscrollcommand=console_scroll.set)
        
        self.console_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        console_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Tab 2: Debug détaillé
        debug_frame = ttk.Frame(notebook, padding="5")
        notebook.add(debug_frame, text="🔍 Debug")
        
        self.debug_tree = ttk.Treeview(debug_frame, columns=('value',), show='tree headings')
        self.debug_tree.heading('#0', text='Propriété')
        self.debug_tree.heading('value', text='Valeur')
        self.debug_tree.column('#0', width=200)
        
        debug_scroll = ttk.Scrollbar(debug_frame, orient=tk.VERTICAL, command=self.debug_tree.yview)
        self.debug_tree.config(yscrollcommand=debug_scroll.set)
        
        self.debug_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        debug_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Boutons en bas
        debug_buttons = ttk.Frame(notebook)
        notebook.add(debug_buttons, text="⚙️ Outils")
        
        self._mk_button(debug_buttons, "🗑️ Effacer console", self.clear_console).pack(padx=5, pady=5)
        self._mk_button(debug_buttons, "📋 Exporter logs", self.export_logs).pack(padx=5, pady=5)
        self._mk_button(debug_buttons, "🔧 Paramètres", self.show_settings).pack(padx=5, pady=5)
        self._mk_button(debug_buttons, "🔑 Activer licence", self.prompt_activation).pack(padx=5, pady=5)

        # Appliquer restrictions licence dès l'UI prête
        self._apply_license_restrictions()

    def _apply_license_restrictions(self):
        """Désactive les actions si aucune licence valide."""
        if not is_licensed():
            self.status_label.config(text="● Licence requise")
            self.log("Licence requise pour utiliser la console et lancer des scripts.", "ERROR")
            for btn in [self.btn_setup, self.btn_scrcpy, self.btn_run_selected, self.btn_run_all, self.btn_stop_all, self.btn_report]:
                try:
                    btn.config(state=tk.DISABLED)
                except Exception:
                    pass
        else:
            self.status_label.config(text="● Prêt")
            for btn in [self.btn_setup, self.btn_scrcpy, self.btn_run_selected, self.btn_run_all, self.btn_stop_all, self.btn_report]:
                try:
                    btn.config(state=tk.NORMAL)
                except Exception:
                    pass

    def prompt_activation(self):
        """Fenêtre modale pour activer la licence (email + clé)."""
        import tkinter as tk
        # Éviter d'ouvrir plusieurs fenêtres d'activation
        try:
            if self.activation_window is not None and self.activation_window.winfo_exists():
                self.activation_window.lift()
                self.activation_window.focus_force()
                return
        except Exception:
            self.activation_window = None

        win = tk.Toplevel(self.root)
        win.title("Activer la licence")
        win.transient(self.root)
        win.grab_set()
        win.geometry("360x220")
        self.activation_window = win

        ttk.Label(win, text="Email").pack(pady=(15, 2))
        email_var = tk.StringVar()
        email_entry = ttk.Entry(win, textvariable=email_var)
        email_entry.pack(fill=tk.X, padx=16)

        ttk.Label(win, text="Clé de licence").pack(pady=(10, 2))
        key_var = tk.StringVar()
        key_entry = ttk.Entry(win, textvariable=key_var)
        key_entry.pack(fill=tk.X, padx=16)

        status_var = tk.StringVar(value="")
        status_lbl = ttk.Label(win, textvariable=status_var, foreground="gray")
        status_lbl.pack(pady=8)

        def do_activate():
            email = email_var.get().strip()
            key = key_var.get().strip()
            if not email or not key:
                status_var.set("Veuillez saisir email et clé.")
                return
            status_var.set("Vérification en cours...")
            self.root.after(10, lambda: self._activate_async(email, key, win, status_var))

        self._mk_button(win, "Activer", do_activate).pack(pady=10)

        def _on_close():
            try:
                self.activation_window = None
            except Exception:
                pass
            try:
                win.destroy()
            except Exception:
                pass

        self._mk_button(win, "Fermer", _on_close).pack()

    def _mk_button(self, parent, text, command):
        """Crée un bouton stylé. Utilise customtkinter si dispo, sinon ttk."""
        if ctk is not None:
            try:
                btn = ctk.CTkButton(parent, text=text, command=command,
                                    corner_radius=12,
                                    fg_color=self.palette.get('accent', '#6366f1'),
                                    hover_color='#7c83f7',
                                    text_color='#ffffff',
                                    height=32)
                return btn
            except Exception:
                pass
        # Fallback ttk
        return ttk.Button(parent, text=text, command=command, style='Accent.TButton')
        win.protocol("WM_DELETE_WINDOW", _on_close)

        email_entry.focus_set()

    def _activate_async(self, email: str, key: str, win, status_var):
        def worker():
            res = verify_license_with_server(email, key)
            if res.get('ok'):
                save_license_token(email, key, res.get('plan', 'pro'), res.get('token', ''), res.get('expires_at'))
                self.log("Licence activée avec succès.", "SUCCESS")
                self._apply_license_restrictions()
                try:
                    status_var.set("Licence activée.")
                    # Fermer proprement la fenêtre d'activation
                    if self.activation_window is not None and self.activation_window.winfo_exists():
                        self.activation_window.destroy()
                    self.activation_window = None
                except Exception:
                    pass
            else:
                msg = res.get('message', 'Activation impossible')
                self.log(f"Activation echouée: {msg}", "ERROR")
                try:
                    status_var.set(msg)
                except Exception:
                    pass

        threading.Thread(target=worker, daemon=True).start()

    def _install_console_redirect(self):
        """Redirige sys.stdout et sys.stderr vers la console intégrée tout en conservant la sortie terminal."""
        import sys as _sys

        class _Tee:
            def __init__(self, text_widget_log_fn, original_stream, level):
                self._log_fn = text_widget_log_fn
                self._original = original_stream
                self._level = level
                self._buffer = ""

            def write(self, s):
                try:
                    self._original.write(s)
                except Exception:
                    pass
                self._buffer += s
                while "\n" in self._buffer:
                    line, self._buffer = self._buffer.split("\n", 1)
                    if line.strip():
                        # Post sur le thread UI
                        self._log_fn(line, self._level)

            def flush(self):
                try:
                    self._original.flush()
                except Exception:
                    pass

        # Utilise app.log dans le thread UI via after()
        def ui_safe_log(message, level):
            try:
                self.root.after(0, lambda: self.log(message, level))
            except Exception:
                pass

        _sys.stdout = _Tee(ui_safe_log, _sys.__stdout__ if hasattr(_sys, "__stdout__") and _sys.__stdout__ else _sys.stdout, "DEBUG")
        _sys.stderr = _Tee(ui_safe_log, _sys.__stderr__ if hasattr(_sys, "__stderr__") and _sys.__stderr__ else _sys.stderr, "ERROR")

    def _start_license_watchdog(self):
        """Vérifie périodiquement la validité de la licence auprès du serveur.
        Si révoquée/expirée, désactive immédiatement les fonctionnalités.
        """
        def tick():
            try:
                res = check_license_token_online()
                if res.get('ok'):
                    if self._license_state != 'valid':
                        self._license_state = 'valid'
                        self.log("Licence valide", "SUCCESS")
                else:
                    if self._license_state != 'invalid':
                        self._license_state = 'invalid'
                        self.log(f"Licence invalide: {res.get('message','')}", "ERROR")
                        self._apply_license_restrictions()
                        # Afficher prompt seulement si aucune fenêtre n'est ouverte
                        try:
                            if not (self.activation_window is not None and self.activation_window.winfo_exists()):
                                self.root.after(100, self.prompt_activation)
                        except Exception:
                            self.activation_window = None
            except Exception:
                # tolérer les erreurs réseau
                pass
            finally:
                # Replanifie dans 5s
                try:
                    self.root.after(5000, tick)
                except Exception:
                    pass

        # Première vérification dans 5s
        self.root.after(5000, tick)
    
    def log(self, message, level="INFO"):
        """Ajoute un message dans la console avec timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Couleurs selon le niveau
        colors = {
            "INFO": "black",
            "DEBUG": "blue",
            "SUCCESS": "green",
            "WARNING": "orange",
            "ERROR": "red"
        }
        
        self.console_text.insert(tk.END, f"[{timestamp}] [{level}] {message}\n", level.lower())
        self.console_text.tag_config("info", foreground="black")
        self.console_text.tag_config("debug", foreground="#60a5fa")
        self.console_text.tag_config("success", foreground="#22c55e")
        self.console_text.tag_config("warning", foreground="#f59e0b")
        self.console_text.tag_config("error", foreground="#ef4444")
        
        self.console_text.see(tk.END)
    
    def clear_console(self):
        """Efface la console"""
        self.console_text.delete(1.0, tk.END)
        self.log("Console effacée", "INFO")

    def _load_theme_mode(self) -> str:
        try:
            if self.theme_path.exists():
                data = json.loads(self.theme_path.read_text(encoding='utf-8'))
                mode = (data.get('mode') or '').strip().lower()
                if mode in {'dark', 'light'}:
                    return mode
        except Exception:
            pass
        return 'dark'

    def _save_theme_mode(self) -> None:
        try:
            self.theme_path.write_text(json.dumps({'mode': self.theme_mode}), encoding='utf-8')
        except Exception:
            pass
    
    def export_logs(self):
        """Exporte les logs dans un fichier"""
        filename = f"bootybot_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(self.console_text.get(1.0, tk.END))
        
        self.log(f"Logs exportés dans: {filename}", "SUCCESS")
        messagebox.showinfo("Export", f"Logs exportés:\n{filename}")
    
    def show_settings(self):
        """Affiche les paramètres"""
        settings = tk.Toplevel(self.root)
        settings.title("Paramètres")
        settings.geometry("400x300")
        
        ttk.Label(settings, text="⚙️ Paramètres BootyBot Pro", font=('Arial', 14, 'bold')).pack(pady=10)
        
        # Options
        ttk.Checkbutton(settings, text="Auto-refresh appareils (5s)").pack(pady=5)
        ttk.Checkbutton(settings, text="Debug mode").pack(pady=5)
        ttk.Checkbutton(settings, text="Sound alerts").pack(pady=5)
        
        # Slider FPS
        fps_frame = ttk.Frame(settings)
        fps_frame.pack(pady=10)
        ttk.Label(fps_frame, text="Scrcpy FPS:").pack(side=tk.LEFT)
        fps_var = tk.IntVar(value=15)
        ttk.Scale(fps_frame, from_=5, to=60, orient=tk.HORIZONTAL, variable=fps_var).pack(side=tk.LEFT)
        ttk.Label(fps_frame, textvariable=fps_var).pack(side=tk.LEFT)
    
    def update_timer(self):
        """Met à jour les statuts toutes les secondes"""
        # Rafraîchir les statuts des appareils
        for item in self.devices_tree.get_children():
            serial = self.devices_tree.item(item, 'text')
            
            # Mettre à jour le statut
            if serial in self.manager.devices:
                device = self.manager.devices[serial]
                status = device['status']
                
                # Mettre à jour la couleur selon le statut
                self.devices_tree.set(item, 'status', status)
                
                if status == 'running':
                    self.devices_tree.set(item, 'status', '▶️ En cours')
                elif status == 'ready':
                    self.devices_tree.set(item, 'status', '✅ Prêt')
                elif status == 'stopping':
                    self.devices_tree.set(item, 'status', '⏹️ Arrêt...')
                
                # Script en cours
                if serial in self.running_scripts_info:
                    script_name = self.running_scripts_info[serial].get('name', 'N/A')
                    elapsed = int(time.time() - self.running_scripts_info[serial].get('start_time', 0))
                    self.devices_tree.set(item, 'script', f"{script_name} ({elapsed}s)")
        
        # Replanifier la mise à jour
        self.root.after(1000, self.update_timer)
    
    def refresh_devices(self):
        """Actualise la liste des appareils"""
        def worker():
            try:
                self.log("Actualisation des appareils...", "DEBUG")
                devices = self.manager.get_connected_devices()
                rows = []
                for device in devices:
                    try:
                        serial = device.serial
                        # Lazy model: pas de getprop coûteux ici; affiché plus tard
                        model = "Inconnu"
                        status = "✅ Configuré" if serial in self.manager.devices else "⚠️ Non configuré"
                        rows.append((serial, model, status))
                    except Exception as e:
                        self.log(f"Erreur appareil: {e}", "ERROR")
                def update_ui():
                    self.devices_tree.delete(*self.devices_tree.get_children())
                    for serial, model, status in rows:
                        self.devices_tree.insert('', tk.END, text=serial, values=(model, status, "Aucun"))
                    self.log(f"✅ {len(rows)} appareil(s) détecté(s)", "SUCCESS")
                self.root.after(0, update_ui)
            except Exception as e:
                self.log(f"Erreur refresh: {e}", "ERROR")
        threading.Thread(target=worker, daemon=True).start()

    def _load_background_once(self):
        if self._bg_cache is not None:
            return
        try:
            bg_path = Path('assets/icons/background.webp')
            if not bg_path.exists():
                return
            from PIL import Image
            w = self.root.winfo_width() or 1280
            h = self.root.winfo_height() or 800
            img = Image.open(str(bg_path)).convert('RGB').resize((w, h))
            self._bg_cache = ImageTk.PhotoImage(img)
            self._bg_label = tk.Label(self.root, image=self._bg_cache, borderwidth=0)
            self._bg_label.place(x=0, y=0, relwidth=1, relheight=1)
            self._bg_label.lower()
        except Exception:
            self._bg_cache = None
    
    def setup_selected(self):
        """Configure les appareils sélectionnés"""
        selected = self.devices_tree.selection()
        
        if not selected:
            messagebox.showwarning("Avertissement", "Sélectionnez des appareils")
            return
        
        devices_list = self.manager.get_connected_devices()
        
        for item in selected:
            serial = self.devices_tree.item(item, 'text')
            
            self.log(f"Configuration de {serial}...", "DEBUG")
            
            if self.manager.setup_device(serial):
                self.log(f"✅ {serial} configuré avec succès", "SUCCESS")
                self.devices_tree.set(item, 'status', '✅ Configuré')
                self.devices_tree.set(item, 'model', devices_list[0].serial)
            else:
                self.log(f"❌ Erreur configuration {serial}", "ERROR")
        
        self.refresh_devices()
    
    def load_scripts(self):
        """Charge les scripts"""
        import importlib.util
        
        scripts_dir = Path('scripts')
        self.loaded_scripts = {}
        self.scripts_tree.delete(*self.scripts_tree.get_children())
        
        if not scripts_dir.exists():
            self.log("Dossier scripts/ non trouvé", "WARNING")
            return
        
        for script_file in scripts_dir.glob('*.py'):
            if script_file.name == '__init__.py' or script_file.name.startswith('_'):
                continue
            
            try:
                result = load_custom_script(script_file.name)
                if result:
                    script_func, script_info = result
                    self.loaded_scripts[script_file.name] = {
                        'function': script_func,
                        'info': script_info
                    }
                    
                    # Ajouter au tree
                    self.scripts_tree.insert('', tk.END, text=script_info['name'],
                                           values=(script_info['version'], 
                                                  f"{script_info['max_duration']}s"))
                    
                    self.log(f"✅ Script chargé: {script_info['name']}", "SUCCESS")
            except Exception as e:
                self.log(f"❌ Erreur chargement {script_file.name}: {e}", "ERROR")
    
    def load_custom_script(self):
        """Charge un script personnalisé depuis un fichier"""
        file_path = filedialog.askopenfilename(
            title="Charger un script personnalisé",
            filetypes=[("Python files", "*.py"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                # Copier vers scripts/
                import shutil
                target = Path('scripts') / Path(file_path).name
                shutil.copy(file_path, target)
                
                self.log(f"✅ Script copié: {target}", "SUCCESS")
                
                # Recharger les scripts
                self.load_scripts()
                
                messagebox.showinfo("Succès", f"Script chargé:\n{target}")
                
            except Exception as e:
                self.log(f"❌ Erreur chargement fichier: {e}", "ERROR")
                messagebox.showerror("Erreur", f"Impossible de charger le script:\n{e}")
    
    def open_scrcpy_selected(self):
        """Ouvre scrcpy pour les appareils sélectionnés"""
        import subprocess, shutil
        
        selected = self.devices_tree.selection()
        devices_list = self.manager.get_connected_devices()
        
        if not selected:
            messagebox.showwarning("Avertissement", "Sélectionnez des appareils")
            return
        
        for item in selected:
            serial = self.devices_tree.item(item, 'text')
            self.log(f"📱 Ouverture scrcpy pour {serial}...", "DEBUG")
            
            scrcpy_path = shutil.which('scrcpy')
            if not scrcpy_path:
                self.log("❌ scrcpy non trouvé", "ERROR")
                continue
            
            try:
                cmd = [scrcpy_path, '-s', serial, '--max-fps', '15', '--video-bit-rate', '8M']
                subprocess.Popen(cmd)
                self.log(f"✅ scrcpy ouvert pour {serial}", "SUCCESS")
            except Exception as e:
                self.log(f"❌ Erreur: {e}", "ERROR")
    
    def run_script_selected(self):
        """Lance le script sur les appareils sélectionnés"""
        selected = self.scripts_tree.selection()
        devices_selected = self.devices_tree.selection()
        
        if not devices_selected:
            messagebox.showwarning("Avertissement", "Sélectionnez des appareils dans l'arbre")
            return
        
        if not selected:
            messagebox.showwarning("Avertissement", "Sélectionnez un script dans l'arbre")
            return

        # Limitation par licence: plan gratuit -> 1 appareil
        allowed = max_concurrent_devices()
        if len(devices_selected) > allowed:
            self.log(f"❌ Votre plan autorise {allowed} appareil(s) en simultané. Sélection actuelle: {len(devices_selected)}.", "ERROR")
            messagebox.showerror("Limite d'abonnement",
                                 f"Votre abonnement permet {allowed} appareil(s) simultané(s).\n"
                                 f"Passez à Pro pour plus d'appareils.")
            return
        
        # Récupérer le script
        script_item = self.scripts_tree.item(selected[0])
        script_name_display = script_item['text']
        
        # Trouver le script correspondant
        script_info = None
        script_function = None
        
        for key, value in self.loaded_scripts.items():
            if value['info']['name'] == script_name_display:
                script_function = value['function']
                script_info = value['info']
                break
        
        if not script_function:
            self.log("❌ Script non trouvé", "ERROR")
            return
        
        # Lancer sur les appareils sélectionnés
        devices_list = self.manager.get_connected_devices()
        
        for device_item in devices_selected:
            serial = self.devices_tree.item(device_item, 'text')
            
            # Configurer si nécessaire
            if serial not in self.manager.devices:
                self.log(f"Configuration de {serial}...", "DEBUG")
                if not self.manager.setup_device(serial):
                    self.log(f"❌ Erreur configuration {serial}", "ERROR")
                    continue
            
            # Lancer le script
            self.log(f"🚀 Démarrage: {script_info['name']} sur {serial}", "INFO")
            
            # Log de début/fin autour de l'exécution côté manager
            self.manager.run_script_on_device(serial, script_function, open_viewer=True)
            
            # Sauvegarder les infos du script en cours
            self.running_scripts_info[serial] = {
                'name': script_info['name'],
                'start_time': time.time(),
                'device': serial
            }
            
            self.log(f"✅ Script démarré sur {serial}", "SUCCESS")
        
        self.status_label.config(text="● Script(s) en cours...")
    
    def run_on_all(self):
        """Lance le script sur tous les appareils"""
        if not self.manager.devices:
            messagebox.showwarning("Avertissement", "Configurez des appareils d'abord")
            return
        
        messagebox.showinfo("Info", f"Script lancé sur {len(self.manager.devices)} appareil(s)")
    
    def stop_all(self):
        """Arrête tous les scripts"""
        self.log("🛑 Arrêt de tous les scripts...", "WARNING")
        for serial in self.manager.devices.keys():
            self.manager.stop_script(serial)
        self.status_label.config(text="● Prêt")
        self.log("✅ Tous les scripts arrêtés", "SUCCESS")
    
    def show_report(self):
        """Affiche un rapport détaillé"""
        report = f"📊 RAPPORT APPSMOBS\n{'='*50}\n\n"
        report += f"Appareils configurés: {len(self.manager.devices)}\n"
        report += f"Scripts chargés: {len(self.loaded_scripts)}\n"
        report += f"Scripts en cours: {len(self.running_scripts_info)}\n\n"
        
        report += "Détails par appareil:\n"
        for serial, info in self.running_scripts_info.items():
            elapsed = int(time.time() - info['start_time'])
            report += f"- {serial}: {info['name']} ({elapsed}s)\n"
        
        messagebox.showinfo("Rapport", report)

    def capture_screenshot_selected(self):
        """Prend une capture d'écran des appareils sélectionnés et enregistre des PNG dans screenshots/.
        Après capture, propose d'ouvrir un outil de découpage simple (ou l'éditeur OS) pour recadrer l'image.
        """
        selected = self.devices_tree.selection()
        if not selected:
            messagebox.showwarning("Avertissement", "Sélectionnez des appareils")
            return

        screenshots_dir = Path('screenshots')
        try:
            screenshots_dir.mkdir(parents=True, exist_ok=True)
        except Exception:
            pass

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        success_count = 0

        saved_files = []
        for item in selected:
            serial = self.devices_tree.item(item, 'text')
            outfile = screenshots_dir / f"{serial}_{timestamp}.png"
            try:
                # Utilise adb screencap, plus universel
                # 'adb -s <serial> exec-out screencap -p' > outfile
                adb_path = None
                try:
                    adb_path = os.environ.get('ADB_PATH') or None
                except Exception:
                    adb_path = None
                cmd = [adb_path or 'adb', '-s', serial, 'exec-out', 'screencap', '-p']
                with open(outfile, 'wb') as f:
                    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    out, err = proc.communicate(timeout=15)
                    if proc.returncode != 0 or not out:
                        raise RuntimeError(err.decode('utf-8', errors='ignore') or 'Erreur screencap')
                    f.write(out)
                self.log(f"📸 Capture enregistrée: {outfile}", "SUCCESS")
                success_count += 1
                saved_files.append(outfile)
            except Exception as e:
                self.log(f"❌ Capture échouée sur {serial}: {e}", "ERROR")

        if success_count and saved_files:
            # Ouvrir directement dans l'éditeur système (sans sélection de zone)
            first = saved_files[0]
            self._open_external(first)

    def _open_external(self, image_path: Path):
        try:
            if os.name == 'nt':
                os.startfile(str(image_path))  # type: ignore
            elif sys.platform == 'darwin':
                subprocess.Popen(['open', str(image_path)])
            else:
                subprocess.Popen(['xdg-open', str(image_path)])
        except Exception as e:
            self.log(f"❌ Impossible d'ouvrir l'éditeur: {e}", "ERROR")


def main():
    """Fonction principale"""
    root = tk.Tk()
    app = MultiDeviceAppPro(root, mirror_prints_to_console=True)
    root.mainloop()


if __name__ == '__main__':
    main()

