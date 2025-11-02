"""
Script personnalisé pour BootyBot
Modifiez la fonction my_script() pour créer votre automatisation
"""



def my_script(android_client, serial):
    """
    Votre script personnalisé
    
    Args:
        android_client: Instance Android (pour cliquer, swiper, etc.)
        serial: Numéro de série du device
        
    Returns:
        dict: {'success': bool, 'message': str, 'data': {}}
    """
    # Importer les fonctions de logging
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        log(serial, "Début du script")


        FindPosClick("retour.png", 0.85, region=None, xp=0, yp=0)
        wait(1.0)
        
        log(serial, "Script terminé avec succès!")
        result['success'] = True
        result['message'] = f'Script exécuté sur {serial}'
        result['data']['device'] = serial
    except Exception as e:
        log(serial, f"Erreur: {e}", "ERROR")
        result['success'] = False
        result['message'] = str(e)
        import traceback
        result['data']['traceback'] = traceback.format_exc()
    
    return result
