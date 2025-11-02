"""
Gestion multi-appareils pour exécuter des scripts en parallèle
"""
import threading
from typing import List, Dict, Callable
from adbutils import adb
from core import Android


class MultiDeviceManager:
    """Gère l'exécution de scripts sur plusieurs appareils simultanément"""
    
    def __init__(self):
        self.devices = {}
        self.running_scripts = {}
        self.results = {}
    
    def get_connected_devices(self):
        """Liste tous les appareils connectés"""
        try:
            return adb.device_list()
        except Exception as e:
            print(f"Erreur détection appareils: {e}")
            return []
    
    def setup_device(self, serial):
        """Configure un appareil pour le contrôle"""
        try:
            device = adb.device(serial=serial)
            android_client = Android(device, max_fps=5, bitrate=2_000_000)
            
            self.devices[serial] = {
                'device': device,
                'android_client': android_client,
                'thread': None,
                'status': 'ready'
            }
            
            return True
        except Exception as e:
            print(f"Erreur setup {serial}: {e}")
            return False
    
    def get_device_info(self, serial):
        """Récupère les infos d'un appareil"""
        device = self.devices.get(serial)
        if device:
            # Essayer d'obtenir le modèle
            try:
                model = device['device'].shell("getprop ro.product.model").strip()
            except:
                model = "Unknown"
            
            return {
                'serial': serial,
                'status': device['status'],
                'model': model,
            }
        return None
    
    def run_script_on_device(self, serial, script_function, open_viewer: bool = False, **kwargs):
        """Exécute un script sur un appareil spécifique"""
        device = self.devices.get(serial)
        
        if not device:
            return {'success': False, 'message': f'Appareil {serial} non configuré'}
        
        if device['status'] == 'running':
            return {'success': False, 'message': f'Appareil {serial} déjà occupé'}
        
        # Exécuter le script dans un thread
        def run_in_thread():
            device['status'] = 'running'
            try:
                print(f"[SCRIPT][START] serial={serial} func={getattr(script_function, '__name__', 'my_script')}")
                if open_viewer:
                    try:
                        # Tente d'ouvrir une vue scrcpy externe pour le suivi visuel
                        from core.scrcpy_launcher import ScrcpyLauncher  # lazy import
                        launcher = ScrcpyLauncher()
                        launcher.start_scrcpy(serial=serial, max_fps=15, bitrate=8_000_000)
                    except Exception as _e:
                        # Fallback silencieux si indisponible
                        pass
                result = script_function(device['android_client'], serial, **kwargs)
                self.results[serial] = result
                print(f"[SCRIPT][END] serial={serial} success={result.get('success', None)} msg={result.get('message', '')}")
            except Exception as e:
                self.results[serial] = {
                    'success': False,
                    'message': f'Erreur: {str(e)}',
                    'error': str(e)
                }
                import traceback as _tb
                _tb.print_exc()
            finally:
                device['status'] = 'ready'
        
        thread = threading.Thread(target=run_in_thread, daemon=True)
        thread.start()
        
        device['thread'] = thread
        device['status'] = 'running'
        
        return {'success': True, 'message': f'Script démarré sur {serial}'}
    
    def run_script_on_all_devices(self, script_function, **kwargs):
        """Exécute un script sur TOUS les appareils connectés en parallèle"""
        results = {}
        
        for serial in self.devices.keys():
            result = self.run_script_on_device(serial, script_function, **kwargs)
            results[serial] = result
        
        return results
    
    def get_results(self, serial):
        """Récupère les résultats pour un appareil"""
        return self.results.get(serial)
    
    def is_device_busy(self, serial):
        """Vérifie si un appareil est occupé"""
        device = self.devices.get(serial)
        return device and device['status'] == 'running'
    
    def stop_script(self, serial):
        """Arrête le script en cours sur un appareil"""
        device = self.devices.get(serial)
        if device and device['status'] == 'running':
            # Note: difficile d'arrêter proprement, on attend que le script finisse
            device['status'] = 'stopping'
            return True
        return False
    
    def cleanup_device(self, serial):
        """Nettoie les ressources d'un appareil"""
        device = self.devices.get(serial)
        if device:
            if device['status'] == 'running':
                device['status'] = 'stopping'
            
            # Attendre que le thread se termine
            if device['thread']:
                device['thread'].join(timeout=5)
            
            del self.devices[serial]
            if serial in self.results:
                del self.results[serial]
            
            return True
        return False
    
    def get_all_results(self):
        """Retourne tous les résultats de tous les appareils"""
        return self.results
    
    def get_status(self):
        """Retourne le statut de tous les appareils"""
        status = {}
        for serial, device in self.devices.items():
            # Essayer d'obtenir le modèle
            try:
                model = device['device'].shell("getprop ro.product.model").strip()
            except:
                model = "Unknown"
            
            status[serial] = {
                'status': device['status'],
                'model': model,
                'has_result': serial in self.results
            }
        return status


def load_custom_script(script_path):
    """
    Charge un script personnalisé depuis le dossier scripts/
    
    Args:
        script_path: Chemin relatif vers le script (ex: 'example_script.py')
    
    Returns:
        tuple: (function, info_dict) ou None
    """
    import importlib.util
    import sys
    from pathlib import Path
    
    script_file = Path('scripts') / script_path
    
    if not script_file.exists():
        return None
    
    # Charger le module
    spec = importlib.util.spec_from_file_location("custom_script", script_file)
    module = importlib.util.module_from_spec(spec)
    sys.modules["custom_script"] = module
    spec.loader.exec_module(module)
    
    # Vérifier qu'il y a une fonction my_script
    if hasattr(module, 'my_script') and hasattr(module, 'SCRIPT_INFO'):
        return (module.my_script, module.SCRIPT_INFO)
    
    return None

