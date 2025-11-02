"""
Système d'authentification et de sécurité pour AppsMobs
Gère l'authentification JWT, la vérification des licences et le chiffrement SSL
"""

import os
import json
import time
import jwt
import hashlib
import secrets
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pathlib import Path
import ssl
import urllib3
from cryptography.fernet import Fernet

# Configuration SSL pour désactiver les warnings en développement
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class AuthManager:
    """Gestionnaire d'authentification et de sécurité"""
    
    def __init__(self):
        self.config_file = Path("auth_config.json")
        self.secret_key = self._get_or_create_secret()
        # Utiliser variable d'environnement, pas de valeur hardcodée par défaut
        self.license_server_url = os.getenv("LICENSE_SERVER_URL") or ""
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        self.session_timeout = 24 * 60 * 60  # 24 heures
        self.load_config()
        
    def _get_or_create_secret(self) -> str:
        """Génère ou récupère la clé secrète pour JWT"""
        secret_file = Path("auth_secret.key")
        if secret_file.exists():
            return secret_file.read_text().strip()
        else:
            secret = secrets.token_urlsafe(32)
            secret_file.write_text(secret)
            return secret
    
    def load_config(self):
        """Charge la configuration d'authentification"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
            except Exception:
                self.config = {}
        else:
            self.config = {}
    
    def save_config(self):
        """Sauvegarde la configuration d'authentification"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def generate_jwt_token(self, user_data: Dict[str, Any]) -> str:
        """Génère un token JWT pour l'utilisateur"""
        payload = {
            'user_id': user_data.get('user_id'),
            'email': user_data.get('email'),
            'plan': user_data.get('plan'),
            'license_key': user_data.get('license_key'),
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=self.session_timeout),
            'jti': secrets.token_urlsafe(16)  # JWT ID unique
        }
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Vérifie et décode un token JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def verify_license_with_server(self, email: str, license_key: str) -> Dict[str, Any]:
        """Vérifie la licence auprès du serveur Supabase"""
        try:
            headers = {}
            if self.supabase_anon_key:
                headers.update({
                    'Authorization': f'Bearer {self.supabase_anon_key}',
                    'apikey': self.supabase_anon_key,
                    'Content-Type': 'application/json'
                })
            
            payload = {
                'email': email,
                'key': license_key
            }
            
            # Utilisation de SSL avec vérification
            response = requests.post(
                f"{self.license_server_url}/api/verify",
                json=payload,
                headers=headers,
                timeout=10,
                verify=True  # Vérification SSL activée
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('ok'):
                    return {
                        'success': True,
                        'plan': data.get('plan'),
                        'token': data.get('token'),
                        'expires_at': data.get('expires_at'),
                        'message': 'Licence vérifiée avec succès'
                    }
                else:
                    return {
                        'success': False,
                        'message': data.get('message', 'Erreur de vérification de licence')
                    }
            else:
                return {
                    'success': False,
                    'message': f'Erreur serveur: {response.status_code}'
                }
                
        except requests.exceptions.SSLError as e:
            return {
                'success': False,
                'message': f'Erreur SSL: {str(e)}'
            }
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'message': 'Timeout de connexion au serveur'
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'message': f'Erreur de connexion: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Erreur inattendue: {str(e)}'
            }
    
    def authenticate_user(self, email: str, license_key: str) -> Dict[str, Any]:
        """Authentifie un utilisateur avec email et clé de licence"""
        # Vérification locale d'abord
        if 'user_session' in self.config:
            session = self.config['user_session']
            if (session.get('email') == email and 
                session.get('license_key') == license_key and
                session.get('expires_at', 0) > time.time()):
                return {
                    'success': True,
                    'jwt_token': session.get('jwt_token'),
                    'plan': session.get('plan'),
                    'message': 'Session locale valide'
                }
        
        # Vérification auprès du serveur
        server_result = self.verify_license_with_server(email, license_key)
        
        if server_result['success']:
            # Génération du token JWT local
            user_data = {
                'user_id': hashlib.sha256(f"{email}{license_key}".encode()).hexdigest()[:16],
                'email': email,
                'license_key': license_key,
                'plan': server_result['plan']
            }
            
            jwt_token = self.generate_jwt_token(user_data)
            
            # Sauvegarde de la session
            self.config['user_session'] = {
                'email': email,
                'license_key': license_key,
                'plan': server_result['plan'],
                'jwt_token': jwt_token,
                'expires_at': server_result.get('expires_at', time.time() + self.session_timeout),
                'last_login': time.time()
            }
            self.save_config()
            
            return {
                'success': True,
                'jwt_token': jwt_token,
                'plan': server_result['plan'],
                'expires_at': server_result.get('expires_at'),
                'message': 'Authentification réussie'
            }
        else:
            return server_result
    
    def is_authenticated(self) -> bool:
        """Vérifie si l'utilisateur est authentifié"""
        if 'user_session' not in self.config:
            return False
        
        session = self.config['user_session']
        if session.get('expires_at', 0) <= time.time():
            return False
        
        # Vérification du token JWT
        jwt_token = session.get('jwt_token')
        if not jwt_token:
            return False
        
        payload = self.verify_jwt_token(jwt_token)
        return payload is not None
    
    def get_current_user(self) -> Optional[Dict[str, Any]]:
        """Récupère les informations de l'utilisateur actuel"""
        if not self.is_authenticated():
            return None
        
        session = self.config['user_session']
        jwt_token = session.get('jwt_token')
        
        if jwt_token:
            payload = self.verify_jwt_token(jwt_token)
            if payload:
                return {
                    'email': payload.get('email'),
                    'plan': payload.get('plan'),
                    'license_key': payload.get('license_key'),
                    'expires_at': session.get('expires_at')
                }
        
        return None
    
    def logout(self):
        """Déconnecte l'utilisateur"""
        if 'user_session' in self.config:
            del self.config['user_session']
            self.save_config()
    
    def refresh_session(self) -> bool:
        """Rafraîchit la session si nécessaire"""
        if not self.is_authenticated():
            return False
        
        session = self.config['user_session']
        email = session.get('email')
        license_key = session.get('license_key')
        
        if not email or not license_key:
            return False
        
        # Vérification rapide auprès du serveur
        server_result = self.verify_license_with_server(email, license_key)
        
        if server_result['success']:
            # Mise à jour de la session
            session['expires_at'] = server_result.get('expires_at', time.time() + self.session_timeout)
            session['last_refresh'] = time.time()
            self.save_config()
            return True
        
        return False
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Chiffre les données sensibles"""
        key = Fernet.generate_key()
        f = Fernet(key)
        encrypted_data = f.encrypt(data.encode())
        return encrypted_data.decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str, key: bytes) -> str:
        """Déchiffre les données sensibles"""
        f = Fernet(key)
        decrypted_data = f.decrypt(encrypted_data.encode())
        return decrypted_data.decode()

# Instance globale
auth_manager = AuthManager()

def require_auth(func):
    """Décorateur pour exiger l'authentification"""
    def wrapper(*args, **kwargs):
        if not auth_manager.is_authenticated():
            return {
                'success': False,
                'message': 'Authentification requise',
                'requires_login': True
            }
        return func(*args, **kwargs)
    return wrapper

def get_auth_status() -> Dict[str, Any]:
    """Retourne le statut d'authentification"""
    if auth_manager.is_authenticated():
        user = auth_manager.get_current_user()
        return {
            'authenticated': True,
            'user': user,
            'plan': user.get('plan') if user else None
        }
    else:
        return {
            'authenticated': False,
            'user': None,
            'plan': None
        }
