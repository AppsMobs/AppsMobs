"""
Gestion du lancement et de l'arrêt de scrcpy
Supporte scrcpy système ET bundlé
"""
import subprocess
import time
import sys
import os
from pathlib import Path
from typing import Optional


class ScrcpyLauncher:
    """Classe pour gérer le processus scrcpy avec support bundlé"""
    
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.is_running = False
        self.scrcpy_path = self._find_scrcpy()
    
    def _find_scrcpy(self) -> str:
        """
        Trouve scrcpy - d'abord bundlé, puis système
        """
        # 1. Vérifier si on est dans un exe PyInstaller
        if getattr(sys, 'frozen', False):
            # On est dans un exe PyInstaller
            base_path = Path(sys._MEIPASS)
            
            # Chercher scrcpy bundlé
            bundled_scrcpy = base_path / "scrcpy.exe"
            if bundled_scrcpy.exists():
                print(f"[OK] scrcpy bundlé trouvé: {bundled_scrcpy}")
                return str(bundled_scrcpy)
            
            # Chercher dans le dossier de l'exe
            exe_dir = Path(sys.executable).parent
            bundled_scrcpy2 = exe_dir / "scrcpy.exe"
            if bundled_scrcpy2.exists():
                print(f"[OK] scrcpy bundlé trouvé: {bundled_scrcpy2}")
                return str(bundled_scrcpy2)
        
        # 2. Chercher scrcpy système
        import shutil
        scrcpy_system = shutil.which('scrcpy')
        if scrcpy_system:
            print(f"[OK] scrcpy système trouvé: {scrcpy_system}")
            return scrcpy_system
        
        # 3. Windows .exe
        if sys.platform == 'win32':
            candidates = ['scrcpy.exe', 'scrcpy']
            for candidate in candidates:
                if shutil.which(candidate):
                    print(f"[OK] scrcpy trouvé: {candidate}")
                    return candidate
        
        # 4. Échec
        print("[ERROR] scrcpy non trouvé")
        return "scrcpy"
    
    def start_scrcpy(self, 
                     serial: Optional[str] = None,
                     max_fps: int = 15,  # Augmenté pour meilleure fluidité
                     bitrate: int = 2_000_000,  # Bitrate vidéo 2M
                     max_width: Optional[int] = 1920,  # Résolution max
                     turn_screen_off: bool = True,
                     stay_awake: bool = True,
                     **kwargs) -> bool:
        """
        Lance scrcpy avec les paramètres spécifiés
        
        Args:
            serial: Numéro de série du périphérique (optionnel)
            max_fps: Images par seconde maximum
            bitrate: Débit binaire en bits/seconde
            max_width: Largeur max de l'écran
            turn_screen_off: Désactiver l'écran du téléphone
            stay_awake: Garder l'écran allumé via USB
            
        Returns:
            True si le lancement a réussi, False sinon
        """
        if self.is_running:
            print("  scrcpy est déjà en cours d'exécution")
            return False
        
        # Construction de la commande
        cmd = [self.scrcpy_path]
        
        if serial:
            cmd.extend(['-s', serial])
        
        cmd.extend(['--max-fps', str(max_fps)])
        cmd.extend(['--video-bit-rate', str(bitrate)])
        
        if max_width:
            cmd.extend(['--max-size', str(max_width)])
        
        if turn_screen_off:
            cmd.append('--turn-screen-off')
        
        if stay_awake:
            cmd.append('--stay-awake')
        
        # Ajout d'options supplémentaires via kwargs
        for key, value in kwargs.items():
            if value is True:
                cmd.append(f'--{key.replace("_", "-")}')
            elif value is False:
                pass  # Ne pas ajouter l'option
            else:
                cmd.extend([f'--{key.replace("_", "-")}', str(value)])
        
        try:
            print(f"[LAUNCH] Lancement de scrcpy: {' '.join(cmd)}")
            
            # Lancement en arrière-plan sans fenêtre de console (Windows)
            spawn_kwargs = {
                'stdout': subprocess.PIPE,
                'stderr': subprocess.PIPE,
                'shell': False  # Important: éviter shell=True qui ouvre des CMD
            }
            
            if sys.platform == 'win32':
                spawn_kwargs['creationflags'] = subprocess.CREATE_NO_WINDOW
            
            self.process = subprocess.Popen(cmd, **spawn_kwargs)
            
            # Attendre un peu pour voir si le processus démarre correctement
            time.sleep(1)
            
            if self.process.poll() is None:
                self.is_running = True
                print("[SUCCESS] scrcpy lancé avec succès")
                return True
            else:
                # Le processus s'est terminé immédiatement (erreur)
                stdout, stderr = self.process.communicate()
                print(f"[ERROR] Erreur au lancement de scrcpy:")
                print(stderr.decode('utf-8', errors='ignore'))
                self.is_running = False
                return False
                
        except FileNotFoundError:
            print("[ERROR] Erreur: scrcpy n'est pas installé ou non trouvé dans PATH")
            print(f"   Chemin recherché: {self.scrcpy_path}")
            print("   Installez scrcpy depuis: https://github.com/Genymobile/scrcpy/releases")
            return False
        except Exception as e:
            print(f"[ERROR] Erreur au lancement de scrcpy: {e}")
            self.is_running = False
            return False
    
    def stop_scrcpy(self) -> bool:
        """
        Arrête le processus scrcpy
        
        Returns:
            True si l'arrêt a réussi, False sinon
        """
        if not self.is_running or self.process is None:
            print("  scrcpy n'est pas en cours d'exécution")
            return False
        
        try:
            print(" Arrêt de scrcpy...")
            self.process.terminate()
            
            # Attendre jusqu'à 5 secondes
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                # Forcer l'arrêt si nécessaire
                print("  Arrêt forcé de scrcpy...")
                self.process.kill()
                self.process.wait()
            
            self.is_running = False
            self.process = None
            print(" scrcpy arrêté avec succès")
            return True
            
        except Exception as e:
            print(f" Erreur à l'arrêt de scrcpy: {e}")
            return False
    
    def restart_scrcpy(self, **kwargs) -> bool:
        """
        Redémarre scrcpy avec les mêmes paramètres
        
        Returns:
            True si le redémarrage a réussi, False sinon
        """
        print(" Redémarrage de scrcpy...")
        self.stop_scrcpy()
        time.sleep(0.5)
        return self.start_scrcpy(**kwargs)
    
    def __del__(self):
        """Destructeur - nettoie le processus"""
        if self.is_running and self.process:
            self.stop_scrcpy()


def test_launcher():
    """Test basique du launcher"""
    launcher = ScrcpyLauncher()
    
    print("Test du launcher scrcpy")
    print("-" * 50)
    print(f"scrcpy détecté: {launcher.scrcpy_path}")
    print()
    
    # Test de lancement (nécessite un appareil connecté)
    success = launcher.start_scrcpy(max_fps=5, bitrate=2_000_000)
    
    if success:
        print("\nAppuyez sur Entrée pour arrêter scrcpy...")
        input()
        launcher.stop_scrcpy()
    else:
        print("Impossible de lancer scrcpy (aucun appareil connecté ou scrcpy non installé)")


if __name__ == '__main__':
    test_launcher()
