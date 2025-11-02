"""
Interface graphique principale (Tkinter MVP)
"""
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import sys
from pathlib import Path
import time

# Ajout du chemin parent pour les imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core import Android
from adbutils import adb
from core.check_deps import check_all_dependencies, print_dependency_report
from core.scrcpy_launcher import ScrcpyLauncher
from core.license import check_license_token_online


class AndroidControllerApp:
    """Application principale de contrôle Android"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("BootyBot - Contrôleur Android")
        self.root.geometry("800x600")
        
        # Variables d'état
        self.android_client = None
        self.device = None
        self.scrcpy_launcher = ScrcpyLauncher()
        
        # Interface utilisateur
        self.setup_ui()
        
        # Vérification des dépendances au démarrage
        self.check_dependencies_on_startup()
        # Lancement de la vérification périodique de licence
        self.start_license_watchdog()
    
    def setup_ui(self):
        """Configure l'interface utilisateur"""
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configuration du redimensionnement
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Titre
        title_label = ttk.Label(
            main_frame,
            text="🎮 BootyBot - Contrôleur Android",
            font=('Arial', 16, 'bold')
        )
        title_label.grid(row=0, column=0, columnspan=2, pady=10)
        
        # Section : État des dépendances
        deps_frame = ttk.LabelFrame(main_frame, text="État des dépendances", padding="10")
        deps_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        self.deps_status_label = ttk.Label(deps_frame, text="⏳ Vérification en cours...")
        self.deps_status_label.pack()
        
        check_deps_button = ttk.Button(
            deps_frame,
            text="🔍 Vérifier les dépendances",
            command=self.check_dependencies
        )
        check_deps_button.pack(pady=5)
        
        # Section : Appareils connectés
        devices_frame = ttk.LabelFrame(main_frame, text="Appareils connectés", padding="10")
        devices_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        devices_frame.columnconfigure(0, weight=1)
        
        self.device_label = ttk.Label(devices_frame, text="Aucun appareil connecté")
        self.device_label.grid(row=0, column=0, sticky=tk.W)
        
        refresh_button = ttk.Button(
            devices_frame,
            text="🔄 Actualiser",
            command=self.refresh_devices
        )
        refresh_button.grid(row=0, column=1, padx=5)
        
        # Liste déroulante des appareils
        self.device_var = tk.StringVar()
        self.device_combo = ttk.Combobox(
            devices_frame,
            textvariable=self.device_var,
            state='readonly',
            width=40
        )
        self.device_combo.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Section : Contrôle
        control_frame = ttk.LabelFrame(main_frame, text="Contrôle de l'appareil", padding="10")
        control_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Boutons de contrôle
        button_frame = ttk.Frame(control_frame)
        button_frame.pack(fill=tk.BOTH, expand=True)
        
        self.connect_button = ttk.Button(
            button_frame,
            text="🔌 Connecter",
            command=self.connect_device,
            state='disabled'
        )
        self.connect_button.pack(side=tk.LEFT, padx=5)
        
        self.disconnect_button = ttk.Button(
            button_frame,
            text="❌ Déconnecter",
            command=self.disconnect_device,
            state='disabled'
        )
        self.disconnect_button.pack(side=tk.LEFT, padx=5)
        
        # Section : Actions
        actions_frame = ttk.LabelFrame(main_frame, text="Actions disponibles", padding="10")
        actions_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Boutons d'actions
        actions_grid = ttk.Frame(actions_frame)
        actions_grid.pack()
        
        self.back_button = ttk.Button(
            actions_grid,
            text="⬅️ Retour",
            command=self.action_back,
            state='disabled'
        )
        self.back_button.grid(row=0, column=0, padx=5, pady=5)
        
        self.home_button = ttk.Button(
            actions_grid,
            text="🏠 Accueil",
            command=self.action_home,
            state='disabled'
        )
        self.home_button.grid(row=0, column=1, padx=5, pady=5)
        
        self.switch_button = ttk.Button(
            actions_grid,
            text="🔄 Basculer app",
            command=self.action_switch,
            state='disabled'
        )
        self.switch_button.grid(row=0, column=2, padx=5, pady=5)
        
        # Section : Console/Log
        log_frame = ttk.LabelFrame(main_frame, text="Console", padding="10")
        log_frame.grid(row=5, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        log_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(5, weight=1)
        
        self.log_text = tk.Text(log_frame, height=8, wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar.set)
    
    def log(self, message):
        """Ajoute un message dans la console"""
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.see(tk.END)

    def start_license_watchdog(self):
        """Démarre un thread qui revalide périodiquement la licence en ligne."""
        threading.Thread(target=self._license_watchdog_thread, daemon=True).start()

    def _license_watchdog_thread(self):
        """Thread périodique de revalidation (toutes les ~60 minutes)."""
        # Première attente courte pour laisser l'UI démarrer
        try:
            time.sleep(15)
        except Exception:
            pass
        while True:
            try:
                result = check_license_token_online()
                if not result.get('ok'):
                    # Notifier sur le thread UI
                    self.root.after(0, self._handle_license_invalid, result.get('message', 'Licence non valide'))
                    break
            except Exception:
                # Silencieux: rester en mode hors-ligne si le réseau échoue
                pass
            # Attendre ~60 minutes
            try:
                time.sleep(60 * 60)
            except Exception:
                break

    def _handle_license_invalid(self, message: str):
        try:
            self.log(f"⚠️ Licence invalide: {message}")
            messagebox.showerror("Licence", f"Votre licence n'est plus valide:\n{message}")
        except Exception:
            pass
        try:
            self.on_closing()
        except Exception:
            pass
    
    def check_dependencies_on_startup(self):
        """Vérifie les dépendances au démarrage"""
        threading.Thread(target=self._check_dependencies_thread, daemon=True).start()
    
    def _check_dependencies_thread(self):
        """Thread pour vérifier les dépendances"""
        results = check_all_dependencies()
        
        self.root.after(0, self._update_deps_status, results)
    
    def _update_deps_status(self, results):
        """Met à jour l'affichage du statut des dépendances"""
        status_parts = []
        
        if results['adb_installed']:
            status_parts.append("✅ ADB")
        else:
            status_parts.append("❌ ADB")
        
        if results['scrcpy_installed']:
            status_parts.append("✅ scrcpy")
        else:
            status_parts.append("❌ scrcpy")
        
        if results['python_modules_ok']:
            status_parts.append("✅ Python modules")
        else:
            status_parts.append("❌ Python modules")
        
        status = " | ".join(status_parts)
        self.deps_status_label.config(text=status)
    
    def check_dependencies(self):
        """Bouton pour vérifier les dépendances"""
        self.log("Vérification des dépendances...")
        threading.Thread(target=self._check_dependencies_thread, daemon=True).start()
    
    def refresh_devices(self):
        """Actualise la liste des appareils connectés"""
        try:
            devices = adb.device_list()
            
            if len(devices) == 0:
                self.device_label.config(text="Aucun appareil connecté")
                self.device_combo['values'] = []
                self.device_combo.set('')
                self.log("Aucun appareil Android détecté")
                self.connect_button.config(state='disabled')
            else:
                self.device_label.config(text=f"{len(devices)} appareil(s) connecté(s)")
                # Construire les noms des appareils de manière sûre
                device_names = []
                for d in devices:
                    try:
                        # Essayer d'obtenir le modèle
                        device_info = f"{d.serial}"
                        # Ajouter le modèle si disponible
                        if hasattr(d, 'model') and d.model:
                            device_info += f" ({d.model})"
                        else:
                            # Essayer d'obtenir le modèle via shell
                            try:
                                model = adb.device(serial=d.serial).shell2("getprop ro.product.model")
                                if model.strip():
                                    device_info += f" ({model.strip()})"
                            except:
                                pass
                        device_names.append(device_info)
                    except Exception as e:
                        # Fallback: utiliser juste le serial
                        device_names.append(d.serial)
                
                self.device_combo['values'] = device_names
                self.device_combo.set(device_names[0] if device_names else '')
                self.connect_button.config(state='normal')
                if device_names:
                    self.log(f"✅ {len(device_names)} appareil(s) détecté(s)")
                    for name in device_names:
                        self.log(f"   - {name}")
                
        except Exception as e:
            self.log(f"❌ Erreur lors de la détection des appareils: {e}")
            import traceback
            self.log(f"Détails: {traceback.format_exc()}")
    
    def connect_device(self):
        """Connecte l'appareil sélectionné"""
        selected = self.device_var.get()
        if not selected:
            messagebox.showwarning("Avertissement", "Veuillez sélectionner un appareil")
            return
        
        # Extraire le serial de la sélection
        serial = selected.split(' ')[0]
        
        try:
            self.log(f"Connexion à l'appareil: {serial}")
            
            # Obtenir l'appareil via adb
            self.device = adb.device(serial=serial)
            
            # Lancer scrcpy avec paramètres optimisés
            self.log("Lancement de scrcpy...")
            if self.scrcpy_launcher.start_scrcpy(serial=serial, max_fps=15, bitrate=8_000_000, max_width=1920):
                self.log("✅ scrcpy lancé avec succès (optimisé)")
            else:
                self.log("⚠️  Impossible de lancer scrcpy automatiquement")
            
            # Créer le client Android
            self.log("Création du client Android...")
            from core import Android
            self.android_client = Android(self.device, max_fps=5, bitrate=2_000_000)
            self.log("✅ Client Android créé")
            
            # Mettre à jour l'interface
            self.connect_button.config(state='disabled')
            self.disconnect_button.config(state='normal')
            self.back_button.config(state='normal')
            self.home_button.config(state='normal')
            self.switch_button.config(state='normal')
            
            self.log(f"✅ Connecté à {serial}")
            
        except Exception as e:
            self.log(f"❌ Erreur lors de la connexion: {e}")
            messagebox.showerror("Erreur", f"Impossible de se connecter à l'appareil:\n{e}")
    
    def disconnect_device(self):
        """Déconnecte l'appareil"""
        try:
            self.log("Déconnexion...")
            
            # Arrêter scrcpy
            self.scrcpy_launcher.stop_scrcpy()
            
            # Fermer le client Android
            if self.android_client:
                # Pas de méthode close explicite, le destructeur s'en occupe
                pass
            
            # Réinitialiser
            self.android_client = None
            self.device = None
            
            # Mettre à jour l'interface
            self.connect_button.config(state='normal')
            self.disconnect_button.config(state='disabled')
            self.back_button.config(state='disabled')
            self.home_button.config(state='disabled')
            self.switch_button.config(state='disabled')
            
            self.log("✅ Déconnecté")
            
        except Exception as e:
            self.log(f"❌ Erreur lors de la déconnexion: {e}")
    
    def action_back(self):
        """Action: bouton retour"""
        if self.android_client:
            try:
                self.android_client.back()
                self.log("⬅️ Retour")
            except Exception as e:
                self.log(f"❌ Erreur: {e}")
    
    def action_home(self):
        """Action: bouton accueil"""
        if self.android_client:
            try:
                # Utiliser la touche HOME
                if self.device:
                    self.device.shell("input keyevent KEYCODE_HOME")
                self.log("🏠 Accueil")
            except Exception as e:
                self.log(f"❌ Erreur: {e}")
    
    def action_switch(self):
        """Action: basculer entre applications"""
        if self.android_client:
            try:
                self.android_client.switch()
                self.log("🔄 Changement d'application")
            except Exception as e:
                self.log(f"❌ Erreur: {e}")
    
    def on_closing(self):
        """Fonction appelée à la fermeture de l'application"""
        if self.scrcpy_launcher.is_running:
            self.scrcpy_launcher.stop_scrcpy()
        self.root.destroy()


def main():
    """Fonction principale pour lancer l'application"""
    root = tk.Tk()
    app = AndroidControllerApp(root)
    
    # Gestionnaire de fermeture
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    root.mainloop()


if __name__ == '__main__':
    main()

