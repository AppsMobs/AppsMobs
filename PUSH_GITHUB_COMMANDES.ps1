# 🚀 Script PowerShell pour Pousser sur GitHub
# Exécutez ce script après avoir configuré votre token

Write-Host "🚀 Poussage vers GitHub..." -ForegroundColor Green

# Vérifier que le remote est configuré
Write-Host "`n📋 Vérification du remote..." -ForegroundColor Cyan
git remote -v

# Option 1 : Si vous avez un token, décommentez et remplacez YOUR_TOKEN
# git remote set-url origin https://YOUR_TOKEN@github.com/AppsMobs/AppsMobs.git

# Option 2 : Push normal (Git vous demandera vos identifiants)
Write-Host "`n📤 Poussage vers GitHub..." -ForegroundColor Cyan
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Succès ! Votre projet est sur GitHub !" -ForegroundColor Green
    Write-Host "🌐 Vérifiez sur : https://github.com/AppsMobs/AppsMobs" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Erreur lors du push." -ForegroundColor Red
    Write-Host "💡 Si erreur d'authentification, utilisez :" -ForegroundColor Yellow
    Write-Host "   git remote set-url origin https://YOUR_TOKEN@github.com/AppsMobs/AppsMobs.git" -ForegroundColor Yellow
}

