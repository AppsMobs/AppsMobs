from core.android_functions import tap, text


def run(android_client, serial):
    """Minimal example script.

    Taps near the bottom center of the screen and types a short message.
    Returns a dict compatible with the app's expectations.
    """
    result = {"success": False, "message": "", "data": {}}
    try:
        tap(540, 1680)
        text("Hello from AppsMobs!")
        result["success"] = True
        result["message"] = f"Executed on {serial}"
    except Exception as exc:  # pragma: no cover
        result["message"] = str(exc)
    return result


SCRIPT_INFO = {
    "name": "Hello Example",
    "description": "Tap and type a short greeting",
    "author": "AppsMobs",
    "version": "1.0.0",
    "max_duration": 30,
}


