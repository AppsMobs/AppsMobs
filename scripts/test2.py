"""
Script personnalisé pour AppsMobs
Modifiez la fonction my_script() pour créer votre automatisation
"""
SCRIPT_INFO = {
    'name': 'Test Actions (click/swipe/back/found_image)',
    'description': 'Séquence de tests rapides pour valider les contrôles',
    'author': 'AppsMobs',
    'version': '1.0.0',
    'max_duration': 10,
}

from core import log, run_with_bridge

def run(serial):
    return run_with_bridge(my_script, serial)


def my_script(android_client, serial):
    
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        print(f"[TEST2] Démarrage sur {serial}")
        # Les images sont résolues par défaut depuis scripts/img grâce au Core
        pos = find_image(android_client, "profil.png")
        if pos:
            click(android_client, pos[0], pos[1])
        wait(3.0)
        back(android_client)
        downswipe(android_client)
        wait(1.0)
        pos = find_image(android_client, "shield.png")
        if pos:
            click(android_client, pos[0], pos[1])
        # Démo de fin
        log(serial, "Script terminé avec succès!")
        result['success'] = True
        result['message'] = f'Script exécuté sur {serial}'
        result['data']['device'] = serial
    except Exception as e:
        result['message'] = str(e)
        return result
    
    
