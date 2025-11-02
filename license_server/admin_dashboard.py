"""
Dashboard Admin pour AppsMobs
Interface de gestion des licences avec fonctionnalité de réinitialisation
"""

import os
import json
import time
import requests
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr
import uvicorn

app = FastAPI(title="AppsMobs Admin Dashboard", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
# Utiliser variable d'environnement, configurer dans .env ou config.json
LICENSE_SERVER_URL = os.getenv("LICENSE_SERVER_URL") or ""
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Modèles
class ResetLicenseRequest(BaseModel):
    email: EmailStr
    reason: str = "Réinitialisation demandée par l'admin"

class LicenseInfo(BaseModel):
    email: str
    plan: str
    key: str
    expires_at: int
    days_remaining: int
    status: str
    created_at: int

class AdminStats(BaseModel):
    total_licenses: int
    active_licenses: int
    expired_licenses: int
    pro_licenses: int
    team_licenses: int

# Fonctions utilitaires
def verify_admin_token(token: str) -> bool:
    """Vérifie le token administrateur"""
    return ADMIN_TOKEN and token == ADMIN_TOKEN

def get_license_server_headers() -> Dict[str, str]:
    """Retourne les headers pour les appels au serveur de licences"""
    headers = {"Content-Type": "application/json"}
    if SUPABASE_ANON_KEY:
        headers.update({
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "apikey": SUPABASE_ANON_KEY
        })
    return headers

async def call_license_server(endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Appelle le serveur de licences"""
    try:
        url = f"{LICENSE_SERVER_URL}{endpoint}"
        headers = get_license_server_headers()
        
        if data:
            response = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"success": False, "message": f"Erreur serveur: {response.status_code}"}
    except Exception as e:
        return {"success": False, "message": f"Erreur de connexion: {str(e)}"}

# Routes API
@app.get("/", response_class=HTMLResponse)
async def admin_dashboard():
    """Dashboard principal"""
    html_content = """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AppsMobs Admin Dashboard</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: #e2e8f0;
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 30px;
                background: rgba(15, 23, 42, 0.8);
                border-radius: 16px;
                border: 1px solid rgba(0, 232, 255, 0.3);
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                background: linear-gradient(45deg, #00e8ff, #3b82f6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .header p {
                color: #94a3b8;
                font-size: 1.1rem;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            
            .stat-card {
                background: rgba(15, 23, 42, 0.8);
                border: 1px solid rgba(0, 232, 255, 0.3);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                transition: transform 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #00e8ff;
                margin-bottom: 8px;
            }
            
            .stat-label {
                color: #94a3b8;
                font-size: 0.9rem;
            }
            
            .actions-section {
                background: rgba(15, 23, 42, 0.8);
                border: 1px solid rgba(0, 232, 255, 0.3);
                border-radius: 16px;
                padding: 30px;
                margin-bottom: 40px;
            }
            
            .actions-section h2 {
                margin-bottom: 20px;
                color: #e2e8f0;
            }
            
            .action-form {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 15px;
                align-items: end;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
            }
            
            .form-label {
                margin-bottom: 8px;
                color: #e2e8f0;
                font-weight: 500;
            }
            
            .form-input {
                padding: 12px 16px;
                background: rgba(30, 41, 59, 0.8);
                border: 1px solid rgba(0, 232, 255, 0.3);
                border-radius: 8px;
                color: #e2e8f0;
                font-size: 1rem;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #00e8ff;
                box-shadow: 0 0 0 3px rgba(0, 232, 255, 0.1);
            }
            
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #00e8ff, #3b82f6);
                color: white;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 232, 255, 0.3);
            }
            
            .btn-danger {
                background: linear-gradient(45deg, #ef4444, #dc2626);
                color: white;
            }
            
            .btn-danger:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
            }
            
            .licenses-table {
                background: rgba(15, 23, 42, 0.8);
                border: 1px solid rgba(0, 232, 255, 0.3);
                border-radius: 16px;
                padding: 30px;
                overflow-x: auto;
            }
            
            .licenses-table h2 {
                margin-bottom: 20px;
                color: #e2e8f0;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid rgba(0, 232, 255, 0.2);
            }
            
            th {
                background: rgba(0, 232, 255, 0.1);
                color: #00e8ff;
                font-weight: 600;
            }
            
            .status-active {
                color: #22c55e;
                font-weight: bold;
            }
            
            .status-expired {
                color: #ef4444;
                font-weight: bold;
            }
            
            .license-key {
                font-family: 'Courier New', monospace;
                background: rgba(30, 41, 59, 0.5);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            .loading {
                text-align: center;
                padding: 40px;
                color: #94a3b8;
            }
            
            .error {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #fca5a5;
            }
            
            .success {
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #86efac;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 AppsMobs Admin</h1>
                <p>Gestion des licences et des utilisateurs</p>
            </div>
            
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card">
                    <div class="stat-number" id="totalLicenses">-</div>
                    <div class="stat-label">Total Licences</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="activeLicenses">-</div>
                    <div class="stat-label">Actives</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="expiredLicenses">-</div>
                    <div class="stat-label">Expirées</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="proLicenses">-</div>
                    <div class="stat-label">Plan Pro</div>
                </div>
            </div>
            
            <div class="actions-section">
                <h2>🔧 Actions Rapides</h2>
                <div class="action-form">
                    <div class="form-group">
                        <label class="form-label" for="resetEmail">Réinitialiser une licence</label>
                        <input type="email" id="resetEmail" class="form-input" placeholder="email@example.com">
                    </div>
                    <button class="btn btn-danger" onclick="resetLicense()">Réinitialiser</button>
                </div>
                <div class="action-form" style="margin-top: 15px;">
                    <div class="form-group">
                        <label class="form-label" for="refreshToken">Token Admin</label>
                        <input type="password" id="refreshToken" class="form-input" placeholder="Votre token admin">
                    </div>
                    <button class="btn btn-primary" onclick="refreshData()">Actualiser</button>
                </div>
            </div>
            
            <div class="licenses-table">
                <h2>📋 Liste des Licences</h2>
                <div id="licensesContent">
                    <div class="loading">Chargement des licences...</div>
                </div>
            </div>
        </div>
        
        <script>
            let adminToken = '';
            
            async function loadStats() {
                try {
                    const response = await fetch('/api/stats?token=' + encodeURIComponent(adminToken));
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('totalLicenses').textContent = data.stats.total_licenses;
                        document.getElementById('activeLicenses').textContent = data.stats.active_licenses;
                        document.getElementById('expiredLicenses').textContent = data.stats.expired_licenses;
                        document.getElementById('proLicenses').textContent = data.stats.pro_licenses;
                    }
                } catch (error) {
                    console.error('Erreur chargement stats:', error);
                }
            }
            
            async function loadLicenses() {
                try {
                    const response = await fetch('/api/licenses?token=' + encodeURIComponent(adminToken));
                    const data = await response.json();
                    
                    if (data.success) {
                        displayLicenses(data.licenses);
                    } else {
                        document.getElementById('licensesContent').innerHTML = 
                            '<div class="error">Erreur: ' + data.message + '</div>';
                    }
                } catch (error) {
                    document.getElementById('licensesContent').innerHTML = 
                        '<div class="error">Erreur de connexion au serveur</div>';
                }
            }
            
            function displayLicenses(licenses) {
                if (licenses.length === 0) {
                    document.getElementById('licensesContent').innerHTML = 
                        '<div class="loading">Aucune licence trouvée</div>';
                    return;
                }
                
                let html = '<table><thead><tr><th>Email</th><th>Plan</th><th>Clé</th><th>Expire le</th><th>Jours restants</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
                
                licenses.forEach(license => {
                    const statusClass = license.status === 'actif' ? 'status-active' : 'status-expired';
                    const expireDate = new Date(license.expires_at * 1000).toLocaleDateString('fr-FR');
                    
                    html += `
                        <tr>
                            <td>${license.email}</td>
                            <td>${license.plan.toUpperCase()}</td>
                            <td><code class="license-key">${license.key}</code></td>
                            <td>${expireDate}</td>
                            <td>${license.days_remaining || '-'}</td>
                            <td><span class="${statusClass}">${license.status}</span></td>
                            <td>
                                <button class="btn btn-danger" onclick="resetLicenseFor('${license.email}')" style="padding: 6px 12px; font-size: 0.8rem;">
                                    Réinitialiser
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table>';
                document.getElementById('licensesContent').innerHTML = html;
            }
            
            async function resetLicense() {
                const email = document.getElementById('resetEmail').value.trim();
                if (!email) {
                    alert('Veuillez entrer un email');
                    return;
                }
                
                if (!adminToken) {
                    alert('Veuillez entrer votre token admin');
                    return;
                }
                
                try {
                    const response = await fetch('/api/reset-license', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: email,
                            token: adminToken,
                            reason: 'Réinitialisation manuelle'
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('Licence réinitialisée avec succès!\\nNouvelle clé: ' + data.new_key);
                        loadLicenses();
                        loadStats();
                    } else {
                        alert('Erreur: ' + data.message);
                    }
                } catch (error) {
                    alert('Erreur de connexion');
                }
            }
            
            async function resetLicenseFor(email) {
                if (!confirm('Êtes-vous sûr de vouloir réinitialiser la licence pour ' + email + '?')) {
                    return;
                }
                
                document.getElementById('resetEmail').value = email;
                await resetLicense();
            }
            
            async function refreshData() {
                adminToken = document.getElementById('refreshToken').value.trim();
                if (!adminToken) {
                    alert('Veuillez entrer votre token admin');
                    return;
                }
                
                document.getElementById('licensesContent').innerHTML = '<div class="loading">Chargement...</div>';
                
                await Promise.all([loadStats(), loadLicenses()]);
            }
            
            // Chargement initial
            document.addEventListener('DOMContentLoaded', () => {
                // Demander le token admin au chargement
                adminToken = prompt('Token Admin:') || '';
                if (adminToken) {
                    refreshData();
                }
            });
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/api/stats")
async def get_stats(token: str = Query(...)):
    """Récupère les statistiques des licences"""
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    try:
        # Récupérer toutes les licences
        licenses_data = await call_license_server("/admin/list", {"admin_token": token})
        
        if not licenses_data.get("success"):
            raise HTTPException(status_code=500, detail=licenses_data.get("message", "Erreur serveur"))
        
        licenses = licenses_data.get("licenses", [])
        
        # Calculer les statistiques
        total_licenses = len(licenses)
        active_licenses = len([l for l in licenses if l.get("status") == "actif"])
        expired_licenses = len([l for l in licenses if l.get("status") == "expiré"])
        pro_licenses = len([l for l in licenses if l.get("plan") == "pro"])
        team_licenses = len([l for l in licenses if l.get("plan") == "team"])
        
        return {
            "success": True,
            "stats": {
                "total_licenses": total_licenses,
                "active_licenses": active_licenses,
                "expired_licenses": expired_licenses,
                "pro_licenses": pro_licenses,
                "team_licenses": team_licenses
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/api/licenses")
async def get_licenses(token: str = Query(...)):
    """Récupère la liste des licences"""
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    licenses_data = await call_license_server("/admin/list", {"admin_token": token})
    
    if licenses_data.get("success"):
        return licenses_data
    else:
        raise HTTPException(status_code=500, detail=licenses_data.get("message", "Erreur serveur"))

@app.post("/api/reset-license")
async def reset_license(request: ResetLicenseRequest, token: str = Query(...)):
    """Réinitialise une licence"""
    if not verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Token administrateur invalide")
    
    try:
        # Appeler le serveur de licences pour réinitialiser
        reset_data = {
            "email": request.email,
            "admin_token": token,
            "reason": request.reason
        }
        
        result = await call_license_server("/admin/reset-license", reset_data)
        
        if result.get("success"):
            return {
                "success": True,
                "new_key": result.get("new_key"),
                "expires_at": result.get("expires_at"),
                "message": "Licence réinitialisée avec succès"
            }
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Erreur lors de la réinitialisation"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@app.get("/health")
async def health_check():
    """Vérification de santé"""
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "license_server_url": LICENSE_SERVER_URL,
        "admin_token_configured": bool(ADMIN_TOKEN)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
