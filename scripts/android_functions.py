"""
Proxy de compatibilité pour les fonctions Android.
Les implémentations réelles résident dans `core.android_functions`.
Ce fichier évite d'exposer le code aux clients tout en gardant la
compatibilité avec d'anciens imports `scripts.android_functions`.
"""

# Ré-exporte toute l'API publique depuis le module core
from core.android_functions import *  # noqa: F401,F403