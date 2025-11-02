# 📋 Instructions DNS Resend pour Vercel

## 🎯 Enregistrements à ajouter dans Vercel

Ajoutez **chacun de ces enregistrements** dans Vercel → Votre projet → Settings → Domains → appsmobs.com → DNS Records

---

### 1️⃣ Enregistrement DKIM (Domain Verification)

**Cliquez sur "Add Record" dans Vercel :**

- **Type** : `TXT`
- **Name** : `resend._domainkey`
- **Value/Content** : 
  ```
  p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRrOcjaSzuUVFS5z45ZlWnq0bdcu64nJVLvdt+d3GfnMjxBjnxPYW7U4zkCm3yyh4KZolIfADV6q3QNy5EcTIN5BoI7cj4uJiqJIsVbtH6PFDCf/RoarHN53hWpehKQ9VxmMuMNMaWl5T5BFoCe7l0oEmn6deeytA2JTaFrTYOIQIDAQAB
  ```
- **TTL** : `3600` (ou laissez par défaut)

---

### 2️⃣ Enregistrement MX (Sending)

**Cliquez sur "Add Record" :**

- **Type** : `MX`
- **Name** : `send`
- **Value** : `feedback-smtp.eu-west-1.amazonses.com`
- **Priority** : `10`
- **TTL** : `60` (ou laissez par défaut)

---

### 3️⃣ Enregistrement SPF (Sending)

**Cliquez sur "Add Record" :**

- **Type** : `TXT`
- **Name** : `send`
- **Value/Content** : 
  ```
  v=spf1 include:amazonses.com ~all
  ```
- **TTL** : `60` (ou laissez par défaut)

---

### 4️⃣ Enregistrement DMARC (Optionnel mais recommandé)

**Cliquez sur "Add Record" :**

- **Type** : `TXT`
- **Name** : `_dmarc`
- **Value/Content** : 
  ```
  v=DMARC1; p=none;
  ```
- **TTL** : `3600` (ou laissez par défaut)

---

## ✅ Après avoir ajouté tous les enregistrements

1. **Sauvegardez** chaque enregistrement
2. **Attendez 5-15 minutes**
3. **Retournez sur** https://resend.com/domains
4. **Cliquez sur "Verify"** ou attendez la vérification automatique
5. Le statut devrait passer à **"Verified"** ✅

## 🎯 Résumé - Ordre d'ajout

1. ✅ TXT → `resend._domainkey` → `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRrOcjaSzuUVFS5z45ZlWnq0bdcu64nJVLvdt+d3GfnMjxBjnxPYW7U4zkCm3yyh4KZolIfADV6q3QNy5EcTIN5BoI7cj4uJiqJIsVbtH6PFDCf/RoarHN53hWpehKQ9VxmMuMNMaWl5T5BFoCe7l0oEmn6deeytA2JTaFrTYOIQIDAQAB`
2. ✅ MX → `send` → `feedback-smtp.eu-west-1.amazonses.com` (Priority: 10)
3. ✅ TXT → `send` → `v=spf1 include:amazonses.com ~all`
4. ✅ TXT → `_dmarc` → `v=DMARC1; p=none;`

Une fois vérifié, modifiez `.env` et redémarrez le serveur ! 🚀

