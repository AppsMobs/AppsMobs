"""
Interface graphique pour le multi-appareils et scripts personnalisés
"""
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import threading
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.multi_device_manager import MultiDeviceManager, load_custom_script
from adbutils import adb


class MultiDeviceApp:
    """Interface pour gérer plusieurs appareils et scripts"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("BootyBot - Multi-Appareils & Scripts")
        self.root.geometry("900x700")
        
        self.manager = MultiDeviceManager()
        self.loaded_scripts = {}
        
        self.setup_ui()
        self.refresh_devices()
        self.load_scripts()
    
    def setup_ui(self):
        """Configure l'interface"""
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        
        # Titre
        title = ttk.Label(
            main_frame,
            text="🎮 BootyBot - Multi-Appareils",
            font=('Arial', 16, 'bold')
        )
        title.grid(row=0, column=0, columnspan=2, pady=10)
        
        # Style pour le bouton action
        style = ttk.Style()
        style.configure('Action.TButton', font=('Arial', 10, 'bold'))
        
        # Section: Appareils connectés
        devices_frame = ttk.LabelFrame(main_frame, text="📱 Appareils Connectés", padding="10")
        devices_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        devices_frame.columnconfigure(0, weight=1)
        
        # Liste des appareils
        self.devices_listbox = tk.Listbox(devices_frame, height=6, selectmode=tk.MULTIPLE)
        self.devices_listbox.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # Boutons appareils
        devices_buttons = ttk.Frame(devices_frame)
        devices_buttons.pack()
        
        ttk.Button(devices_buttons, text="🔄 Actualiser", command=self.refresh_devices).pack(side=tk.LEFT, padx=2)
        ttk.Button(devices_buttons, text="✅ Configurer sélectionnés", command=self.setup_selected).pack(side=tk.LEFT, padx=2)
        ttk.Button(devices_buttons, text="📱 Ouvrir scrcpy", command=self.open_scrcpy_selected).pack(side=tk.LEFT, padx=2)
        ttk.Button(devices_buttons, text="📊 Statut", command=self.show_status).pack(side=tk.LEFT, padx=2)
        
        # Section: Scripts personnalisés
        scripts_frame = ttk.LabelFrame(main_frame, text="📜 Scripts Personnalisés", padding="10")
        scripts_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        scripts_frame.columnconfigure(0, weight=1)
        
        self.scripts_combo = ttk.Combobox(scripts_frame, state='readonly')
        self.scripts_combo.pack(fill=tk.X, pady=5)
        
        self.script_info_label = ttk.Label(scripts_frame, text="", wraplength=500)
        self.script_info_label.pack(pady=5)
        
        # Boutons scripts
        scripts_buttons = ttk.Frame(scripts_frame)
        scripts_buttons.pack()
        
        ttk.Button(scripts_buttons, text="🔄 Recharger scripts", command=self.load_scripts).pack(side=tk.LEFT, padx=2)
        ttk.Button(scripts_buttons, text="➕ Charger script", command=self.load_custom_script).pack(side=tk.LEFT, padx=2)
        
        # Section: Actions
        actions_frame = ttk.LabelFrame(main_frame, text="⚡ Actions", padding="10")
        actions_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        action_buttons = ttk.Frame(actions_frame)
        action_buttons.pack()
        
        ttk.Button(
            action_buttons,
            text="🎬 Script sur sélectionnés",
            command=self.run_script_selected
        ).pack(side=tk.LEFT, padx=2)
        
        ttk.Button(
            action_buttons,
            text="🌐 Lancer sur TOUS",
            command=self.run_on_all
        ).pack(side=tk.LEFT, padx=2)
        
        ttk.Button(
            action_buttons,
            text="🛑 Arrêter tout",
            command=self.stop_all
        ).pack(side=tk.LEFT, padx=2)
        
        # Console
        log_frame = ttk.LabelFrame(main_frame, text="📝 Console", padding="10")
        log_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        main_frame.rowconfigure(4, weight=1)
        
        self.log_text = tk.Text(log_frame, height=10, wrap=tk.WORD)
        scrollbar = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_text.yview)
        self.log_text.config(yscrollcommand=scrollbar.set)
        
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    
    def log(self, message):
        """Ajoute un message dans la console"""
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.see(tk.END)
    
    def refresh_devices(self):
        """Actualise la liste des appareils"""
        self.log("Actualisation des appareils...")
        self.devices_listbox.delete(0, tk.END)
        
        devices = self.manager.get_connected_devices()
        
        for device in devices:
            try:
                serial = device.serial
                
                # Essayer d'obtenir le modèle via shell
                try:
                    model_output = device.shell("getprop ro.product.model")
                    model = model_output.strip() if model_output.strip() else "Unknown"
                except:
                    model = "Unknown"
                
                status = "✅ Configuré" if serial in self.manager.devices else "⚠️ Non configuré"
                
                self.devices_listbox.insert(tk.END, f"{serial} ({model}) - {status}")
                
            except Exception as e:
                self.log(f"Erreur appareil: {e}")
        
        self.log(f"✅ {len(devices)} appareil(s) connecté(s)")
    
    def setup_selected(self):
        """Configure les appareils sélectionnés"""
        selected = self.devices_listbox.curselection()
        
        if not selected:
            messagebox.showwarning("Avertissement", "Sélectionnez au moins un appareil")
            return
        
        devices_list = self.manager.get_connected_devices()
        
        for idx in selected:
            device = devices_list[idx]
            self.log(f"Configuration de {device.serial}...")
            
            if self.manager.setup_device(device.serial):
                self.log(f"✅ {device.serial} configuré")
            else:
                self.log(f"❌ Erreur configuration {device.serial}")
        
        self.refresh_devices()
    
    def load_scripts(self):
        """Charge les scripts depuis le dossier scripts/"""
        import importlib.util
        import sys
        
        scripts_dir = Path('scripts')
        self.loaded_scripts = {}
        
        if not scripts_dir.exists():
            scripts_dir.mkdir()
            self.log("⚠️ Dossier scripts/ créé (vide)")
            return
        
        for script_file in scripts_dir.glob('*.py'):
            if script_file.name == '__init__.py':
                continue
            
            try:
                result = load_custom_script(script_file.name)
                if result:
                    script_func, script_info = result
                    self.loaded_scripts[script_file.name] = {
                        'function': script_func,
                        'info': script_info
                    }
                    self.log(f"✅ Script chargé: {script_info['name']}")
            except Exception as e:
                self.log(f"❌ Erreur chargement {script_file.name}: {e}")
        
        # Mettre à jour la combobox
        script_names = [f"{info['info']['name']} ({name})" 
                       for name, info in self.loaded_scripts.items()]
        self.scripts_combo['values'] = script_names
        
        if script_names:
            self.scripts_combo.set(script_names[0])
            self.update_script_info()
    
    def update_script_info(self):
        """Met à jour l'info du script sélectionné"""
        selected = self.scripts_combo.current()
        if selected >= 0:
            scripts = list(self.loaded_scripts.items())
            if selected < len(scripts):
                name, info = scripts[selected]
                info_text = f"{info['info']['description']} | Version: {info['info']['version']}"
                self.script_info_label.config(text=info_text)
    
    def load_custom_script(self):
        """Charge un script depuis un fichier"""
        file_path = filedialog.askopenfilename(
            title="Charger un script",
            filetypes=[("Python files", "*.py")]
        )
        
        if file_path:
            # Copier vers scripts/ et recharger
            import shutil
            target = Path('scripts') / Path(file_path).name
            shutil.copy(file_path, target)
            self.log(f"✅ Script copié: {target}")
            self.load_scripts()
    
    def get_selected_devices(self):
        """Retourne les serials des appareils sélectionnés et configurés"""
        selected = self.devices_listbox.curselection()
        devices_list = self.manager.get_connected_devices()
        
        selected_serials = []
        for idx in selected:
            serial = devices_list[idx].serial
            if serial in self.manager.devices:
                selected_serials.append(serial)
        
        return selected_serials
    
    def get_selected_indices_from_list(self):
        """Retourne les indices sélectionnés dans la liste"""
        return self.devices_listbox.curselection()
    
    def open_scrcpy_selected(self):
        """Ouvre scrcpy sur les appareils sélectionnés"""
        import subprocess
        import sys
        
        selected_indices = self.get_selected_indices_from_list()
        devices_list = self.manager.get_connected_devices()
        
        if not selected_indices:
            messagebox.showwarning("Avertissement", "Sélectionnez au moins un appareil")
            return
        
        for idx in selected_indices:
            device = devices_list[idx]
            serial = device.serial
            
            self.log(f"📱 Ouverture scrcpy pour {serial}...")
            
            # Chercher scrcpy
            import shutil
            scrcpy_path = shutil.which('scrcpy')
            
            if not scrcpy_path:
                self.log(f"❌ scrcpy non trouvé pour {serial}")
                continue
            
            try:
                # Lancer scrcpy avec paramètres optimisés pour performance
                cmd = [
                    scrcpy_path,
                    '-s', serial,
                    '--max-fps', '15',  # Plus fluide (au lieu de 5)
                    '--video-bit-rate', '8M',  # Meilleure qualité
                    '--max-size', '1920'  # Résolution max
                ]
                
                if sys.platform == 'win32':
                    # Lance avec fenêtre visible (CREATE_NO_WINDOW retiré)
                    subprocess.Popen(cmd)
                else:
                    subprocess.Popen(cmd)
                
                self.log(f"✅ scrcpy ouvert pour {serial}")
                
            except Exception as e:
                self.log(f"❌ Erreur ouverture scrcpy: {e}")
    
    def run_script_selected(self):
        """Lance le script sur les appareils sélectionnés dans la liste"""
        selected_indices = self.get_selected_indices_from_list()
        devices_list = self.manager.get_connected_devices()
        
        if not selected_indices:
            messagebox.showwarning("Avertissement", "Sélectionnez des appareils dans la liste")
            return
        
        # Vérifier qu'un script est sélectionné
        script_idx = self.scripts_combo.current()
        if script_idx < 0:
            messagebox.showwarning("Avertissement", "Sélectionnez un script")
            return
        
        scripts = list(self.loaded_scripts.values())
        script_info = scripts[script_idx]
        
        self.log(f"🚀 Lancement du script sur {len(selected_indices)} appareil(s)...")
        
        # Configurer les appareils si pas déjà fait
        for idx in selected_indices:
            device = devices_list[idx]
            serial = device.serial
            
            # Configurer si pas déjà fait
            if serial not in self.manager.devices:
                self.log(f"Configuration de {serial}...")
                if self.manager.setup_device(serial):
                    self.log(f"✅ {serial} configuré")
                else:
                    self.log(f"❌ Erreur configuration {serial}")
                    continue
            
            # Lancer le script
            self.manager.run_script_on_device(serial, script_info['function'])
            self.log(f"✅ Script démarré sur {serial}")
        
        self.refresh_devices()
    
    def run_on_all(self):
        """Lance le script sur TOUS les appareils"""
        if not self.manager.devices:
            messagebox.showwarning("Avertissement", "Configurez des appareils d'abord")
            return
        
        script_idx = self.scripts_combo.current()
        if script_idx < 0:
            messagebox.showwarning("Avertissement", "Sélectionnez un script")
            return
        
        scripts = list(self.loaded_scripts.values())
        script_info = scripts[script_idx]
        
        self.log(f"🌐 Lancement sur TOUS les appareils ({len(self.manager.devices)})...")
        
        results = self.manager.run_script_on_all_devices(script_info['function'])
        
        for serial, result in results.items():
            status = "✅" if result['success'] else "❌"
            self.log(f"{status} {serial}: {result['message']}")
    
    def stop_all(self):
        """Arrête tous les scripts"""
        self.log("🛑 Arrêt de tous les scripts...")
        for serial in self.manager.devices.keys():
            self.manager.stop_script(serial)
        self.log("✅ Arrêt demandé")
    
    def show_status(self):
        """Affiche le statut de tous les appareils"""
        status = self.manager.get_status()
        
        status_text = "\n📊 STATUT DES APPAREILS:\n\n"
        for serial, info in status.items():
            status_text += f"📱 {serial}:\n"
            status_text += f"   Statut: {info['status']}\n"
            status_text += f"   Modèle: {info['model']}\n"
            if info['has_result']:
                result = self.manager.get_results(serial)
                status_text += f"   Résultat: {result.get('message', 'N/A')}\n"
            status_text += "\n"
        
        messagebox.showinfo("Statut", status_text)


def main():
    """Fonction principale"""
    root = tk.Tk()
    app = MultiDeviceApp(root)
    root.mainloop()


if __name__ == '__main__':
    main()

