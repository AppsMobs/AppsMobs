@echo off
REM Script pour configurer les variables d'environnement pour l'application client
REM À exécuter après l'installation

echo ========================================
echo    Configuration AppsMobs - Client
echo ========================================
echo.

echo Ce script configure les variables d'environnement necessaires
echo pour que l'application fonctionne correctement.
echo.

set /p license_url="URL du serveur de licence (OBLIGATOIRE): "
if "%license_url%"=="" (
    echo.
    echo [ERREUR] L'URL du serveur de licence est obligatoire!
    echo Veuillez relancer ce script et fournir l'URL.
    echo.
    pause
    exit /b 1
)

set /p supabase_key="Clé API Supabase (optionnel, appuyez sur Entree pour ignorer): "

echo.
echo Configuration des variables d'environnement...
echo.

REM Configurer pour l'utilisateur actuel
setx LICENSE_SERVER_URL "%license_url%"

if not "%supabase_key%"=="" (
    setx SUPABASE_ANON_KEY "%supabase_key%"
)

echo.
echo [OK] Variables d'environnement configurees!
echo.
echo Vous devez redemarrer l'application pour que les changements prennent effet.
echo.
pause

