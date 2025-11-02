"""
Vérification des dépendances système (scrcpy, adb)
"""
import subprocess
import sys
import shutil
from pathlib import Path


def check_adb_installed():
    """Vérifie si ADB est installé et accessible"""
    try:
        result = subprocess.run(
            ['adb', 'version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def check_scrcpy_installed():
    """Vérifie si scrcpy est installé et accessible"""
    try:
        result = subprocess.run(
            ['scrcpy', '--version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def check_python_modules():
    """Vérifie si tous les modules Python requis sont installés"""
    required_modules = [
        'cv2',
        'numpy',
        'adbutils',
        'pytesseract',
        'PIL'
    ]
    
    missing_modules = []
    for module in required_modules:
        try:
            __import__(module)
        except ImportError:
            missing_modules.append(module)
    
    return len(missing_modules) == 0, missing_modules


def get_adb_path():
    """Retourne le chemin vers l'exécutable ADB"""
    adb_candidates = [
        shutil.which('adb'),
        'adb',
        'adb.exe'
    ]
    
    for path in adb_candidates:
        if path and Path(path).exists():
            return path
        if shutil.which(path):
            return path
    
    return None


def get_scrcpy_path():
    """Retourne le chemin vers l'exécutable scrcpy"""
    scrcpy_candidates = [
        shutil.which('scrcpy'),
        'scrcpy',
        'scrcpy.exe'
    ]
    
    for path in scrcpy_candidates:
        if path and Path(path).exists():
            return path
        if shutil.which(path):
            return path
    
    return None


def check_all_dependencies():
    """Vérifie toutes les dépendances et retourne un rapport"""
    results = {
        'adb_installed': check_adb_installed(),
        'scrcpy_installed': check_scrcpy_installed(),
        'adb_path': get_adb_path(),
        'scrcpy_path': get_scrcpy_path(),
    }
    
    modules_ok, missing = check_python_modules()
    results['python_modules_ok'] = modules_ok
    results['missing_modules'] = missing
    
    return results


def print_dependency_report(results):
    """Affiche un rapport des dépendances"""
    print("=" * 50)
    print("RAPPORT DES DÉPENDANCES")
    print("=" * 50)
    
    print(f"\n✓ ADB: {'INSTALLÉ' if results['adb_installed'] else '❌ NON INSTALLÉ'}")
    if results['adb_path']:
        print(f"  Chemin: {results['adb_path']}")
    
    print(f"\n✓ scrcpy: {'INSTALLÉ' if results['scrcpy_installed'] else '❌ NON INSTALLÉ'}")
    if results['scrcpy_path']:
        print(f"  Chemin: {results['scrcpy_path']}")
    
    print(f"\n✓ Modules Python: {'OK' if results['python_modules_ok'] else '❌ MANQUANTS'}")
    if results['missing_modules']:
        print(f"  Modules manquants: {', '.join(results['missing_modules'])}")
    
    print("\n" + "=" * 50)


if __name__ == '__main__':
    results = check_all_dependencies()
    print_dependency_report(results)

