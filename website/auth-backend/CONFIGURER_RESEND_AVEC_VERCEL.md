# 📧 Configurer Resend avec un domaine Vercel

## 🎯 Objectif
Ajouter les enregistrements DNS de Resend à votre domaine `appsmobs.com` qui est utilisé avec Vercel.

## ⚠️ Important
Vercel **ne gère PAS directement les DNS** de votre domaine. Les DNS sont gérés par :
- Votre registrar (ex: Namecheap, GoDaddy, Cloudflare, etc.)
- OU par Vercel si vous avez transféré les DNS à Vercel

## 📋 Étapes détaillées

### Étape 1 : Identifier où sont gérés vos DNS

#### Option A : DNS gérés par votre Registrar (le plus courant)

1. **Identifiez votre registrar** :
   - Où avez-vous acheté le domaine `appsmobs.com` ?
   - Exemples : Namecheap, GoDaddy, Google Domains, Cloudflare, etc.

2. **Connectez-vous** à votre compte registrar

3. **Trouvez la gestion DNS** :
   - Cherchez "DNS Management", "Domain Settings", ou "DNS Records"
   - Le chemin peut être : Domain → DNS Settings → Manage DNS

#### Option B : DNS gérés par Vercel

Si vous avez transféré les DNS à Vercel :

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Domains**
4. Cliquez sur votre domaine `appsmobs.com`
5. Cliquez sur **DNS Records** ou **Configure DNS**

### Étape 2 : Obtenir les enregistrements DNS de Resend

1. **Connectez-vous à Resend** : https://resend.com/login
2. Allez dans **Domains** : https://resend.com/domains
3. Cliquez sur **"Add Domain"**
4. Entrez `appsmobs.com`
5. **Copiez les enregistrements DNS** que Resend vous donne :
   - Généralement 2-3 enregistrements **TXT** pour DKIM
   - 1 enregistrement **TXT** pour SPF (optionnel mais recommandé)

Exemple de ce que vous verrez :
```
Type: TXT
Name: resend._domainkey
Value: p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...

Type: TXT
Name: resend._domainkey
Value: p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...

Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

### Étape 3 : Ajouter les enregistrements DNS

#### Si DNS gérés par votre Registrar :

1. **Allez dans la gestion DNS** de votre registrar
2. **Trouvez la section "DNS Records"** ou "Zone File"
3. **Ajoutez chaque enregistrement** un par un :

   Pour chaque enregistrement DKIM :
   - **Type** : `TXT`
   - **Name/Host** : `resend._domainkey` (ou ce que Resend vous donne)
   - **Value/Data** : La longue chaîne fournie par Resend
   - **TTL** : `3600` (ou laissez par défaut)

   Pour SPF :
   - **Type** : `TXT`
   - **Name/Host** : `@` (ou laissez vide selon votre registrar)
   - **Value/Data** : `v=spf1 include:resend.com ~all`
   - **TTL** : `3600`

4. **Sauvegardez** chaque enregistrement

#### Si DNS gérés par Vercel :

1. Allez dans **Vercel Dashboard** → Votre projet → **Settings** → **Domains**
2. Cliquez sur `appsmobs.com`
3. Cliquez sur **"DNS Records"** ou **"Configure DNS"**
4. **Ajoutez les enregistrements** comme ci-dessus
5. **Sauvegardez**

### Étape 4 : Vérifier dans Resend

1. **Retournez sur** https://resend.com/domains
2. **Attendez quelques minutes** (la propagation DNS peut prendre jusqu'à 24h, mais généralement quelques minutes)
3. **Cliquez sur "Verify"** ou attendez la vérification automatique
4. Le statut devrait passer à **"Verified"** ✅

### Étape 5 : Configurer votre application

Une fois le domaine vérifié dans Resend :

1. **Ouvrez** `website/auth-backend/.env`
2. **Modifiez** :
   ```env
   RESEND_API_KEY=re_CHFVekMv_4Mo6rE4rv3dYbhThaJQVY69F
   EMAIL_FROM=support@appsmobs.com
   ```
3. **Redémarrez** le serveur backend

## 🔍 Vérifier que vos DNS fonctionnent

### Commande PowerShell pour tester :

```powershell
# Tester les enregistrements DKIM
Resolve-DnsName -Name resend._domainkey.appsmobs.com -Type TXT

# Tester SPF
Resolve-DnsName -Name appsmobs.com -Type TXT
```

Vous devriez voir les valeurs que vous avez ajoutées.

## ⚠️ Problèmes courants

### "Les enregistrements n'apparaissent pas"

- Attendez 10-15 minutes (propagation DNS)
- Vérifiez que vous avez bien sauvegardé les enregistrements
- Vérifiez que vous êtes dans la bonne section DNS

### "Vercel ne me laisse pas ajouter des enregistrements"

- Vérifiez que vous êtes bien dans la section DNS de Vercel
- Si votre domaine est juste connecté à Vercel (sans transfert DNS), utilisez votre registrar

### "Le domaine reste en attente de vérification"

- Attendez jusqu'à 24 heures (mais généralement 5-15 minutes)
- Vérifiez que les enregistrements DNS sont corrects
- Utilisez `dig` ou `nslookup` pour vérifier

## 💡 Astuce

**Ne supprimez PAS les enregistrements existants** (comme ceux de Vercel). Ajoutez simplement les nouveaux enregistrements Resend à côté.

Les enregistrements peuvent coexister sans problème.

## 🎯 Résumé rapide

1. Identifiez où sont gérés vos DNS (Registrar ou Vercel)
2. Obtenez les enregistrements DNS depuis Resend
3. Ajoutez les enregistrements TXT dans votre gestionnaire DNS
4. Attendez la vérification dans Resend
5. Changez `EMAIL_FROM` dans `.env`
6. Redémarrez le serveur

Une fois fait, vous pourrez envoyer des emails à n'importe quelle adresse depuis `support@appsmobs.com` ! 🎉

