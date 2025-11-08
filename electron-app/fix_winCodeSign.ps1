# Script PowerShell pour extraire winCodeSign en ignorant les erreurs de liens symboliques
# Ces erreurs ne sont pas critiques pour Windows (les liens symboliques macOS ne sont pas nécessaires)

$ErrorActionPreference = "Continue"

$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"

if (-not (Test-Path $cacheDir)) {
    Write-Host "[INFO] Cache winCodeSign non trouve, extraction non necessaire"
    exit 0
}

# Trouver TOUTES les archives 7z et les extraire
$archives = Get-ChildItem "$cacheDir\*.7z" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if ($archives.Count -eq 0) {
    Write-Host "[INFO] Aucune archive winCodeSign trouvee"
    exit 0
}

Write-Host "Extraction manuelle de winCodeSign..."
Write-Host "Archives trouvees: $($archives.Count)"

# Trouver 7za.exe
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$7zip = Join-Path $scriptDir "node_modules\7zip-bin\win\x64\7za.exe"

if (-not (Test-Path $7zip)) {
    Write-Host "[ERREUR] 7za.exe introuvable: $7zip"
    exit 1
}

# Extraire toutes les archives
$successCount = 0
foreach ($archive in $archives) {
    $extractDir = Join-Path $cacheDir $archive.BaseName
    
    # Vérifier si déjà extraite
    if (Test-Path $extractDir) {
        $files = Get-ChildItem $extractDir -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer }
        if ($files.Count -gt 0) {
            Write-Host "[INFO] Archive deja extraite: $($archive.Name)"
            $successCount++
            continue
        }
    }
    
    Write-Host "Extraction: $($archive.Name) -> $($archive.BaseName)"
    
    # Créer le dossier de destination
    if (-not (Test-Path $extractDir)) {
        New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
    }
    
    # Extraire avec ignore des erreurs de liens symboliques
    # Code de sortie 2 = erreurs de liens symboliques (non critiques)
    $process = Start-Process -FilePath $7zip -ArgumentList "x", "-bd", "-y", "`"$($archive.FullName)`"", "`"-o$extractDir`"" -NoNewWindow -Wait -PassThru -RedirectStandardError "$extractDir\errors.log" -RedirectStandardOutput "$extractDir\output.log"
    
    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 2) {
        # Exit code 0 = succès complet
        # Exit code 2 = succès avec erreurs de liens symboliques (acceptable)
        Write-Host "[OK] $($archive.Name) extraite (erreurs de liens symboliques macOS ignorees)"
        $successCount++
    } else {
        Write-Host "[ERREUR] Extraction echouee pour $($archive.Name) avec code: $($process.ExitCode)"
    }
}

if ($successCount -gt 0) {
    Write-Host "[OK] $successCount archive(s) extraite(s) avec succes"
    Write-Host "[OK] Le build devrait maintenant fonctionner"
    exit 0
} else {
    Write-Host "[ERREUR] Aucune archive extraite avec succes"
    exit 1
}

