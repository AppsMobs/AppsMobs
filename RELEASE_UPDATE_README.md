# AppsMobs – Guide de mise à jour (Auto-Update via GitHub)

## Objectif
Permettre à vos utilisateurs de recevoir une notification "Nouvelle version disponible" et de télécharger/installer automatiquement la mise à jour.

## Pré-requis (à faire une seule fois)
- Dépôt GitHub (public de préférence) configuré dans `electron-app/package.json` → `build.publish` avec `provider: github`, `owner`, `repo`.
- `electron-updater` en `dependencies` (déjà fait).
- L’app lit la version depuis `package.json` et l’affiche automatiquement (OK).

## Pipeline de release (à chaque version)
1. Mettre à jour la version
   - Fichier: `electron-app/package.json`
   - Champ: `version` (ex: 1.1.12)

2. Configurer le token GitHub (publication)
   - Crée un PAT GitHub (scope minimal: `repo`).
   - Terminal PowerShell (persistant):
     ```powershell
     setx GH_TOKEN "TON_TOKEN"
     ```
     Redémarre le terminal.

3. Build + Publication sur GitHub Releases
   ```powershell
   cd electron-app
   npm run dist
   ```
   - Résultat: une Release GitHub avec `AppsMobs-Setup-*.exe`, `latest.yml`, `*.blockmap`.

4. Vérification
   - Va sur GitHub → Repo → Releases, vérifie la présence de `latest.yml` et de l’`exe`.

5. Distribution
   - Donne aux utilisateurs le nouveau setup si nécessaire; l’auto-update détectera aussi la nouvelle version.

## Comportement côté utilisateur
- Au démarrage (3s après), l’app vérifie s’il existe une version plus récente.
- Si oui: notification → téléchargement → popup "Mise à jour prête" → redémarrage et installation.

## Cas dépôt privé (alternatives)
- Rendre le repo public (recommandé pour updates seulement).
- OU héberger `latest.yml` + `.exe` sur une URL publique (CDN/S3) et passer à:
  ```json
  {
    "build": {
      "publish": [{ "provider": "generic", "url": "https://cdn.ton-domaine.com/updates" }]
    }
  }
  ```
- Éviter d’exiger un token côté client.

## À faire / À ne pas faire
- À faire:
  - Toujours incrémenter `version` avant chaque publication.
  - Utiliser `npm run dist` (pas `--publish=never`) pour publier.
  - Tester d’abord `dist/win-unpacked/AppsMobs.exe` avant d’installer.
- À ne pas faire:
  - Ne jamais commiter ni exposer `GH_TOKEN`.
  - Ne pas supprimer `latest.yml` des Releases (le flux d’updates en dépend).
  - Ne pas garder de numéro de version "hardcodé" dans l’UI (déjà corrigé: l’UI lit depuis `package.json`).

## Dépannage rapide
- Erreur "Cannot find package 'electron-updater'":
  - Vérifie qu’il est en `dependencies`, pas seulement en `devDependencies`.
  - Force l’inclusion dans `build.files` si nécessaire: `"node_modules/electron-updater/**/*"`.
- L’app ne voit pas la nouvelle version:
  - Assure-toi que la Release publiée contient `latest.yml` et que la `version` est supérieure à celle installée.
- Dépôt privé: l’auto-update ne lira pas `latest.yml` sans URL publique.

## Commandes utiles
```powershell
# Build Windows NSIS sans publier
npm run build:win:nsis

# Build + publication (Releases GitHub)
npm run dist
```
