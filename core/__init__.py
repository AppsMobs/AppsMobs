# import scrcpy  
import sys as _sys
import subprocess as _subprocess

def _ensure_scrcpy_module():
    """
    Essaie d'importer scrcpy et le retourne si disponible.
    Retourne le module scrcpy ou None.
    """
    try:
        import scrcpy  # type: ignore
        return scrcpy, 'scrcpy'
    except ImportError:
        # scrcpy-client package installs as 'scrcpy' module, not 'scrcpy_client'
        # So if direct import fails, try installing scrcpy-client
        # Try to install 0.4.7, then fallback to 0.4.1
        # IMPORTANT: Use --no-deps to avoid trying to install av 9.x
        for ver in ('0.4.7', '0.4.1'):
            try:
                if not _sys.modules.get(f'_scrcpy_autoinstall_attempted_{ver}'):
                    _sys.modules[f'_scrcpy_autoinstall_attempted_{ver}'] = True
                    _subprocess.run([
                        _sys.executable, '-m', 'pip', 'install', '--disable-pip-version-check', '--no-input',
                        '--no-deps',  # Critical: don't try to install dependencies (av 9.x)
                        f'scrcpy-client=={ver}'
                    ], check=False)
                    # Try to import after installation (scrcpy-client installs as 'scrcpy' module)
                    try:
                        import scrcpy  # type: ignore
                        return scrcpy, 'scrcpy-client'
                    except ImportError:
                        continue
            except Exception:
                continue
        return None, None

# Importer scrcpy globalement
_scrcpy_module, _kind = _ensure_scrcpy_module()
HAS_SCRCPY = _scrcpy_module is not None

if HAS_SCRCPY:
    scrcpy = _scrcpy_module  # scrcpy est maintenant disponible globalement
else:
    print("WARNING: Module scrcpy non disponible. Veuillez installer scrcpy-client (0.4.7 ou 0.4.1).")
    scrcpy = None  # Définir scrcpy à None pour éviter NameError

from adbutils import adb
import cv2
import numpy as np
import time
import subprocess
import os
import pytesseract


# ============================================================================
# FONCTION DE LOGGING CENTRALISÉE
# ============================================================================

def log(device_serial, message, level="INFO"):
    """
    Fonction de logging centralisée avec flush automatique
    
    Args:
        device_serial: Numéro de série du device
        message: Message à afficher
        level: Niveau de log (INFO, ERROR, WARNING, DEBUG)
    
    Usage:
        log("R58M67Q75DW", "Début du script", "INFO")
        log("R58M67Q75DW", "Erreur détectée", "ERROR")
    """
    timestamp = time.strftime("%H:%M:%S")
    # Format simple sans répétition
    print(f"[{timestamp}] [{level}] [{device_serial}] {message}", flush=True)


def log_step(device_serial, step_num, action):
    """
    Fonction spécialisée pour les étapes de script
    
    Args:
        device_serial: Numéro de série du device
        step_num: Numéro de l'étape
        action: Description de l'action
    
    Usage:
        log_step("R58M67Q75DW", 1, "Clic (500,800)")
        log_step("R58M67Q75DW", 2, "Recherche image 'button.png'")
    """
    log(device_serial, f"[STEP {step_num}] {action}")


def log_bridge(message):
    """
    Fonction pour les logs du bridge Electron
    
    Args:
        message: Message à afficher
    
    Usage:
        log_bridge("Initialisation client Android pour R58M67Q75DW")
    """
    timestamp = time.strftime("%H:%M:%S")
    print(f"[{timestamp}] [bridge] {message}", flush=True)


# ============================================================================
# BRIDGE WRAPPER - Compatibilité avec le bridge Electron
# ============================================================================

def create_android_client(serial):
    """
    Crée un client Android pour un appareil donné
    
    Args:
        serial: Numéro de série de l'appareil
        
    Returns:
        Android: Instance Android connectée à l'appareil ou None si échec
    """
    log_bridge(f"Recherche de l'appareil {serial}...")
    
    # Obtenir le device par son serial
    devices = adb.device_list()
    device = None
    for d in devices:
        if d.serial == serial:
            device = d
            break
    
    if not device:
        log_bridge(f"ERREUR: Appareil {serial} introuvable")
        return None
    
    log_bridge(f"Appareil trouvé: {serial}")
    
    # Créer l'instance Android
    android_client = Android(device)
    # Enforce scrcpy requirement
    if not android_client.has_scrcpy:
        log_bridge("ERREUR: scrcpy est requis pour la capture et la vision. Veuillez installer/activer scrcpy.")
        return None
    log_bridge(f"Client Android connecté")
    
    return android_client


