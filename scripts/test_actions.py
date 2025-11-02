"""
Test Actions - AppsMobs

Ce script de test exécute une petite séquence:
1) Clic au centre
2) Swipe vers le haut
3) Bouton retour
4) Bascule du mode avion (on/off)

Utilise l'injection automatique de fonctions depuis core.android_functions
(donc pas d'import nécessaire ici).
"""

SCRIPT_INFO = {
    'name': 'Test Actions (click/swipe/back/airplane)',
    'description': 'Séquence de tests rapides pour valider les contrôles',
    'author': 'AppsMobs',
    'version': '1.0.0',
    'max_duration': 30,
}


def run(serial):
    from core import run_with_bridge
    return run_with_bridge(my_script, serial)


def my_script(android_client, serial):
    result = {'success': False, 'message': '', 'data': {}}
    try:
        print(f"[TEST_ACTIONS] Démarrage sur {serial}")

        # Clic au centre approximatif de l'écran (ajustez selon résolution)
        click(android_client, 540, 960)
        random_delay(0.3, 0.6)

        # Swipe vers le haut
        upswipe(android_client)
        random_delay(0.3, 0.6)

        # Retour
        back(android_client)
        random_delay(0.3, 0.6)

        # Mode avion ON puis OFF
        toggle_airplane_mode(android_client)

        result['success'] = True
        result['message'] = 'Test actions terminé'
        result['data'] = {'device': serial}
        return result
    except Exception as e:
        result['message'] = str(e)
        return result
