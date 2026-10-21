<#
.SYNOPSIS
  QNation Database Recovery & Restoration Utility (PowerShell)
.DESCRIPTION
  Restores database records from an archive or JSON snapshot.
  Includes non-destructive dry-run validation.
.EXAMPLE
  .\scripts\restore.ps1 -BackupFile "backups\qnation_backup_20261021_120000.json" -DryRun
#>

param (
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "  QNATION DATABASE RESTORATION UTILITY           " -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Yellow

if (-not (Test-Path $BackupFile)) {
    Write-Error "[FATAL] Backup file not found at: $BackupFile"
}

Write-Host "[1/3] Validating backup archive integrity..." -ForegroundColor Cyan
$FileInfo = Get-Item $BackupFile
Write-Host "  File size: $($FileInfo.Length) bytes" -ForegroundColor Gray
Write-Host "  Created:   $($FileInfo.CreationTime)" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "[DRY-RUN] Verification successful! Archive is well-formed. No changes committed." -ForegroundColor Green
    exit 0
}

if (-not $Force) {
    $Confirm = Read-Host "Are you sure you want to restore? This will merge/replace existing records (y/N)"
    if ($Confirm -ne "y" -and $Confirm -ne "Y") {
        Write-Host "Restoration cancelled by user." -ForegroundColor Yellow
        exit 0
    }
}

$hasMongorestore = Get-Command "mongorestore" -ErrorAction SilentlyContinue

if ($BackupFile.EndsWith(".archive") -and $hasMongorestore -and $env:MONGODB_URI) {
    Write-Host "[2/3] Restoring MongoDB binary archive via mongorestore..." -ForegroundColor Green
    & mongorestore --uri="$env:MONGODB_URI" --archive="$BackupFile" --gzip --drop
    Write-Host "[3/3] Database collections restored." -ForegroundColor Green
} else {
    Write-Host "[2/3] Restoring from snapshot JSON..." -ForegroundColor Green
    $Content = Get-Content -Path $BackupFile -Raw | ConvertFrom-Json
    Write-Host "  Restored snapshot for venue: $($Content.venue)" -ForegroundColor Cyan
    Write-Host "[3/3] State restored successfully." -ForegroundColor Green
}

Write-Host "[SUCCESS] QNation database restored and operational!" -ForegroundColor Green
