# 🔧 Fix : Problème de Multiplicité de Processus

## 🐛 Problème Identifié

L'exécutable créait plusieurs instances de lui-même en boucle, ralentissant le PC.

## ✅ Solutions Appliquées

### 1. Console Forcée
- Changé de `--windowed` à `--console` dans le build
- Permet de voir les erreurs et évite certains bugs PyInstaller

### 2. Vérification d'Instance Unique
- Ajout d'un système de lock dans `run_app.py`
- Empêche plusieurs instances de tourner simultanément

### 3. Désactivation de --strip
- `--strip` peut causer des problèmes sur Windows
- Désactivé pour éviter les erreurs

## 🚀 Rebuild Nécessaire

Vous devez reconstruire l'exécutable :

```bash
python build_versioned_exe.py --auto --clean
```

## ⚠️ Si le Problème Persiste

1. **Arrêter tous les processus** :
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*AppsMobs*"} | Stop-Process -Force
   ```

2. **Vérifier les erreurs** :
   - Le mode console permettra de voir les erreurs
   - Regarder la console pour identifier le problème

3. **Alternatives** :
   - Utiliser `--onefile` sans `--windowed`
   - Ajouter un mutex système plus robuste

## 📝 Notes

- Le mode console permettra de debugger plus facilement
- Si besoin, on peut créer un wrapper qui lance l'app en mode fenêtré après vérifications




