Param(
    [Parameter(Mandatory = $true)][string]$Version,
    [Parameter(Mandatory = $false)][string]$ExePath = "",
    [Parameter(Mandatory = $false)][string]$OutputDir = "dist_public"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERR ] $msg" -ForegroundColor Red }

# Resolve repository root
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Info "Repo root: $repoRoot"
Set-Location $repoRoot

# Find executable if not provided
if (-not $ExePath -or -not (Test-Path $ExePath)) {
    $candidates = @(
        Join-Path $repoRoot "releases/AppsMobs_v$Version.exe"),
        (Join-Path $repoRoot "build/AppsMobs_v$Version/AppsMobs_v$Version.exe"),
        (Join-Path $repoRoot "dist/AppsMobs_v$Version.exe")
    $ExePath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

if (-not $ExePath) {
    Write-Err "Executable not found. Provide -ExePath or place it under releases/."
    exit 1
}

Write-Info "Using executable: $ExePath"

# Prepare output folder
$releaseName = "AppsMobs_v$Version"
$targetRoot = Join-Path $repoRoot $OutputDir
$targetDir = Join-Path $targetRoot $releaseName

if (Test-Path $targetDir) { Remove-Item -Recurse -Force $targetDir }
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

# Copy essential files
Copy-Item -Path $ExePath -Destination (Join-Path $targetDir (Split-Path $ExePath -Leaf)) -Force

$filesToInclude = @(
    "README.md",
    "PUBLIC_README.md",
    "LICENSE.md",
    "INSTRUCTIONS_CLIENT.txt",
    "GUIDE_SIMPLE.md",
    "RELEASE_NOTES.md"
) | ForEach-Object { Join-Path $repoRoot $_ }

foreach ($f in $filesToInclude) {
    if (Test-Path $f) {
        Copy-Item -Path $f -Destination $targetDir -Force
    }
}

# Copy minimal assets (icons only)
$iconDir = Join-Path $repoRoot "assets/icons"
if (Test-Path $iconDir) {
    $outIconDir = Join-Path $targetDir "assets/icons"
    New-Item -ItemType Directory -Force -Path $outIconDir | Out-Null
    Get-ChildItem $iconDir -Include *.ico,*.png -File | ForEach-Object {
        Copy-Item $_.FullName -Destination $outIconDir -Force
    }
}

# Generate checksum
$exeLeaf = Split-Path $ExePath -Leaf
$exeOutPath = Join-Path $targetDir $exeLeaf
$hash = Get-FileHash -Algorithm SHA256 -Path $exeOutPath
"SHA256  `"$exeLeaf`"  $($hash.Hash)" | Out-File -Encoding UTF8 (Join-Path $targetDir "SHA256SUMS.txt")

# Ensure release notes exist (create from template if absent)
$notesPath = Join-Path $targetDir "RELEASE_NOTES.md"
if (-not (Test-Path $notesPath)) {
    $template = Join-Path $repoRoot "RELEASE_NOTES_TEMPLATE.md"
    if (Test-Path $template) {
        (Get-Content $template -Raw).Replace("{{VERSION}}", $Version).Replace("{{DATE}}", (Get-Date -Format "yyyy-MM-dd")) |
            Out-File -Encoding UTF8 $notesPath
    } else {
        "# AppsMobs $Version`n`n- Nouveautés:`n- Corrections:`n- Notes:`n" | Out-File -Encoding UTF8 $notesPath
    }
}

# Create a zip archive for distribution
$zipPath = Join-Path $targetRoot "$releaseName.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $targetDir '*') -DestinationPath $zipPath

Write-Info "Release prepared: $targetDir"
Write-Info "Zip created: $zipPath"
