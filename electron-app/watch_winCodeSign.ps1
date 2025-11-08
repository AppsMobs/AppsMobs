# Script qui surveille le dossier winCodeSign et extrait automatiquement toute nouvelle archive
# Ce script doit être lancé en arrière-plan pendant le build

$ErrorActionPreference = "Continue"

$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$7zip = Join-Path $scriptDir "node_modules\7zip-bin\win\x64\7za.exe"

if (-not (Test-Path $7zip)) {
    Write-Host "[ERREUR] 7za.exe introuvable: $7zip"
    exit 1
}

Write-Host "[INFO] Surveillance du dossier winCodeSign..."
Write-Host "[INFO] Appuyez sur Ctrl+C pour arreter"

# Fonction pour extraire une archive
function Extract-Archive {
    param($archivePath)
    
    $archive = Get-Item $archivePath
    $extractDir = Join-Path $cacheDir $archive.BaseName
    
    # Vérifier si déjà extraite
    if (Test-Path $extractDir) {
        $files = Get-ChildItem $extractDir -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer }
        if ($files.Count -gt 0) {
            return $true
        }
    }
    
    Write-Host "[INFO] Nouvelle archive detectee: $($archive.Name)"
    
    # Créer le dossier de destination
    if (-not (Test-Path $extractDir)) {
        New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
    }
    
    # Extraire avec ignore des erreurs de liens symboliques
    $process = Start-Process -FilePath $7zip -ArgumentList "x", "-bd", "-y", "`"$($archive.FullName)`"", "`"-o$extractDir`"" -NoNewWindow -Wait -PassThru -RedirectStandardError "$extractDir\errors.log" -RedirectStandardOutput "$extractDir\output.log"
    
    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 2) {
        Write-Host "[OK] $($archive.Name) extraite (erreurs de liens symboliques macOS ignorees)"
        return $true
    } else {
        Write-Host "[ERREUR] Extraction echouee pour $($archive.Name) avec code: $($process.ExitCode)"
        return $false
    }
}

# Surveiller le dossier
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $cacheDir
$watcher.Filter = "*.7z"
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName, [System.IO.NotifyFilters]::LastWrite
$watcher.EnableRaisingEvents = $true

# Extraire les archives existantes
$existingArchives = Get-ChildItem "$cacheDir\*.7z" -ErrorAction SilentlyContinue
foreach ($archive in $existingArchives) {
    Extract-Archive $archive.FullName | Out-Null
}

# Événement pour les nouvelles archives
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    
    if ($changeType -eq "Created" -or $changeType -eq "Changed") {
        Start-Sleep -Milliseconds 500  # Attendre que le fichier soit complètement écrit
        if (Test-Path $path) {
            Extract-Archive $path | Out-Null
        }
    }
}

Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action | Out-Null

Write-Host "[OK] Surveillance active. Lancez le build maintenant..."

# Attendre indéfiniment (Ctrl+C pour arrêter)
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "[INFO] Surveillance arretee"
}

