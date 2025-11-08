@echo off
REM Script de nettoyage pour préparer le projet pour GitHub
REM ATTENTION: Ce script supprime des fichiers - Faites un backup avant!

echo ========================================
echo Nettoyage du projet AppsMobs
echo ========================================
echo.
echo ATTENTION: Ce script va supprimer des fichiers!
echo Appuyez sur une touche pour continuer ou Ctrl+C pour annuler...
pause >nul

echo.
echo Suppression des logs...
del /Q website\auth-backend\*.log 2>nul

echo Suppression des fichiers wheel...
del /Q *.whl 2>nul

echo Nettoyage des fichiers Python cache...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"

echo Nettoyage terminé!
echo.
echo Prochaines etapes:
echo 1. Verifiez git status pour voir ce qui sera commite
echo 2. Testez que votre projet fonctionne toujours
echo 3. Commit et push sur GitHub
echo.
pause

