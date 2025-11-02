"""
⚠️ OBSOLÈTE - CE FICHIER N'EST PLUS UTILISÉ ⚠️

Ce serveur FastAPI est redondant avec l'Edge Function Supabase (dashboard/index.ts).
L'Edge Function est déployée et utilisée par toutes les applications.

Pour créer/vérifier des licences, utilisez :
- Edge Function Supabase : ${SUPABASE_URL}/functions/v1/license
- Ou directement via Supabase Client dans votre backend

Ce fichier est conservé uniquement pour référence.
Pour supprimer : voir ANALYSE_ARCHITECTURE.md

---
Gestionnaire de licences avec Supabase
API pour la vérification, création et gestion des licences
"""

import os
import json
import time
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import requests
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://encoikswoojgqilbdkwy.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Configuration JWT
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"

app = FastAPI(title="AppsMobs License API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Client Supabase
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Erreur connexion Supabase: {e}")

# Modèles Pydantic
class LicenseRequest(BaseModel):
    email: EmailStr
    key: str

class LicenseResponse(BaseModel):
    success: bool
    plan: Optional[str] = None
    token: Optional[str] = None
    expires_at: Optional[int] = None
    message: Optional[str] = None
    jwt_token: Optional[str] = None

class CreateLicenseRequest(BaseModel):
    email: EmailStr
    plan: str  # "pro" | "team"
    months: int = 1

class UpdateLicenseRequest(BaseModel):
    email: EmailStr
    key: str
    plan: Optional[str] = None
    months: Optional[int] = None
    expires_at: Optional[int] = None

class RevokeLicenseRequest(BaseModel):
    email: EmailStr
    key: str

class AdminRequest(BaseModel):
    admin_token: str

# -------------------- Profils utilisateurs --------------------
class ProfileUpsertRequest(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None

async def upsert_profile_db(data: Dict[str, Any]) -> bool:
    if not supabase:
        return False
    try:
        # upsert by email
        response = supabase.table('profiles').upsert(data, on_conflict='email').execute()
        return len(response.data or []) >= 1
    except Exception as e:
        print(f"Erreur Supabase upsert profile: {e}")
        return False

async def get_profile_db(email: str) -> Optional[Dict[str, Any]]:
    if not supabase:
        return None
    try:
        response = supabase.table('profiles').select('*').eq('email', email).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        print(f"Erreur Supabase get profile: {e}")
    return None

async def list_profiles_db() -> List[Dict[str, Any]]:
    if not supabase:
        return []
    try:
        response = supabase.table('profiles').select('*').execute()
        return response.data or []
    except Exception as e:
        print(f"Erreur Supabase list profiles: {e}")
        return []

# Fonctions utilitaires
def generate_jwt_token(user_data: Dict[str, Any]) -> str:
    """Génère un token JWT"""
    payload = {
        'user_id': user_data.get('user_id'),
        'email': user_data.get('email'),
        'plan': user_data.get('plan'),
        'license_key': user_data.get('license_key'),
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=30),
        'jti': secrets.token_urlsafe(16)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Vérifie un token JWT"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def verify_admin_token(admin_token: str) -> bool:
    """Vérifie le token administrateur"""
    expected_token = os.getenv("ADMIN_TOKEN")
    return expected_token and admin_token == expected_token

def get_current_timestamp() -> int:
    """Retourne le timestamp actuel"""
    return int(time.time())

def months_to_seconds(months: int) -> int:
    """Convertit des mois en secondes"""
    return months * 30 * 24 * 60 * 60

def days_remaining(expires_at: Optional[int]) -> Optional[int]:
    """Calcule les jours restants"""
    if not expires_at:
        return None
    delta = expires_at - get_current_timestamp()
    return max(0, delta // 86400)

# Fonctions Supabase
async def get_license_from_db(email: str, key: str) -> Optional[Dict[str, Any]]:
    """Récupère une licence depuis Supabase"""
    if not supabase:
        return None
    
    try:
        response = supabase.table('licenses').select('*').eq('email', email).eq('key', key).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        print(f"Erreur Supabase get_license: {e}")
    return None

async def create_license_in_db(email: str, key: str, plan: str, expires_at: int) -> bool:
    """Crée une licence dans Supabase"""
    if not supabase:
        return False
    
    try:
        license_data = {
            'email': email,
            'key': key,
            'plan': plan,
            'expires_at': expires_at,
            'created_at': get_current_timestamp(),
            'token': None
        }
        response = supabase.table('licenses').insert(license_data).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Erreur Supabase create_license: {e}")
    return False

async def update_license_in_db(email: str, key: str, updates: Dict[str, Any]) -> bool:
    """Met à jour une licence dans Supabase"""
    if not supabase:
        return False
    
    try:
        response = supabase.table('licenses').update(updates).eq('email', email).eq('key', key).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Erreur Supabase update_license: {e}")
    return False

async def revoke_license_in_db(email: str, key: str) -> bool:
    """Révoque une licence dans Supabase"""
    if not supabase:
        return False
    
    try:
        updates = {'expires_at': get_current_timestamp() - 1}
        response = supabase.table('licenses').update(updates).eq('email', email).eq('key', key).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Erreur Supabase revoke_license: {e}")
    return False

async def list_licenses_from_db() -> List[Dict[str, Any]]:
    """Liste toutes les licences depuis Supabase"""
    if not supabase:
        return []
    
    try:
        response = supabase.table('licenses').select('*').execute()
        return response.data or []
    except Exception as e:
        print(f"Erreur Supabase list_licenses: {e}")
    return []

# Routes API
@app.post("/api/verify", response_model=LicenseResponse)
async def verify_license(request: LicenseRequest):
    """Vérifie une licence"""
    try:
        # Récupérer la licence depuis Supabase
        license_data = await get_license_from_db(request.email, request.key)
        
        if not license_data:
            return LicenseResponse(
                success=False,
                message="Licence introuvable"
            )
        
        # Vérifier le plan
        if license_data.get('plan') not in ['pro', 'team']:
            return LicenseResponse(
                success=False,
                message="Plan invalide"
            )
        
        # Vérifier l'expiration
        expires_at = license_data.get('expires_at', 0)
        if expires_at and expires_at < get_current_timestamp():
            return LicenseResponse(
                success=False,
                message="Licence expirée"
            )
        
        # Générer le token JWT
        user_data = {
            'user_id': f"user_{hash(request.email + request.key) % 10000}",
            'email': request.email,
            'plan': license_data['plan'],
            'license_key': request.key
        }
        
        jwt_token = generate_jwt_token(user_data)
        
        # Mettre à jour le token dans la base
        await update_license_in_db(request.email, request.key, {'token': jwt_token})
        
        return LicenseResponse(
            success=True,
            plan=license_data['plan'],
            token=jwt_token,
            expires_at=expires_at,
            jwt_token=jwt_token,
            message="Licence vérifiée avec succès"
        )
        
    except Exception as e:
        return LicenseResponse(
            success=False,
            message=f"Erreur serveur: {str(e)}"
        )

# ----------- Profiles API -----------
@app.post("/api/profile/upsert")
async def upsert_profile(request: ProfileUpsertRequest):
    try:
        data = {
            'email': request.email,
            'first_name': request.first_name,
            'last_name': request.last_name,
            'country': request.country,
            'avatar_url': request.avatar_url,
            'updated_at': get_current_timestamp()
        }
        ok = await upsert_profile_db(data)
        if not ok:
            raise HTTPException(status_code=500, detail='Erreur upsert profil')
        profile = await get_profile_db(request.email)
        return { 'success': True, 'profile': profile }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/admin/profiles")
async def admin_list_profiles(admin_request: AdminRequest):
    if not verify_admin_token(admin_request.admin_token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    profiles = await list_profiles_db()
    return { 'success': True, 'profiles': profiles }

@app.post("/admin/create")
async def create_license(request: CreateLicenseRequest, admin_request: AdminRequest):
    """Crée une nouvelle licence (admin)"""
    if not verify_admin_token(admin_request.admin_token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    if request.plan not in ['pro', 'team']:
        raise HTTPException(status_code=400, detail="Plan invalide")
    
    # Générer une clé unique
    license_key = secrets.token_urlsafe(16)
    expires_at = get_current_timestamp() + months_to_seconds(max(1, request.months))
    
    # Créer la licence dans Supabase
    success = await create_license_in_db(request.email, license_key, request.plan, expires_at)
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la licence")
    
    return {
        "success": True,
        "email": request.email,
        "key": license_key,
        "plan": request.plan,
        "expires_at": expires_at,
        "days_remaining": days_remaining(expires_at)
    }

@app.post("/admin/update")
async def update_license(request: UpdateLicenseRequest, admin_request: AdminRequest):
    """Met à jour une licence (admin)"""
    if not verify_admin_token(admin_request.admin_token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    # Récupérer la licence existante
    license_data = await get_license_from_db(request.email, request.key)
    if not license_data:
        raise HTTPException(status_code=404, detail="Licence introuvable")
    
    updates = {}
    
    if request.plan:
        if request.plan not in ['pro', 'team']:
            raise HTTPException(status_code=400, detail="Plan invalide")
        updates['plan'] = request.plan
    
    if request.expires_at:
        updates['expires_at'] = request.expires_at
    elif request.months:
        updates['expires_at'] = get_current_timestamp() + months_to_seconds(max(1, request.months))
    
    # Mettre à jour dans Supabase
    success = await update_license_in_db(request.email, request.key, updates)
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")
    
    return {
        "success": True,
        "message": "Licence mise à jour avec succès"
    }

@app.post("/admin/revoke")
async def revoke_license(request: RevokeLicenseRequest, admin_request: AdminRequest):
    """Révoque une licence (admin)"""
    if not verify_admin_token(admin_request.admin_token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    success = await revoke_license_in_db(request.email, request.key)
    
    if not success:
        raise HTTPException(status_code=404, detail="Licence introuvable")
    
    return {
        "success": True,
        "message": "Licence révoquée avec succès"
    }

@app.get("/admin/list")
async def list_licenses(admin_request: AdminRequest):
    """Liste toutes les licences (admin)"""
    if not verify_admin_token(admin_request.admin_token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    licenses = await list_licenses_from_db()
    
    result = []
    for license_data in licenses:
        days = days_remaining(license_data.get('expires_at'))
        status = "actif" if (license_data.get('expires_at', 0) > get_current_timestamp()) else "expiré"
        
        result.append({
            "email": license_data.get('email'),
            "plan": license_data.get('plan'),
            "key": license_data.get('key'),
            "expires_at": license_data.get('expires_at'),
            "days_remaining": days,
            "status": status,
            "created_at": license_data.get('created_at')
        })
    
    return {
        "success": True,
        "licenses": result
    }

@app.get("/admin/reset-license")
async def reset_license(email: str, admin_request: AdminRequest):
    """Réinitialise une licence (admin)"""
    if not verify_admin_token(admin_request.admin_token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    # Générer une nouvelle clé
    new_key = secrets.token_urlsafe(16)
    expires_at = get_current_timestamp() + months_to_seconds(1)  # 1 mois par défaut
    
    # Mettre à jour la licence
    updates = {
        'key': new_key,
        'expires_at': expires_at,
        'token': None  # Invalider l'ancien token
    }
    
    success = await update_license_in_db(email, email, updates)  # Utiliser email comme ancienne clé temporairement
    
    if not success:
        raise HTTPException(status_code=404, detail="Licence introuvable")
    
    return {
        "success": True,
        "new_key": new_key,
        "expires_at": expires_at,
        "message": "Licence réinitialisée avec succès"
    }

@app.get("/")
async def root():
    """Point d'entrée de l'API"""
    return {
        "name": "AppsMobs License API",
        "version": "1.0.0",
        "status": "active",
        "supabase_connected": supabase is not None
    }

@app.get("/health")
async def health_check():
    """Vérification de santé de l'API"""
    supabase_status = False
    if supabase:
        try:
            # Test simple de connexion
            await list_licenses_from_db()
            supabase_status = True
        except:
            pass
    
    return {
        "status": "healthy",
        "timestamp": get_current_timestamp(),
        "supabase_connected": supabase_status,
        "jwt_secret_configured": bool(JWT_SECRET)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
