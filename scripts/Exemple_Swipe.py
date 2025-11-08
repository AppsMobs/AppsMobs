"""
Custom script example for AppsMobs
Edit the my_script() function to build your own automation.
"""



def my_script(android_client, serial):
    """
    Your custom script entrypoint.

    Args:
        android_client: Android client instance (tap, swipe, etc.)
        serial: Device serial number

    Returns:
        dict: {'success': bool, 'message': str, 'data': {}}
    """
    # Use helper functions provided by the runtime: log, wait, upswipe, downswipe
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        log(serial, "Script started")


        upswipe(android_client)
        wait(1.0)
        downswipe(android_client)
        wait(1.0)

        
        log(serial, "Script finished successfully!")
        result['success'] = True
        result['message'] = f'Script executed on {serial}'
        result['data']['device'] = serial
    except Exception as e:
        log(serial, f"Error: {e}", "ERROR")
        result['success'] = False
        result['message'] = str(e)
        import traceback
        result['data']['traceback'] = traceback.format_exc()
    
    return result