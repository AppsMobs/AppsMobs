# 📚 Documentation Complète - BootyBot / AppsMobs

**Version**: 2.0  
**Dernière mise à jour**: 2025

---

## 📑 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Système](#architecture-du-système)
3. [Installation et Configuration](#installation-et-configuration)
4. [Application Desktop (Electron)](#application-desktop-electron)
5. [Site Web - Frontend](#site-web---frontend)
6. [Site Web - Backend](#site-web---backend)
7. [Système de Shop et Paiements](#système-de-shop-et-paiements)
8. [Système de Parrainage (Referral)](#système-de-parrainage-referral)
9. [Système de Rewards et Tokens](#système-de-rewards-et-tokens)
10. [Scripts et Automatisation Android](#scripts-et-automatisation-android)
11. [API et Endpoints](#api-et-endpoints)
12. [Exemples Pratiques](#exemples-pratiques)
13. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

**BootyBot / AppsMobs** est une plateforme complète d'automatisation Android qui permet de :

- ✅ Contrôler plusieurs appareils Android simultanément
- ✅ Créer et exécuter des scripts Python personnalisés
- ✅ Gérer les licences via un système web complet
- ✅ Acheter des abonnements avec Stripe, PayPal ou Binance
- ✅ Gagner et échanger des tokens via un système de parrainage
- ✅ Utiliser scrcpy pour visualiser et contrôler les appareils en temps réel

### Composants Principaux

```
BootyBot/
├── 📱 Application Electron (Desktop)
│   ├── Interface graphique multi-appareils
│   ├── Éditeur de scripts intégré
│   └── Gestion de scrcpy
│
├── 🌐 Site Web
│   ├── Frontend React (Vite)
│   │   ├── Authentification
│   │   ├── Shop (achats de licences)
│   │   ├── Dashboard (gestion)
│   │   └── Système de referral
│   │
│   └── Backend Node.js (Express)
│       ├── API REST
│       ├── Authentification JWT
│       ├── Intégration Stripe/PayPal
│       └── Gestion des licences
│
└── 🤖 Core Python
    ├── Gestion multi-appareils
    ├── Fonctions Android (clic, swipe, etc.)
    ├── Détection d'images
    └── Automatisation via ADB
```

---

## 🏗️ Architecture du Système

### Stack Technologique

**Desktop (Electron)**
- Electron.js
- Node.js
- Python 3.9+
- ADB (Android Debug Bridge)
- scrcpy

**Frontend Web**
- React 18
- Vite
- React Router
- Tailwind CSS
- Stripe.js
- PayPal SDK

**Backend Web**
- Node.js / Express
- JWT (jsonwebtoken)
- bcryptjs
- Supabase (PostgreSQL)
- Stripe API
- PayPal API
- Resend (emails)

**Core Python**
- Python 3.9
- scrcpy-client
- adbutils
- PyAV
- OpenCV

### Base de Données (Supabase)

**Tables Principales:**

- `users` - Comptes utilisateurs
- `licenses` - Licences actives
- `orders` - Historique des commandes
- `user_tokens` - Balance de tokens
- `referral_codes` - Codes de parrainage
- `referrals` - Relations de parrainage

---

## ⚙️ Installation et Configuration

### Prérequis

1. **Windows 10/11 (64-bit)**
2. **Python 3.9+**
3. **Node.js 18+**
4. **ADB** (Android Debug Bridge)
5. **Compte Supabase** (base de données)
6. **Comptes Stripe/PayPal** (pour les paiements)

### Installation Pas à Pas

#### 1. Cloner le Repository

```bash
git clone <votre-repo>
cd BootyBot
```

#### 2. Configuration Python

```bash
# Créer un environnement virtuel
python -m venv .venv

# Activer (Windows)
.venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

#### 3. Configuration Backend

```bash
cd website/auth-backend

# Installer les dépendances
npm install

# Configurer .env
cp .env.example .env
```

**Fichier `.env` (backend):**
```env
# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:5174

# Database (Supabase)
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_KEY=votre_service_key

# JWT
JWT_SECRET=votre_secret_jwt_minimum_32_caracteres

# Email (Resend)
RESEND_API_KEY=re_votre_cle_resend

# Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle

# PayPal
PAYPAL_CLIENT_ID=votre_client_id
PAYPAL_CLIENT_SECRET=votre_secret
PAYPAL_MODE=sandbox

# reCAPTCHA
RECAPTCHA_SECRET_KEY=votre_secret_recaptcha
```

#### 4. Configuration Frontend

```bash
cd website

# Installer les dépendances
npm install

# Configurer .env
```

**Fichier `.env` (frontend):**
```env
VITE_API_URL=http://localhost:3001
VITE_RECAPTCHA_SITE_KEY=votre_site_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
VITE_PAYPAL_CLIENT_ID=votre_client_id
```

#### 5. Configuration Supabase

Créez les tables nécessaires :

```sql
-- Table users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table licenses
CREATE TABLE licenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('normal', 'pro', 'team')),
  expires_at BIGINT,
  payment_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table user_tokens
CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email TEXT UNIQUE NOT NULL,
  tokens INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
);

-- Table referral_codes
CREATE TABLE referral_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table referrals
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES users(id),
  referrer_email TEXT NOT NULL,
  referee_email TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  tokens_awarded INTEGER DEFAULT 0,
  purchase_made BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Lancer l'Application

#### Desktop (Electron)
```bash
cd electron-app
npm install
npm start
```

#### Backend Web
```bash
cd website/auth-backend
npm run dev
```

#### Frontend Web
```bash
cd website
npm run dev
```

---

## 🖥️ Application Desktop (Electron)

### Fonctionnalités Principales

1. **Gestion Multi-Appareils**
   - Détection automatique des appareils Android connectés
   - Contrôle simultané de plusieurs appareils
   - Visualisation en temps réel avec scrcpy

2. **Éditeur de Scripts**
   - Éditeur Python intégré
   - Blocs de code prêts à l'emploi
   - Coloration syntaxique
   - Auto-complétion

3. **Exécution de Scripts**
   - Exécution sur un ou plusieurs appareils
   - Logs en temps réel
   - Capture d'écran automatique

### Interface Utilisateur

```
┌─────────────────────────────────────────────┐
│  Dashboard  │  Scripts  │  Console  │  ...  │
├─────────────────────────────────────────────┤
│                                             │
│  [Liste des appareils connectés]           │
│                                             │
│  Device 1: CONNECTÉ                         │
│  Device 2: CONNECTÉ                         │
│                                             │
│  [Sélectionner Script]                      │
│  [▶ Lancer sur sélectionnés]                │
│                                             │
└─────────────────────────────────────────────┘
```

### Fonctions Disponibles dans les Scripts

```python
# Contrôles de base
click(android_client, x, y)
doubleclick(android_client, x, y)
swipe(android_client, x1, y1, x2, y2, duration=700)
write(android_client, "texte")

# Navigation
back(android_client)
home(android_client)
enter(android_client)

# Détection d'images
find_image(android_client, "image.png", confidence=0.8)
find_image_and_click(android_client, "image.png")
find_image_bool(android_client, "image.png")

# Swipes rapides
swipe_up(android_client)
swipe_down(android_client)
swipe_left(android_client)
swipe_right(android_client)

# Utilitaires
random_delay(min_sec, max_sec)
wait_for_image(android_client, "image.png", timeout=10)
screenshot(android_client, "filename.png")
```

---

## 🌐 Site Web - Frontend

### Pages Principales

#### 1. Page d'Accueil (`/`)

**Fonctionnalités:**
- Présentation du produit
- Témoignages
- Fonctionnalités clés
- Appels à l'action

**Composants:**
- Hero section avec animation
- Feature cards
- Pricing preview
- FAQ

#### 2. Page Shop (`/shop`)

**Fonctionnalités:**
- Sélection de plan (Normal, Pro, Team)
- Choix de durée (1, 3, 6, 12 mois)
- Calcul automatique des réductions
- Intégration Stripe/PayPal

**Exemple de Prix:**
```javascript
const basePrices = {
  normal: 29,   // €/mois
  pro: 59,      // €/mois
  team: 119     // €/mois
};

const discounts = {
  1: 0,    // Pas de réduction
  3: 5,   // 5% de réduction
  6: 10,  // 10% de réduction
  12: 20  // 20% de réduction
};
```

**Exemples de Calculs:**

| Plan | Durée | Prix Mensuel | Total | Réduction | Prix Final |
|------|-------|--------------|-------|-----------|------------|
| Normal | 1 mois | 9€ | 9€ | 0% | **9€** |
| Normal | 3 mois | 9€ | 27€ | 5% | **25.65€** |
| Normal | 6 mois | 9€ | 54€ | 10% | **48.60€** |
| Normal | 12 mois | 9€ | 108€ | 20% | **86.40€** |
| | | | | | |
| Pro | 1 mois | 15€ | 15€ | 0% | **15€** |
| Pro | 3 mois | 15€ | 45€ | 5% | **42.75€** |
| Pro | 6 mois | 15€ | 90€ | 10% | **81.00€** |
| Pro | 12 mois | 15€ | 180€ | 20% | **144.00€** |
| | | | | | |
| Team | 1 mois | 45€ | 45€ | 0% | **45€** |
| Team | 3 mois | 45€ | 135€ | 5% | **128.25€** |
| Team | 6 mois | 45€ | 270€ | 10% | **243.00€** |
| Team | 12 mois | 45€ | 540€ | 20% | **432.00€** |

**Plan 1 Semaine (Tokens):**
- Coût: 100 tokens
- Fonctionnalités: Identique au plan Normal
- Parfait pour tester avant d'acheter

**Interface Shop:**
```
┌─────────────────────────────────────────────────────────┐
│  Sélection de Durée:                                    │
│  [1 Mois] [3 Mois -5%] [6 Mois -10%] [12 Mois -20%]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────┐  ┌───────────────────┐         │
│  │  Plan Normal      │  │  Plan Pro          │         │
│  │  9€/mois          │  │  15€/mois          │         │
│  │                   │  │  ⭐ Most Popular   │         │
│  │  ✅ 1 appareil    │  │  ✅ 2 appareils    │         │
│  │  ✅ Scripts base  │  │  ✅ Toutes features│         │
│  │  ✅ Support email │  │  ✅ Support prior. │         │
│  │                   │  │  ✅ API access     │         │
│  │  Total: 9€        │  │  Total: 15€        │         │
│  │  [💳 Acheter]     │  │  [💳 Acheter]      │         │
│  └───────────────────┘  └───────────────────┘         │
│                                                         │
│  ┌───────────────────┐  ┌───────────────────┐         │
│  │  Plan Team        │  │  1 Week Trial     │         │
│  │  45€/mois         │  │  🪙 Token Purchase │         │
│  │  💎 Best Value    │  │                    │         │
│  │  ✅ 5 appareils   │  │  ✅ 1 appareil    │         │
│  │  ✅ Features team │  │  ✅ Toutes features│         │
│  │  ✅ SSO           │  │  ✅ Pour tester    │         │
│  │  ✅ Audit logs    │  │                    │         │
│  │                   │  │  Coût: 100 tokens │         │
│  │  Total: 45€      │  │  [🪙 Acheter]     │         │
│  │  [💳 Acheter]     │  └───────────────────┘         │
│  └───────────────────┘                                 │
│                                                         │
│  Méthode de Paiement (après sélection):               │
│  [💳 Stripe] [PayPal] [Binance]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3. Page Dashboard (`/dashboard`)

**Sections:**

1. **My Licenses** - Liste des licences actives
2. **Order History** - Historique des achats
3. **Referrals & Tokens** - Gestion des tokens
4. **Profile Settings** - Paramètres du compte
5. **Contact Support** - Support client

#### 4. Authentification

**Pages:**
- `/login` - Connexion
- `/register` - Inscription
- `/forgot-password` - Réinitialisation mot de passe
- `/verify-email` - Vérification email

---

## 🔧 Site Web - Backend

### Architecture API

**Base URL:** `http://localhost:3001/api`

### Endpoints Principaux

#### Authentification

```javascript
POST /api/register
Body: {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  country: string,
  recaptchaToken: string
}
Response: {
  message: "Compte créé avec succès",
  emailSent: boolean
}

POST /api/login
Body: {
  email: string,
  password: string,
  recaptchaToken: string
}
Response: {
  token: "jwt_token",
  user: { id, email, emailVerified }
}

GET /api/me
Headers: { Authorization: "Bearer <token>" }
Response: {
  user: { id, email, emailVerified }
}
```

#### Gestion des Licences

```javascript
POST /api/create-license
Headers: { Authorization: "Bearer <token>" }
Body: {
  plan: "normal" | "pro" | "team",
  months: number,
  paymentIntentId: string  // Stripe
}
Response: {
  license: {
    key: "LICENSE_KEY",
    plan: "normal",
    expires_at: timestamp
  }
}
```

---

## 💳 Système de Shop et Paiements

### Options de Paiement

#### 1. Stripe (Cartes Bancaires)

**Configuration:**
```javascript
// Backend
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Créer une session de paiement
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: `AppsMobs ${plan} License`,
        description: `${months} month(s)`
      },
      unit_amount: finalPrice * 100  // En centimes
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: `${FRONTEND_URL}/shop?success=true`,
  cancel_url: `${FRONTEND_URL}/shop?canceled=true`,
  customer_email: userEmail
});
```

**Flux de Paiement Stripe:**

```
1. Utilisateur sélectionne plan → Frontend
2. Clic "Stripe" → Frontend appelle /api/create-stripe-session
3. Backend crée session Stripe → Retourne sessionId
4. Frontend redirige vers Stripe Checkout
5. Paiement effectué → Redirection vers /shop?success=true&session_id=xxx
6. Frontend appelle /api/verify-stripe-payment
7. Backend vérifie le paiement → Crée la licence → Envoie email
```

#### 2. PayPal

**Configuration:**
```javascript
const paypal = require('@paypal/checkout-server-sdk');

// Environnement PayPal
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

// Créer une commande
const request = new paypal.orders.OrdersCreateRequest();
request.prefer("return=representation");
request.requestBody({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: {
      currency_code: 'EUR',
      value: finalPrice.toString()
    },
    description: `AppsMobs ${plan} - ${months} month(s)`
  }]
});
```

**Flux de Paiement PayPal:**

```
1. Utilisateur sélectionne plan → Frontend
2. Clic "PayPal" → Affiche boutons PayPal SDK
3. Utilisateur clique "PayPal" → SDK crée commande
4. Redirection PayPal → Paiement
5. Retour → Frontend reçoit orderId
6. Frontend appelle /api/verify-paypal-payment
7. Backend capture le paiement → Crée la licence → Envoie email
```

#### 3. Binance Pay (Virement)

**Configuration:**
```javascript
POST /api/create-binance-order
Headers: { Authorization: "Bearer <token>" }
Body: {
  plan: "normal" | "pro" | "team",
  months: number
}
Response: {
  reference: "UNIQUE_REFERENCE",
  amount: number,
  instructions: "Instructions pour virement..."
}
```

**Flux Binance:**

```
1. Utilisateur sélectionne plan → Frontend
2. Clic "Binance" → Frontend appelle /api/create-binance-order
3. Backend crée commande en attente → Génère référence unique
4. Backend envoie instructions par email
5. Utilisateur effectue virement avec référence
6. Admin valide le virement manuellement → Active la licence
```

### Calcul des Prix

```javascript
// Exemple: Plan Pro, 6 mois
const basePrice = 59;           // €/mois
const months = 6;
const total = basePrice * months;  // 354€
const discountPercent = 10;        // 10% pour 6 mois
const discount = total * (discountPercent / 100);  // 35.4€
const finalPrice = total - discount;  // 318.6€
```

---

## 🎁 Système de Parrainage (Referral)

### Fonctionnement

#### 1. Génération du Code de Parrainage

**Lors de l'inscription:**
- Un code unique est généré automatiquement
- Format: `REF-XXXXXXXX` (8 caractères aléatoires)
- Stocké dans `referral_codes`

**Récupération:**
```javascript
GET /api/my-referral-code
Headers: { Authorization: "Bearer <token>" }
Response: {
  code: "REF-ABC12345",
  usage_count: 5,
  referralLink: "https://votre-site.com/register?ref=REF-ABC12345"
}
```

#### 2. Application du Code

**Lors de l'inscription d'un nouvel utilisateur:**
```
1. Nouvel utilisateur s'inscrit avec code referral: REF-ABC12345
2. Backend vérifie que le code existe
3. Backend crée enregistrement dans table `referrals`
4. Status: purchase_made = false (pas encore d'achat)
```

**API:**
```javascript
POST /api/apply-referral-code
Body: {
  code: "REF-ABC12345",
  email: "nouvel.utilisateur@email.com"
}
Response: {
  success: true,
  message: "Code appliqué avec succès"
}
```

#### 3. Attribution des Tokens

**Après un achat réussi:**
```javascript
// Fonction automatique côté backend
async function awardReferralTokens(refereeEmail) {
  // 1. Trouver le referral actif
  const referral = await findActiveReferral(refereeEmail);
  
  if (!referral || referral.purchase_made) return;
  
  // 2. Attribuer 10 tokens au référant
  const TOKENS_PER_REFERRAL = 10;
  await updateTokens(
    referral.referrer_email,
    TOKENS_PER_REFERRAL
  );
  
  // 3. Marquer comme complété
  await markReferralComplete(referral.id);
}
```

**Conditions:**
- ✅ Le référé doit avoir utilisé le code lors de l'inscription
- ✅ Le référé doit effectuer un achat (n'importe quel plan)
- ✅ L'achat doit être payé avec succès
- ✅ Les tokens sont attribués uniquement une fois par referral

### Interface Dashboard

```
┌─────────────────────────────────────────┐
│  Referrals & Tokens                     │
├─────────────────────────────────────────┤
│                                         │
│  Votre Code de Parrainage:              │
│  REF-ABC12345                           │
│  [📋 Copier le lien]                    │
│                                         │
│  Votre Lien:                             │
│  https://appsmobs.com/register?ref=...  │
│                                         │
│  Statistiques:                           │
│  ✅ 5 personnes inscrites               │
│  💰 50 tokens gagnés                    │
│                                         │
│  Vos Tokens:                             │
│  🪙 150 tokens disponibles              │
│  💰 200 tokens gagnés au total          │
│  ✅ 50 tokens échangés                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🪙 Système de Rewards et Tokens

### Mécanisme des Tokens

#### Gain de Tokens

**1. Par Parrainage:**
- 10 tokens par personne référée qui achète
- Attribués automatiquement après le paiement

**2. Par Achat (Bonus):**
- Système extensible pour bonus sur achat

#### Échange de Tokens

**Conversion:**
- **100 tokens = 1 semaine de licence gratuite**
- Maximum: 4 semaines par transaction (400 tokens)

**API:**
```javascript
POST /api/redeem-tokens
Headers: { Authorization: "Bearer <token>" }
Body: {
  weeks: 1-4  // Nombre de semaines (1 semaine = 100 tokens)
}
Response: {
  message: "1 semaine de licence créée",
  license: {
    key: "LICENSE_KEY",
    expires_at: timestamp
  },
  tokens: {
    remaining: 50,
    total_earned: 200,
    total_redeemed: 150
  }
}
```

### Gestion des Tokens

**Structure de données:**
```sql
CREATE TABLE user_tokens (
  user_id INTEGER,
  email TEXT UNIQUE,
  tokens INTEGER DEFAULT 0,          -- Balance actuelle
  total_earned INTEGER DEFAULT 0,   -- Total gagné
  total_redeemed INTEGER DEFAULT 0  -- Total échangé
);
```

**Exemple de calcul:**
```
Tokens initiaux: 0
+ 10 tokens (referral 1) = 10
+ 10 tokens (referral 2) = 20
+ 10 tokens (referral 3) = 30
- 100 tokens (1 semaine) = -70 (impossible, minimum 100 requis)
+ 80 tokens (referrals supplémentaires) = 100
- 100 tokens (1 semaine) = 0
```

### Interface Tokens

```
┌─────────────────────────────────────────┐
│  Échanger des Tokens                    │
├─────────────────────────────────────────┤
│                                         │
│  Balance: 150 tokens                    │
│                                         │
│  Sélectionner semaines:                 │
│  [1] [2] [3] [4]                        │
│                                         │
│  Coût: 100 tokens (1 semaine)          │
│                                         │
│  [🪙 Échanger 100 tokens]                │
│                                         │
│  Historique:                             │
│  ✅ 2025-01-15: +10 tokens (referral)   │
│  ✅ 2025-01-20: +10 tokens (referral)   │
│  ✅ 2025-01-25: -100 tokens (1 semaine) │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📜 Scripts et Automatisation Android

### Création d'un Script

#### Structure de Base

```python
# scripts/mon_script.py

def my_script(android_client, device_serial, **kwargs):
    """
    Votre script d'automatisation
    
    Args:
        android_client: Instance pour contrôler l'appareil
        device_serial: Numéro de série de l'appareil
        **kwargs: Paramètres optionnels
    
    Returns:
        dict: {'success': bool, 'message': str, 'data': {}}
    """
    result = {
        'success': False,
        'message': '',
        'data': {}
    }
    
    try:
        # VOTRE CODE ICI
        
        result['success'] = True
        result['message'] = 'Script exécuté avec succès'
        
    except Exception as e:
        result['message'] = f'Erreur: {str(e)}'
    
    return result

# Informations du script (obligatoire)
SCRIPT_INFO = {
    'name': 'Mon Script',
    'description': 'Description de ce que fait le script',
    'author': 'Votre Nom',
    'version': '1.0.0',
    'max_duration': 60  # Secondes
}
```

#### Exemple Complet: Ouverture d'une App

```python
from core.android_functions import click, wait, find_image

def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        # 1. Ouvrir le menu apps
        android_client.shell("input keyevent KEYCODE_HOME")
        wait(1)
        
        # 2. Chercher l'icône YouTube
        if find_image(android_client, "youtube_icon.png", confidence=0.8):
            click(android_client, *find_image(android_client, "youtube_icon.png"))
            result['success'] = True
            result['message'] = 'YouTube ouvert avec succès'
        else:
            result['message'] = 'Icône YouTube non trouvée'
            
    except Exception as e:
        result['message'] = f'Erreur: {e}'
    
    return result

SCRIPT_INFO = {
    'name': 'Ouvrir YouTube',
    'description': 'Ouvre l\'application YouTube',
    'author': 'Vous',
    'version': '1.0.0',
    'max_duration': 30
}
```

### Fonctions Disponibles

#### Contrôles de Base

```python
# Clic simple
click(android_client, x, y)

# Double-clic
doubleclick(android_client, x, y)

# Swipe
swipe(android_client, x1, y1, x2, y2, duration=700)

# Taper du texte
write(android_client, "mon texte")

# Navigation
back(android_client)        # Touche retour
home(android_client)        # Bouton home
enter(android_client)       # Touche entrée
```

#### Détection d'Images

```python
# Chercher une image (retourne position ou None)
position = find_image(android_client, "button.png", confidence=0.8)
if position:
    x, y = position

# Vérifier si une image existe (retourne booléen)
exists = find_image_bool(android_client, "button.png")

# Chercher et cliquer automatiquement
clicked = find_image_and_click(android_client, "button.png")
```

#### Swipes Rapides

```python
swipe_up(android_client)      # Défiler vers le haut
swipe_down(android_client)    # Défiler vers le bas
swipe_left(android_client)    # Défiler vers la gauche
swipe_right(android_client)   # Défiler vers la droite
```

#### Utilitaires

```python
# Délai aléatoire
random_delay(1, 3)  # Attendre entre 1 et 3 secondes

# Attendre qu'une image apparaisse
wait_for_image(android_client, "image.png", timeout=10)

# Capturer l'écran
screenshot(android_client, "screenshot.png")

# Long press
long_press(android_client, x, y, duration=2000)
```

### Exécution des Scripts

#### Via l'Interface Electron

1. Ouvrir l'application
2. Connecter les appareils Android
3. Aller dans l'onglet "Scripts"
4. Sélectionner un script
5. Sélectionner les appareils
6. Cliquer "Lancer"

#### Via Ligne de Commande

```python
from core.multi_device_manager import MultiDeviceManager

manager = MultiDeviceManager()

# Configurer un appareil
manager.setup_device("DEVICE_SERIAL")

# Importer et exécuter le script
from scripts.mon_script import my_script
manager.run_script_on_device("DEVICE_SERIAL", my_script)
```

---

## 🔌 API et Endpoints

### Endpoints d'Authentification

#### Inscription
```
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "country": "FR",
  "recaptchaToken": "token_recaptcha"
}
```

#### Connexion
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "recaptchaToken": "token_recaptcha"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

### Endpoints Shop

#### Créer Session Stripe
```
POST /api/create-stripe-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "pro",
  "months": 6
}

Response:
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### Vérifier Paiement Stripe
```
POST /api/verify-stripe-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "cs_test_..."
}

Response:
{
  "success": true,
  "license": {
    "key": "LIC-ABC123...",
    "plan": "pro",
    "expires_at": 1735689600
  }
}
```

### Endpoints Referral

#### Récupérer Code de Parrainage
```
GET /api/my-referral-code
Authorization: Bearer <token>

Response:
{
  "code": "REF-ABC12345",
  "usage_count": 5
}
```

#### Appliquer Code de Parrainage
```
POST /api/apply-referral-code
Content-Type: application/json

{
  "code": "REF-ABC12345",
  "email": "newuser@example.com"
}
```

### Endpoints Tokens

#### Récupérer Tokens
```
GET /api/my-tokens
Authorization: Bearer <token>

Response:
{
  "tokens": {
    "tokens": 150,
    "total_earned": 200,
    "total_redeemed": 50
  }
}
```

#### Échanger Tokens
```
POST /api/redeem-tokens
Authorization: Bearer <token>
Content-Type: application/json

{
  "weeks": 1
}

Response:
{
  "message": "1 semaine de licence créée",
  "license": {
    "key": "LIC-...",
    "expires_at": 1735689600
  },
  "tokens": {
    "remaining": 50,
    "total_earned": 200,
    "total_redeemed": 150
  }
}
```

---

## 📝 Exemples Pratiques

### Exemple 1: Script de Like Instagram

```python
from core.android_functions import (
    find_image_and_click, swipe_up, random_delay, wait
)

def my_script(android_client, device_serial, **kwargs):
    result = {'success': False, 'message': '', 'data': {}}
    
    try:
        likes_count = 0
        max_likes = kwargs.get('max_likes', 10)
        
        for i in range(max_likes):
            # Chercher et cliquer sur le bouton like
            if find_image_and_click(android_client, "like_button.png", confidence=0.8):
                likes_count += 1
                wait(1)
                
                # Swipe pour passer au post suivant
                swipe_up(android_client)
                random_delay(2, 4)
            else:
                # Si pas de like trouvé, swiper quand même
                swipe_up(android_client)
                random_delay(2, 4)
        
        result['success'] = True
        result['message'] = f'{likes_count} likes effectués'
        result['data'] = {'likes': likes_count}
        
    except Exception as e:
        result['message'] = f'Erreur: {e}'
    
    return result

SCRIPT_INFO = {
    'name': 'Instagram Auto Like',
    'description': 'Like automatiquement des posts Instagram',
    'author': 'Vous',
    'version': '1.0.0',
    'max_duration': 300
}
```

### Exemple 2: Achat Complet via Shop

**Scénario:** Utilisateur achète le plan Pro pour 6 mois avec Stripe

**Flux Complet:**

```javascript
// 1. Utilisateur sélectionne "Pro" et "6 mois"
const selectedPlan = {
  plan: 'pro',
  name: 'Pro'
};
const selectedDuration = 6;

// 2. Calcul automatique du prix
const basePrice = 59;  // €/mois
const total = basePrice * selectedDuration;  // 354€
const discountPercent = 10;  // 10% pour 6 mois
const discount = total * (discountPercent / 100);  // 35.4€
const finalPrice = total - discount;  // 318.6€

// 3. Utilisateur clique "Stripe"
// Frontend appelle:
const response = await fetch(`${API_URL}/api/create-stripe-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    plan: 'pro',
    months: 6
  })
});

// 4. Backend crée session Stripe
// Retourne: { sessionId: "cs_test_...", url: "https://checkout.stripe.com/..." }

// 5. Redirection vers Stripe Checkout
window.location.href = data.url;

// 6. Après paiement, redirection vers /shop?success=true&session_id=xxx

// 7. Frontend vérifie le paiement
const verifyResponse = await fetch(`${API_URL}/api/verify-stripe-payment`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sessionId: sessionId
  })
});

// 8. Backend vérifie, crée licence, envoie email
// Retourne: {
//   license: { key: "LIC-...", plan: "pro", expires_at: ... }
// }

// 9. Utilisateur reçoit email avec la clé de licence
```

### Exemple 3: Achat Automatique avec Tokens

**Scénario:** Un utilisateur veut acheter une licence de 1 semaine avec ses tokens

```javascript
// Frontend (React)
const handlePurchaseWithTokens = async () => {
  const token = localStorage.getItem('authToken');
  
  // Vérifier la balance
  const tokensRes = await fetch(`${API_URL}/api/my-tokens`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { tokens } = await tokensRes.json();
  
  if (tokens.tokens < 100) {
    alert('Pas assez de tokens. Minimum 100 requis.');
    return;
  }
  
  // Échanger 100 tokens pour 1 semaine
  const redeemRes = await fetch(`${API_URL}/api/redeem-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ weeks: 1 })
  });
  
  const data = await redeemRes.json();
  
  if (redeemRes.ok) {
    alert(`Licence créée ! Clé: ${data.license.key}`);
    // Mettre à jour l'affichage des tokens
  } else {
    alert(`Erreur: ${data.error}`);
  }
};
```

### Exemple 4: Système de Parrainage Complet

**Flux complet:**

```
1. Utilisateur A s'inscrit
   → Code généré: REF-ABC12345
   → Stocké dans referral_codes

2. Utilisateur A partage son lien:
   https://appsmobs.com/register?ref=REF-ABC12345

3. Utilisateur B s'inscrit avec ce lien
   → Code automatiquement pré-rempli
   → Backend crée enregistrement dans referrals:
     - referrer_email: userA@email.com
     - referee_email: userB@email.com
     - purchase_made: false

4. Utilisateur B achète une licence (Stripe/PayPal)
   → Paiement confirmé
   → Fonction awardReferralTokens() appelée automatiquement
   → 10 tokens ajoutés au compte de User A
   → referral.purchase_made = true

5. User A voit ses tokens dans le Dashboard
   → Peut échanger 100 tokens pour 1 semaine gratuite
```

---

## 🔧 Dépannage

### Problèmes Courants

#### 1. Appareil non détecté

**Symptôme:** L'appareil n'apparaît pas dans la liste

**Solutions:**
- Vérifier que le débogage USB est activé
- Accepter l'empreinte sur le téléphone
- Vérifier le câble USB (doit supporter les données)
- Redémarrer ADB: `adb kill-server && adb start-server`

#### 2. Script ne s'exécute pas

**Symptôme:** Le script ne démarre pas ou s'arrête immédiatement

**Solutions:**
- Vérifier les logs dans la console
- Vérifier que le script a la bonne signature: `my_script(android_client, device_serial, **kwargs)`
- Vérifier que `SCRIPT_INFO` est présent
- Vérifier les permissions sur le téléphone

#### 3. Paiement Stripe échoue

**Symptôme:** La session Stripe ne se crée pas

**Solutions:**
- Vérifier que `STRIPE_SECRET_KEY` est configuré dans `.env`
- Vérifier que la clé est valide (mode test ou production)
- Vérifier les logs du backend pour l'erreur exacte

#### 4. Tokens non attribués après referral

**Symptôme:** Un utilisateur a acheté mais les tokens ne sont pas attribués

**Solutions:**
- Vérifier que le referral existe dans la table `referrals`
- Vérifier que `purchase_made` est bien passé à `true`
- Vérifier les logs du backend pour `awardReferralTokens()`
- Vérifier manuellement dans Supabase

---

## 📞 Support

Pour toute question ou problème:
- 📧 Email: support@appsmobs.com
- 📚 Documentation: https://docs.appsmobs.com
- 💬 Discord: [Lien Discord]

---

**Documentation générée le:** Janvier 2025  
**Version:** 2.0
