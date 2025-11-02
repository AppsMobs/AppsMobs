# 🔍 Debug Email - Le compte existe mais pas d'email

## Situation
Le compte est créé dans Supabase mais l'email de vérification n'est pas envoyé.

## Solutions

### Solution 1 : Utiliser le bouton "Renvoyer l'email" sur le site

1. Allez sur la page `/resend-verification` de votre site
2. Entrez votre email
3. Cliquez sur "Renvoyer"
4. Regardez les logs du serveur backend pour voir ce qui se passe

### Solution 2 : Vérifier les logs du serveur

Quand vous utilisez "Renvoyer l'email", vous devriez voir dans les logs :

```
📧 Demande de renvoi d'email pour: votre@email.com
   ✅ Token généré: abc1234567...
   📤 Envoi de l'email...
   📤 Envoi via Resend...
   From: onboarding@resend.dev
   To: votre@email.com
✅ Email de vérification envoyé avec succès à votre@email.com
📧 Email ID: ...
   ✅ Email renvoyé avec succès
```

### Solution 3 : Tester directement depuis le terminal

Si le serveur backend tourne, testez avec curl ou PowerShell :

**PowerShell :**
```powershell
$body = @{ email = "votre@email.com" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/api/resend-verification" -Method POST -Body $body -ContentType "application/json"
```

### Solution 4 : Vérifier l'email exact dans Supabase

L'email dans Supabase doit correspondre exactement à celui que vous utilisez. Vérifiez :
- Pas d'espaces avant/après
- Majuscules/minuscules (bien que normalement ignorées)
- Caractères spéciaux correctement encodés

### Solution 5 : Vérifier que le serveur backend est bien démarré

Assurez-vous que le serveur backend tourne sur le port 3001. Au démarrage, vous devriez voir :

```
🚀 Serveur d'authentification démarré sur le port 3001
📧 Email: Resend actif - Envoi depuis: onboarding@resend.dev
```

### Solution 6 : Vérifier les erreurs dans les logs

Si vous voyez une erreur dans les logs, elle indiquera le problème exact :

**Exemple d'erreur Resend :**
```
❌ Erreur envoi email Resend: {
  "message": "...",
  "statusCode": 422
}
```

## Problèmes courants

### "Utilisateur non trouvé"
- L'email dans Supabase ne correspond pas exactement
- Vérifiez dans Supabase quelle est l'adresse email exacte

### "Email déjà vérifié"
- Le compte est déjà vérifié, vous pouvez vous connecter directement

### Email envoyé mais pas reçu
- Vérifiez le dossier spam
- Il peut y avoir un délai de quelques secondes
- Vérifiez dans https://resend.com/emails si l'email est bien envoyé

## Test rapide

1. Redémarrez le serveur backend
2. Allez sur `/resend-verification` sur votre site
3. Entrez votre email (celui avec lequel vous vous êtes inscrit)
4. Cliquez sur "Renvoyer"
5. Regardez les logs du serveur backend
6. Vérifiez votre boîte email (et spam)

Si vous voyez `✅ Email renvoyé avec succès` dans les logs mais que vous ne recevez pas l'email, le problème vient de Resend ou de votre fournisseur email.

