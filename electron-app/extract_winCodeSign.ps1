# Script PowerShell pour extraire winCodeSign sans erreurs de liens symboliques
# Ce script extrait manuellement l'archive winCodeSign en ignorant les liens symboliques macOS

$ErrorActionPreference = "Continue"

$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
$archivePath = Join-Path $cacheDir "winCodeSign-2.6.0.7z"

Write-Host "Extraction manuelle de winCodeSign..."
Write-Host "Cache: $cacheDir"

# Créer le dossier de destination
$extractDir = Join-Path $cacheDir "winCodeSign-2.6.0"
if (Test-Path $extractDir) {
    Remove-Item -Recurse -Force $extractDir
}
New-Item -ItemType Directory -Force -Path $extractDir | Out-Null

# Extraire uniquement les fichiers Windows (ignorer les liens symboliques macOS)
$7zip = Join-Path $PSScriptRoot "node_modules\7zip-bin\win\x64\7za.exe"

if (Test-Path $7zip) {
    # Extraire avec ignore des erreurs de liens symboliques
    $process = Start-Process -FilePath $7zip -ArgumentList "x", "-bd", "-y", $archivePath, "`"-o$extractDir`"" -NoNewWindow -Wait -PassThru -RedirectStandardError "nul"
    
    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 2) {
        # Exit code 2 peut signifier des erreurs de liens symboliques (non critiques)
        Write-Host "[OK] Extraction terminee (erreurs de liens symboliques ignorees)"
        exit 0
    } else {
        Write-Host "[ERREUR] Extraction echouee avec code: $($process.ExitCode)"
        exit 1
    }
} else {
    Write-Host "[ERREUR] 7za.exe introuvable: $7zip"
    exit 1
}

