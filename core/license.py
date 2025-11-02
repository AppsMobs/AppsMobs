"""
Gestion simple de licence/abonnement

Pour l'instant: lit un fichier optionnel config.json (plan: free|pro|team)
ou la variable d'environnement BOOTYBOT_PLAN.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
import time
import urllib.request
import urllib.parse
import urllib.error
import uuid
import platform
import hashlib
try:
    import winreg  # type: ignore
except Exception:
    winreg = None  # type: ignore


def _config_base_dir() -> Path:
    """Retourne le dossier de config applicative (AppData/Roaming sous Windows)."""
    if os.name == 'nt':
        appdata = os.getenv('APPDATA')  # ex: C:\\Users\\User\\AppData\\Roaming
        base = Path(appdata) / 'BootyBot'
    else:
        base = Path(os.path.expanduser('~')) / '.config' / 'bootybot'
    try:
        base.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass
    return base


def _config_path() -> Path:
    # Autoriser override via env
    override = os.getenv('BOOTYBOT_CONFIG_PATH')
    if override:
        return Path(override)
    return _config_base_dir() / 'config.json'


def _read_config_plan() -> str | None:
    cfg_path = _config_path()
    if not cfg_path.exists():
        return None
    try:
        data = json.loads(cfg_path.read_text(encoding='utf-8'))
        plan = (data.get('plan') or '').strip().lower()
        return plan if plan in {'normal', 'pro', 'team'} else None
    except Exception:
        return None


def _read_config() -> dict:
    cfg_path = _config_path()
    if not cfg_path.exists():
        return {}
    try:
        return json.loads(cfg_path.read_text(encoding='utf-8'))
    except Exception:
        return {}


def _write_config(data: dict) -> None:
    cfg_path = _config_path()
    try:
        cfg_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    except Exception:
        pass


def _compute_device_id() -> str:
    """Génère un identifiant d'appareil stable (sans données sensibles)."""
    parts: list[str] = []
    # Windows MachineGuid si disponible
    try:
        if winreg is not None and os.name == 'nt':
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\\Microsoft\\Cryptography") as k:
                guid, _ = winreg.QueryValueEx(k, "MachineGuid")
                if isinstance(guid, str) and guid:
                    parts.append(guid)
    except Exception:
        pass
    # Adresse MAC (uuid.getnode)
    try:
        mac = uuid.getnode()
        if mac and mac != uuid.getnode.__code__.co_argcount:  # basic guard
            parts.append(hex(mac))
    except Exception:
        pass
    # Hostname
    try:
        hn = platform.node()
        if hn:
            parts.append(hn)
    except Exception:
        pass

    base = "|".join(parts) if parts else str(uuid.uuid4())
    digest = hashlib.sha256(base.encode('utf-8')).hexdigest()
    return digest[:32]


def _read_or_create_device_id() -> str:
    data = _read_config()
    dev = (data.get('device_id') or '').strip()
    if dev:
        return dev
    dev = _compute_device_id()
    try:
        data['device_id'] = dev
        _write_config(data)
    except Exception:
        pass
    return dev


def get_plan() -> str:
    env_plan = (os.getenv('BOOTYBOT_PLAN') or '').strip().lower()
    if env_plan in {'normal', 'pro', 'team'}:
        return env_plan
    cfg_plan = _read_config_plan()
    if cfg_plan:
        return cfg_plan
    # Par défaut: aucune licence
    return 'none'


def is_pro() -> bool:
    return get_plan() in {'pro', 'team'}


def is_licensed() -> bool:
    """Retourne True si une licence valide est présente (normal/pro/team)."""
    return get_plan() in {'normal', 'pro', 'team'}


# ======================== Activation / Vérification ========================

def save_license_token(email: str, key: str, plan: str, token: str, expires_at: int | None = None) -> None:
    data = _read_config()
    # Sécurité: ne pas stocker email/clé en clair, conserver uniquement des métadonnées nécessaires
    email_hash = hashlib.sha256((email or '').strip().lower().encode('utf-8')).hexdigest()
    data['license'] = {
        'plan': plan,
        'token': token,
        'expires_at': expires_at,
        'saved_at': int(time.time()),
        'device_id': _read_or_create_device_id(),
        'email_hash': email_hash,
    }
    # garder plan au niveau racine pour compat
    data['plan'] = plan
    _write_config(data)


def load_license_token() -> dict | None:
    data = _read_config()
    lic = data.get('license')
    if isinstance(lic, dict) and lic.get('token'):
        return lic
    return None