def run_with_bridge(script_function, serial):
    """
    Wrapper pour exécuter un script avec le bridge Electron
    
    Args:
        script_function: Fonction du script à exécuter
        serial: Numéro de série de l'appareil
        
    Returns:
        int: Code de retour (0 pour succès, 1 pour erreur)
    """
    try:
        # Créer le client Android
        android_client = create_android_client(serial)
        if not android_client:
            return 1
        
        log_bridge(f"Démarrage de l'exécution du script...")

        # Injection automatique des fonctions core.android_functions
        try:
            from . import android_functions as _af
            injected = {}
            for name, obj in _af.__dict__.items():
                if name.startswith('_'):
                    continue
                if callable(obj):
                    injected[name] = obj
            # injecte dans le namespace global du script
            script_function.__globals__.update(injected)
            # Expose variables globales pratiques
            script_function.__globals__['android_client'] = android_client
            # Alias pour compatibilité des anciennes fonctions Find* qui utilisent android_device
            script_function.__globals__['android_device'] = android_client
            script_function.__globals__['serial'] = serial
            # Crée des versions liées (sans android_client explicite)
            def _bind_client(f):
                return (lambda *a, **k: f(android_client, *a, **k))
            to_bind = [
                'click','doubleclick','swipe','write','back','home','entre','switch',
                'enter','switch_app','upswipe','downswipe','leftswipe','rightswipe',
                'swipe_up','swipe_down','swipe_left','swipe_right',
                'find','find_image_bool','find_images_list','find_all',
                'find_image_and_click','find_loop','find_and_click_loop','find_and_click_loop_with_sound',
                'wait_for_image','click_until_image_appears',
                'long_press','long_press_image',
                'toggle_airplane_mode','clear_cache','restart_app','screenshot'
            ]
            for name in to_bind:
                f = script_function.__globals__.get(name)
                if callable(f):
                    bound = _bind_client(f)
                    script_function.__globals__[name] = bound
                    # Patch le module core.android_functions pour que ses appels internes utilisent la version liée
                    try:
                        if hasattr(_af, name):
                            setattr(_af, name, bound)
                    except Exception:
                        pass
            # Définir aussi l'alias android_device dans le module core.android_functions
            try:
                setattr(_af, 'android_device', android_client)
            except Exception:
                pass
            log_bridge(f"Fonctions core injectées: {len(injected)}")

            # Définir un répertoire d'images par défaut pour le script: <script_dir>/img
            try:
                script_dir = os.path.dirname(script_function.__code__.co_filename)
                img_dir = os.path.join(script_dir, 'img')
                script_function.__globals__['IMG_DIR'] = img_dir
                try:
                    # Expose un répertoire images par défaut au client Android
                    setattr(android_client, 'default_img_dir', img_dir)
                except Exception:
                    pass

                # Wrapper: si find_image est appelée avec un chemin relatif, préfixer par IMG_DIR
                orig_find = script_function.__globals__.get('find_image')
                if callable(orig_find):
                    def _find_image_with_default(android_client, image_path, *args, **kwargs):
                        if isinstance(image_path, str) and not os.path.isabs(image_path):
                            image_path = os.path.join(img_dir, image_path)
                        return orig_find(android_client, image_path, *args, **kwargs)
                    script_function.__globals__['find_image'] = _find_image_with_default
            except Exception as _img_err:
                log_bridge(f"IMG_DIR wrapper ignoré: {_img_err}")
        except Exception as _inj_err:
            log_bridge(f"Injection des fonctions ignorée: {_inj_err}")
        
        # Exécuter le script
        result = script_function(android_client, serial)
        
        # Vérifier le résultat
        if result and isinstance(result, dict) and result.get('success'):
            log_bridge(f"Script terminé avec succès")
            return 0
        else:
            message = result.get('message', 'Erreur inconnue') if result else 'Pas de résultat'
            log_bridge(f"Script échoué: {message}")
            return 1
            
    except Exception as e:
        log_bridge(f"Erreur lors de l'exécution: {e}")
        import traceback
        traceback.print_exc()
        return 1


