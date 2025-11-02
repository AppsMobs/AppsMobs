"""
Prototype de test AppsMobs

But: vérifier rapidement que l'environnement d'exécution fonctionne.
"""

from scripts.android_functions import click, random_delay


SCRIPT_INFO = {
    'name': 'Prototype Test',
    'description': 'Vérifie le run de base (clics + délais).',
    'author': 'AppsMobs',
    'version': '1.0.0',
    'max_duration': 15,
}


def run(serial):
    from core import run_with_bridge
    return run_with_bridge(main, serial)


def main(android_client, serial):
    try:
        print(f"[TEST] Démarrage sur {serial}")
        # Exemple minimal: deux clics rapides au centre approximatif
        click(android_client, 540, 960)
        random_delay(0.3, 0.6)
        click(android_client, 540, 960)
        return {
            'success': True,
            'message': 'Prototype exécuté avec succès',
            'data': {'device': serial}
        }
    except Exception as e:
        return {
            'success': False,
            'message': str(e),
            'data': {}
        }