def verify_license_with_server(email: str, key: str, server_url: str | None = None) -> dict:
    """Vérifie la licence auprès d'un serveur. Retourne un dict {ok, plan, token, expires_at, message}.

    Ordre de résolution de l'URL du serveur de licence (le premier non vide gagne):
      1) argument `server_url`
      2) variable d'environnement `LICENSE_SERVER_URL`
      3) champ `license_server_url` dans le fichier de config utilisateur (%APPDATA%/BootyBot/config.json)
    """
    # 1) argument > 2) env > 3) config utilisateur
    server_url = server_url or os.getenv('LICENSE_SERVER_URL') or (_read_config().get('license_server_url') or '')
    if not server_url:
        # Mode dev optionnel, uniquement si explicitement activé via DEV_MODE
        dev_mode = (os.getenv('DEV_MODE') or '').strip().lower() in {'1', 'true', 'yes'}
        if dev_mode and key == 'DEV-KEY':
            return {'ok': True, 'plan': 'pro', 'token': 'dev-token', 'expires_at': int(time.time()) + 86400, 'message': 'Dev mode'}
        return {'ok': False, 'message': 'Aucun serveur de licence configuré'}

    try:
        # Construire headers communs (Bearer optionnel)
        headers_common = {}
        cfg = _read_config()
        bearer = (os.getenv('LICENSE_AUTH_BEARER') or os.getenv('SUPABASE_ANON_KEY') or cfg.get('license_auth_bearer') or '').strip()
        if bearer:
            headers_common['Authorization'] = f'Bearer {bearer}'

        endpoint = server_url.rstrip('/') + '/api/verify'
        device_id = _read_or_create_device_id()

        # 1) Tentative JSON (recommandée pour Supabase Edge Functions)
        json_payload = json.dumps({'email': email, 'key': key, 'device_id': device_id}).encode('utf-8')
        json_headers = {**headers_common, 'Content-Type': 'application/json'}
        try:
            req_json = urllib.request.Request(endpoint, data=json_payload, method='POST', headers=json_headers)
            with urllib.request.urlopen(req_json, timeout=10) as resp:
                raw = resp.read().decode('utf-8', errors='ignore')
                data = json.loads(raw)
                if data.get('ok') and data.get('plan') in {'normal', 'pro', 'team'} and data.get('token'):
                    return {
                        'ok': True,
                        'plan': data.get('plan'),
                        'token': data.get('token'),
                        'expires_at': data.get('expires_at'),
                        'message': data.get('message', ''),
                    }
                # si réponse non ok, retourner le message (pas de fallback si le serveur a répondu JSON)
                return {'ok': False, 'message': data.get('message', 'Licence invalide')}
        except urllib.error.HTTPError as e:
            # Si le serveur ne supporte pas JSON (400/415), on tente le fallback form-urlencoded
            if e.code not in (400, 415):
                raise

        # 2) Fallback: application/x-www-form-urlencoded (compat mini-serveur Python)
        form_payload = urllib.parse.urlencode({'email': email, 'key': key, 'device_id': device_id}).encode('utf-8')
        form_headers = {**headers_common, 'Content-Type': 'application/x-www-form-urlencoded'}
        req_form = urllib.request.Request(endpoint, data=form_payload, method='POST', headers=form_headers)
        with urllib.request.urlopen(req_form, timeout=10) as resp:
            raw = resp.read().decode('utf-8', errors='ignore')
            try:
                data = json.loads(raw)
            except Exception:
                return {'ok': False, 'message': 'Réponse invalide du serveur'}
            if data.get('ok') and data.get('plan') in {'normal', 'pro', 'team'} and data.get('token'):
                return {
                    'ok': True,
                    'plan': data.get('plan'),
                    'token': data.get('token'),
                    'expires_at': data.get('expires_at'),
                    'message': data.get('message', ''),
                }
            return {'ok': False, 'message': data.get('message', 'Licence invalide')}
    except urllib.error.URLError as e:
        return {'ok': False, 'message': f'Erreur réseau: {e}'}
    except Exception as e:
        return {'ok': False, 'message': f'Erreur: {e}'}


def check_license_token_online(server_url: str | None = None) -> dict:
    """Vérifie le token local auprès du serveur (si possible). Invalide si révoqué/expiré.

    Retourne { ok, plan, expires_at, message }.
    """
    lic = load_license_token()
    if not lic:
        return {'ok': False, 'message': 'Aucune licence locale'}
    # Si expiration locale dépassée, invalider immédiatement
    expires_at = lic.get('expires_at')
    if isinstance(expires_at, int) and expires_at and expires_at < int(time.time()):
        return {'ok': False, 'message': 'Licence expirée'}

    cfg = _read_config()
    server_url = server_url or os.getenv('LICENSE_SERVER_URL') or (cfg.get('license_server_url') or '')
    if not server_url:
        return {'ok': True, 'plan': cfg.get('plan'), 'expires_at': expires_at, 'message': 'Mode hors-ligne'}

    try:
        endpoint = server_url.rstrip('/') + '/api/check'
        payload = json.dumps({'token': lic.get('token'), 'device_id': lic.get('device_id')}).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
        bearer = (os.getenv('LICENSE_AUTH_BEARER') or os.getenv('SUPABASE_ANON_KEY') or cfg.get('license_auth_bearer') or '').strip()
        if bearer:
            headers['Authorization'] = f'Bearer {bearer}'
        req = urllib.request.Request(endpoint, data=payload, method='POST', headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode('utf-8', errors='ignore')
            data = json.loads(raw)
            if data.get('ok') and data.get('plan') in {'normal', 'pro', 'team'}:
                # Optionnel: mettre à jour l'expiration si renvoyée
                if data.get('expires_at'):
                    lic['expires_at'] = data.get('expires_at')
                    cfg['license'] = lic
                    cfg['plan'] = data.get('plan')
                    _write_config(cfg)
                return {'ok': True, 'plan': data.get('plan'), 'expires_at': data.get('expires_at'), 'message': data.get('message', '')}
            # Invalider localement
            cfg['plan'] = 'none'
            if 'license' in cfg:
                try:
                    del cfg['license']
                except Exception:
                    pass
            _write_config(cfg)
            return {'ok': False, 'message': data.get('message', 'Licence non valide')}
    except Exception as e:
        # En cas d'erreur réseau, ne pas invalider, rester en mode hors-ligne
        return {'ok': True, 'plan': cfg.get('plan'), 'expires_at': expires_at, 'message': f'Hors-ligne: {e}'}


def max_concurrent_devices() -> int:
    plan = get_plan()
    if plan == 'normal':
        return 1
    if plan == 'pro':
        return 2
    if plan == 'team':
        return 5
    # Non licencié
    return 0