def run_simple_script(script_function, serial):
    """
    Wrapper simple pour scripts qui retournent juste un booléen
    
    Args:
        script_function: Fonction du script à exécuter
        serial: Numéro de série de l'appareil
        
    Returns:
        int: Code de retour (0 pour succès, 1 pour erreur)
    """
    try:
        # Créer le client Android
        android_client = create_android_client(serial)
        if not android_client:
            return 1
        
        log_bridge(f"Démarrage de l'exécution du script...")
        
        # Exécuter le script
        success = script_function(android_client, serial)
        
        if success:
            log_bridge(f"Script terminé avec succès")
            return 0
        else:
            log_bridge(f"Script échoué")
            return 1
            
    except Exception as e:
        log_bridge(f"Erreur lors de l'exécution: {e}")
        import traceback
        traceback.print_exc()
        return 1




class Android:
    # def __init__(self, device, max_width=800, bitrate=1_000_000, max_fps=5):
    def __init__(self, device, max_fps=5,bitrate=2_000_000):
        self.last_frame = None
        self.device = device
        self.has_scrcpy = HAS_SCRCPY

        # Configure Scrcpy client with reduced CPU usage (si disponible)
        if HAS_SCRCPY and scrcpy is not None:
            try:
                self.client = scrcpy.Client(
                    self.device,
                    # max_width=max_width,  # Limite la largeur d'image
                    bitrate=bitrate,  # Réduit le débit binaire
                    max_fps=max_fps   # Limite les images par seconde
                )
                self.client.add_listener(scrcpy.EVENT_FRAME, self.on_frame)
                self.client.start(threaded=True)
            except Exception as e:
                print(f"WARNING: Erreur scrcpy: {e}")
                self.has_scrcpy = False
        else:
            self.client = None
            self.has_scrcpy = False

    def on_frame(self,frame):
        if frame is not None:
            # Save the frame to the last_frame variable
            self.last_frame = frame


    def get_last_frame(self):
        """Capture une image via scrcpy ou screenshot ADB"""
        if self.has_scrcpy and self.client:
            # Méthode scrcpy
            while True:
                if self.last_frame is not None:
                    return self.last_frame
                time.sleep(0.2)
        else:
            # Méthode alternative: screenshot ADB
            return self._adb_screenshot()
    
    def _adb_screenshot(self):
        """Capture d'écran via ADB si scrcpy n'est pas disponible"""
        try:
            # Méthode fiable: exec-out renvoie des octets PNG
            serial = getattr(self.device, 'serial', None)
            cmd = ['adb']
            if serial:
                cmd += ['-s', serial]
            cmd += ['exec-out', 'screencap', '-p']
            proc = subprocess.run(cmd, capture_output=True)
            if proc.returncode != 0 or not proc.stdout:
                # Fallback via shell (moins fiable)
                data = self.device.shell("screencap -p")
                if isinstance(data, bytes):
                    png_bytes = data
                else:
                    png_bytes = data.replace('\r\n', '\n').encode('latin1', errors='ignore')
            else:
                png_bytes = proc.stdout
            arr = np.frombuffer(png_bytes, dtype=np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            print(f"WARNING:  Screenshot ADB failed: {e}")
            return None

    def save_last_frame(self):
        while True:
            if self.last_frame is not None:
                # time.sleep(0.1)
                # Return the last captured frame
                cv2.imwrite('last_frame.png', self.last_frame)
                return
            time.sleep(0.2)

    def write(self,text):
        if self.has_scrcpy and self.client:
            self.client.control.text(text)
        else:
            # Méthode alternative: input text via ADB
            self.device.shell2(f"input text {text.replace(' ', '%s')}")

    def resolution_density(self,width=1014,height=1794,density=170):
        if width is not None and height is not None:
            self.device.shell2(f"wm size {width}x{height}")
        if density is not None:
            self.device.shell2(f"wm density {density}")

    def accouplement_resolution_density(self):
            self.device.shell2("wm size 1100x1250")
            self.device.shell2("wm density 170")

    def resolution_density_reset(self):
        self.device.shell2(f"wm size reset")
        self.device.shell2(f"wm density reset")


    def expand_notification_panel(self):
        if self.has_scrcpy and self.client:
            self.client.control.expand_notification_panel()
        else:
            # Alternative ADB
            self.device.shell("service call statusbar 1")

    def collapse_panels(self):
        if self.has_scrcpy and self.client:
            self.client.control.collapse_panels()
        else:
            # Alternative ADB
            self.back()

    def click(self,x,y):
        if self.has_scrcpy and self.client:
            self.client.control.touch(x,y,0)
            self.client.control.touch(x,y,1)
        else:
            # Méthode alternative: tap via ADB
            self.device.shell2(f"input tap {x} {y}")

    def doubleclick(self,x,y):
        self.click(x,y)
        self.click(x,y)


    def screen_off(self):
        self.device.shell("svc power stayon usb")

    def block_untrusted_touches(self,val=0):
        self.device.shell(f"settings put global block_untrusted_touches {val}")

    def block_untrusted_touches(self,packageName="com.ankama.dofustouch"):
        self.device.shell(f"am compat disable BLOCK_UNTRUSTED_TOUCHES {packageName}")

    def size(self):
        return self.device.window_size()

    def swipe(self,Fromx,Fromy,Tox,Toy,deley=700):
        #self.client.control.swipe(Fromx,Fromy,Tox,Toy,move_step_length=5,move_steps_delay=.002)
        #self.device.swipe(Fromx,Fromy,Tox,Toy,2)
        self.device.shell2(f"input swipe {Fromx} {Fromy} {Tox} {Toy} {deley}")

    def clearlog(self):
        self.device.shell2("logcat -c")

    def back(self):
        self.device.shell("input keyevent KEYCODE_BACK")

    def entre(self):
        self.device.shell("input keyevent KEYCODE_ENTER")

    def switch(self):
        self.device.shell("input keyevent KEYCODE_APP_SWITCH")

    def shell(self,text):
        self.device.shell2(text)

    # def screen_off(self):
    #     self.device.shell2('input keyevent KEYCODE_BRIGHTNESS_DOWN')KEYCODE_POWER
    def screen_off(self):
        # Définir la commande à exécuter avec l'option --turn-screen-off
        self.device.shell2('input keyevent KEYCODE_O')

    def airplane_on(self):
        self.device.shell2("cmd connectivity airplane-mode enable")

    def airplane_off(self):
        self.device.shell2("cmd connectivity airplane-mode disable")

    def wifi_on(self):
        self.device.shell2("svc wifi enable")

    def wifi_off(self):
        self.device.shell2("svc wifi disable")

    def mobile_data_on(self):
        self.device.shell2("svc data enable")

    def mobile_data_off(self):
        self.device.shell2("adb shell svc data disable")

    def clear_cache(self,packageName="com.ankama.dofustouch"):
        self.device.shell(f"pm clear {packageName}")
    def clear_chrome_cache(self, package_name="com.android.chrome"):
        # Vider le cache de Chrome
        self.device.shell2(f"pm clear {package_name}")
    def restart(self,packageName="com.ankama.dofustouch"):
        self.device.shell2("input keyevent 3")
        self.device.shell2(f"pm trim-caches 999G")
        self.device.shell2(f"am start -n {packageName}/{packageName}.MainActivity")

    def refresh(self,packageName="com.ankama.dofustouch"):
        self.device.shell2("input keyevent 3")
        time.sleep(0.5)
        self.device.shell2(f"am start -n {packageName}/{packageName}.MainActivity")
    
    def extract_number_from_text(text):
        """Extrait un nombre du texte"""
        import re
        match = re.search(r"\d+", text)
        if match:
            return int(match.group())
        return 0
    
    def extract_price_from_image(client, region):
        """Extrait le prix d'un parchemin à partir de l'image"""
        screenshot = client.get_last_frame()
        x, y, w, h = region
        region_image = screenshot[y:y+h, x:x+w]
        gray_region_image = cv2.cvtColor(region_image, cv2.COLOR_BGR2GRAY)
        _, threshold_region_image = cv2.threshold(gray_region_image, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        extracted_text = pytesseract.image_to_string(threshold_region_image)
        return extract_number_from_text(extracted_text)
        # Extraction du prix depuis le texte
    


    # def locate_center_on_screen(self,image_path, confidence=0.8,region=None):
    #     try:
    #         # Load the image to locate
    #         image_to_locate = cv2.imread(image_path, 0)
    #     except cv2.error as e:
    #         print("Error: ",e)
    #         return
    #     h, w = image_to_locate.shape[:2]
    #     img= self.get_last_frame()
    #     screenshot = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)#cv2.imdecode(np.frombuffer(img, np.uint8), 0)
    #     # Define the region of the screen to search in
    #     if region:
    #         x, y, rw, rh = region
    #         screenshot = screenshot[y:y+rh, x:x+rw]
    #         t_height,t_width=image_to_locate.shape[:2]
    #         if t_width>rw or t_height>rh:
    #             return False
    #     try:
    #         # Perform the template matching
    #         match_result = cv2.matchTemplate(screenshot, image_to_locate, cv2.TM_CCOEFF_NORMED)
    #         # Find the location of the best match
    #         min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(match_result)
    #         # If the confidence level is not met, return None
    #         if max_val < confidence:
    #             return None
    #         # Calculate the coordinates of the center of the matched region
    #         xi, yi = max_loc
    #         x = xi + w // 2
    #         y = yi + h // 2
    #         # If a region was defined, adjust the coordinates to the full screen
    #         if region:
    #             x += region[0]
    #             y += region[1]
    #         return x, y
    #     except cv2.error as e:
    #         print("Error in template matching: ", e)
    #         return None
        
    def locate_center_on_screen(self, image_path, confidence=0.8, region=None):
        try:
            # Resolve relative path against default_img_dir if available
            if isinstance(image_path, str) and not os.path.isabs(image_path):
                try:
                    base = getattr(self, 'default_img_dir', None)
                    if base:
                        candidate = os.path.join(base, image_path)
                        if os.path.exists(candidate):
                            image_path = candidate
                except Exception:
                    pass
            # Load the image to locate
            image_to_locate = cv2.imread(image_path, 0)
            if image_to_locate is None:
                print(f"Error: Unable to load image {image_path}")
                return None
        except cv2.error as e:
            print("Error: ", e)
            return None

        h, w = image_to_locate.shape[:2]
        img = self.get_last_frame()  # Capture la dernière image de l'écran
        if img is None:
            print("WARNING: No frame available for template matching (scrcpy/adb screenshot failed)")
            return None
        screenshot = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

        # Définir la région d'intérêt si elle est spécifiée
        if region:
            x, y, rw, rh = region
            screenshot = screenshot[y:y+rh, x:x+rw]
            t_height, t_width = image_to_locate.shape[:2]
            if t_width > rw or t_height > rh:
                print("Image is too large for the specified region.")
                return None

        try:
            # Perform template matching
            match_result = cv2.matchTemplate(screenshot, image_to_locate, cv2.TM_CCOEFF_NORMED)
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(match_result)

            if max_val < confidence:
                return None  # Si la confiance est trop faible

            # Calculer le centre de la zone correspondante
            xi, yi = max_loc
            x = xi + w // 2
            y = yi + h // 2

            # Ajuster si une région est spécifiée
            if region:
                x += region[0]
                y += region[1]

            return x, y
        except cv2.error as e:
            print("Error in template matching: ", e)
            return None


    def locate_center_all_on_screen(self, image_path, confidence=0.96, region=None):
        # Resolve relative path against default_img_dir if available
        if isinstance(image_path, str) and not os.path.isabs(image_path):
            try:
                base = getattr(self, 'default_img_dir', None)
                if base:
                    candidate = os.path.join(base, image_path)
                    if os.path.exists(candidate):
                        image_path = candidate
            except Exception:
                pass
        # Load the image to locate
        image_to_locate = cv2.imread(image_path, 0)
        h, w = image_to_locate.shape[:2]
        img = self.get_last_frame()
        if img is None:
            print("WARNING: No frame available for multi-match (scrcpy/adb screenshot failed)")
            return []
        screenshot = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        # Define the region of the screen to search in
        if region:
            x, y, rw, rh = region
            screenshot = screenshot[y:y+rh, x:x+rw]
            t_height, t_width = image_to_locate.shape[:2]
            if t_width > rw or t_height > rh:
                return False
        # Perform the template matching
        match_result = cv2.matchTemplate(screenshot, image_to_locate, cv2.TM_CCOEFF_NORMED)
        #best maches
        ylocs, xlocs = np.where(match_result >= confidence)
        print(str(len(ylocs)))
        locations = []
        for x, y in zip(xlocs, ylocs):
            xf, yf = x + w//2, y + h//2
            if region:
                xf += region[0]
                yf += region[1]
            locations.append([int(xf), int(yf)])
        return locations
