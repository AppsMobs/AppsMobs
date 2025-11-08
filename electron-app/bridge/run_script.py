import sys
import os
import subprocess
import importlib.util
import time
from pathlib import Path

SCRIPT_DONE_MARKER = "[APPSMOBS_SCRIPT_DONE]"


def main():
    if len(sys.argv) < 3:
        print("Usage: run_script.py <script_file> <serial>")
        sys.exit(2)

    script_file = sys.argv[1]
    serial = sys.argv[2]

    # Ajouter le répertoire racine du projet au PYTHONPATH
    # __file__ = electron-app/bridge/run_script.py
    # project root = parents[2]
    project_root = Path(__file__).resolve().parents[2]
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    
    # Importer les fonctions de logging centralisées
    try:
        from core import log_bridge
    except ImportError:
        # Fallback si core n'est pas disponible
        def log_bridge(message):
            timestamp = time.strftime("%H:%M:%S")
            print(f"[{timestamp}] [bridge] {message}", flush=True)

    def finish():
        """Marque explicitement la fin de script et termine le processus."""
        try:
            print(SCRIPT_DONE_MARKER, flush=True)
        except Exception:
            pass
        sys.exit(0)

    # Exécute le script Python pour un device donné.
    # Compatibilité maximale:
    # 1) Si le fichier expose une fonction `run(serial)` ou `main(serial)`, on l'appelle directement
    # 2) Sinon on exécute le fichier en sous-processus avec `--serial <id>`
    script_path = Path(script_file)
    if not script_path.exists():
        print(f"Script introuvable: {script_path}")
        sys.exit(3)

    # Essayer d'importer et appeller une fonction
    try:
        log_bridge(f"Tentative d'import du script: {script_path}")
        spec = importlib.util.spec_from_file_location("_user_script_module", str(script_path))
        if spec and spec.loader:
            mod = importlib.util.module_from_spec(spec)
            # Injection des helpers Core dans l'espace global du script avant exécution
            injected = { 'finish': finish }
            try:
                from core import log, log_step
                injected['log'] = log
                injected['log_step'] = log_step
            except Exception as _inj_log:
                log_bridge(f"Avertissement: log helpers indisponibles ({_inj_log}).")
            try:
                from core.android_functions import (
                    click, doubleclick, swipe,
                    write, back, home, entre, switch,
                    sleep as core_sleep,
                    upswipe, downswipe, leftswipe, rightswipe,
                    enter, switch_app,
                    swipe_up, swipe_down, swipe_left, swipe_right,
                    find, find_image_bool, find_images_list, find_all,
                    find_image_and_click, find_loop, find_and_click_loop, find_and_click_loop_with_sound,
                    wait_for_image, click_until_image_appears,
                    random_delay, move_with_variation,
                    long_press, long_press_image,
                    toggle_airplane_mode, clear_cache, restart_app, screenshot,
                    wait,
                )
                injected.update({
                    # Contrôles
                    'click': click,
                    'doubleclick': doubleclick,
                    'swipe': swipe,
                    'write': write,
                    'back': back,
                    'home': home,
                    'entre': entre,
                    'switch': switch,
                    'sleep': core_sleep,
                    'enter': enter,
                    'switch_app': switch_app,
                    # Swipes
                    'upswipe': upswipe,
                    'downswipe': downswipe,
                    'leftswipe': leftswipe,
                    'rightswipe': rightswipe,
                    'swipe_up': swipe_up,
                    'swipe_down': swipe_down,
                    'swipe_left': swipe_left,
                    'swipe_right': swipe_right,
                    # Vision
                    'find': find,
                    'find_image_bool': find_image_bool,
                    'find_images_list': find_images_list,
                    'find_all': find_all,
                    'find_image_and_click': find_image_and_click,
                    'find_loop': find_loop,
                    'find_and_click_loop': find_and_click_loop,
                    'find_and_click_loop_with_sound': find_and_click_loop_with_sound,
                    'wait_for_image': wait_for_image,
                    'click_until_image_appears': click_until_image_appears,
                    # Utilitaires
                    'random_delay': random_delay,
                    'move_with_variation': move_with_variation,
                    'long_press': long_press,
                    'long_press_image': long_press_image,
                    # Réseau / système
                    'toggle_airplane_mode': toggle_airplane_mode,
                    'clear_cache': clear_cache,
                    'restart_app': restart_app,
                    'screenshot': screenshot,
                    # Attente simple
                    'wait': wait,
                })
            except Exception as _inj_err:
                log_bridge(f"Avertissement: injection Core partielle ({_inj_err}). Les scripts devront importer explicitement certaines fonctions.")
            # Toujours injecter au moins finish
            mod.__dict__.update(injected)

            spec.loader.exec_module(mod)  # type: ignore
            func = None
            if hasattr(mod, 'run') and callable(getattr(mod, 'run')):
                func = getattr(mod, 'run')
                log_bridge("Fonction run() trouvée")
            elif hasattr(mod, 'main') and callable(getattr(mod, 'main')):
                func = getattr(mod, 'main')
                log_bridge("Fonction main() trouvée")
            else:
                log_bridge("Aucune fonction run() ou main() trouvée dans le script")

            if func is not None:
                # Fournir aussi la variable d'env pour compat ADB
                os.environ['ADB_SERIAL'] = serial
                log_bridge(f"Appel de {func.__name__}('{serial}')")
                rc = 0
                try:
                    result = func(serial)
                    if isinstance(result, int):
                        rc = result
                    log_bridge(f"Fonction retournée: {rc}")
                except SystemExit as e:
                    rc = int(getattr(e, 'code', 1) or 0)
                    log_bridge(f"SystemExit avec code {rc}")
                except Exception as e:
                    log_bridge(f"Exception lors de l'exécution: {e}")
                    import traceback
                    traceback.print_exc()
                    rc = 1
                sys.exit(rc)
            elif hasattr(mod, 'my_script') and callable(getattr(mod, 'my_script')):
                # Chemin moderne: le script expose my_script(android_client, serial)
                try:
                    from core import run_with_bridge
                except Exception as e:
                    log_bridge(f"Impossible de charger run_with_bridge: {e}")
                    raise
                os.environ['ADB_SERIAL'] = serial
                log_bridge("Fonction my_script(android_client, serial) trouvée - exécution via run_with_bridge")
                try:
                    rc = run_with_bridge(getattr(mod, 'my_script'), serial)
                except SystemExit as e:
                    rc = int(getattr(e, 'code', 1) or 0)
                except Exception as e:
                    log_bridge(f"Exception lors de l'exécution: {e}")
                    import traceback
                    traceback.print_exc()
                    rc = 1
                sys.exit(rc)
    except Exception as e:
        log_bridge(f"Import direct impossible: {e}")
        import traceback
        traceback.print_exc()

    # Fallback: exécuter en sous-processus en passant --serial
    env = os.environ.copy()
    env['ADB_SERIAL'] = serial
    proc = subprocess.Popen(
        [sys.executable, str(script_path), '--serial', serial],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd=str(Path(__file__).resolve().parents[2]),
        env=env
    )

    assert proc.stdout is not None
    for line in proc.stdout:
        print(line, end='')

    proc.wait()
    sys.exit(proc.returncode)


if __name__ == '__main__':
    main()


