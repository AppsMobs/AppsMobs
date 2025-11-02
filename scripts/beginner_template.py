"""
Modèle débutant AppsMobs

Modifiez la fonction `my_script` pour créer votre automatisation.
Utilisez uniquement les fonctions importées depuis core.android_functions.
"""

from scripts.android_functions import *  # Import simple pour débutants

SCRIPT_INFO = {
    'name': 'Mon premier script',
    'description': 'Modèle simple pour débuter',
    'author': 'AppsMobs',
    'version': '1.0.0',
    'max_duration': 60,
}


def run(serial):
    from core import run_with_bridge
    return run_with_bridge(my_script, serial)


def my_script(android_client, serial):
    result = {'success': False, 'message': '', 'data': {}}
    try:
        print(f"[BEGINNER] Démarrage sur {serial}")

        # 1) Exemples simples (supprimez/éditez selon vos besoins)
        # click(android_client, 540, 960)
        # write(android_client, "hello")
        # random_delay(0.5, 1.0)

        # 2) Exemple de recherche image (remplacez 'image.png')
        # pos = find(android_client, 'image.png', confidence=0.8)
        # if pos:
        #     x, y = pos
        #     click(android_client, x, y)

        # 3) Exemple de swipe
        # upswipe(android_client)

        result['success'] = True
        result['message'] = 'Script terminé'
        result['data'] = {'device': serial}
        return result
    except Exception as e:
        result['message'] = str(e)
        return result
