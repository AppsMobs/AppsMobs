# BootyBot Licence Server (mini)

## Installation

```bash
pip install -r license_server/requirements.txt
```

## Démarrage

```bash
set ADMIN_TOKEN=ton-admin-secret
uvicorn license_server.main:APP --host 0.0.0.0 --port 8000
```

Optionnel: dossier des données

```bash
set BOOTYBOT_LICENSE_DATA=C:\\data\\bootybot_licences
```

## Endpoints

- POST `/api/verify` (client)
  - Body: `{ "email": "x@x.com", "key": "..." }`
  - Réponse: `{ ok, plan, token, expires_at, message }`

- POST `/admin/create?token=ADMIN_TOKEN` (admin)
  - Body: `{ "email": "x@x.com", "plan": "pro|team", "months": 1 }`
  - Réponse: `{ ok, email, key, plan, expires_at }`

- GET `/admin/list?token=ADMIN_TOKEN` (admin)
  - Liste JSON des licences

- GET `/admin/dashboard?token=ADMIN_TOKEN` (admin)
  - Tableau HTML récapitulatif (email, plan, clé, expiration, jours restants, statut)

- POST `/admin/update?token=ADMIN_TOKEN` (admin)
  - Body: `{ email, key, plan?, months?, expires_at? }`

- POST `/admin/revoke?token=ADMIN_TOKEN` (admin)
  - Body: `{ email, key }`

## Déploiement en ligne

- Gratuit (petit trafic):
  - Render.com (Free tier), Deta Space, Railway (free), Fly.io (free crédits), ou Replit.
- Payant (fiable):
  - VPS (OVH, Hetzner), ou PaaS (Render payant, Railway payant, Heroku Eco).

Configure `ADMIN_TOKEN` et un stockage persistant pour `BOOTYBOT_LICENSE_DATA`.

## Côté client (app BootyBot)

- Définir l’URL du serveur:

```bash
set LICENSE_SERVER_URL=https://ton-domaine.tld
```

- L’app affiche une fenêtre d’activation (email + clé). Le token et le plan sont enregistrés dans:
  - Windows: `%APPDATA%/BootyBot/config.json`
  - Linux/macOS: `~/.config/bootybot/config.json`
