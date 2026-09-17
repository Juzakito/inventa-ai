#Requires -Version 5.1
# setup.ps1 — Prepara el workspace InventaAI en Windows (idempotente).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Set-Location $root
Write-Host "== InventaAI setup ==" -ForegroundColor Cyan

$dirs = @("public/css","public/js","public/vendor","src/app","src/components/ui","src/components/layout","src/components/forms","src/components/sections","src/pages","src/hooks","src/lib","src/services","src/api","src/store","src/types","src/assets/images","src/assets/icons","src/assets/videos","src/styles","src/config","tests","scripts","deployment","docs")
foreach ($d in $dirs) { if (!(Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null } }
Write-Host "✔ Estructura verificada"

if (!(Test-Path ".env") -and (Test-Path ".env.example")) { Copy-Item ".env.example" ".env"; Write-Host "✔ .env creado desde .env.example" }
if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 20+ no encontrado. Instálalo desde https://nodejs.org" }
npm install
Write-Host "✔ Dependencias instaladas"
npm run build

if (!(Test-Path ".git")) { git init -b main; Write-Host "✔ Git inicializado" }
else { Write-Host "✔ Git existente" }

# Acceso directo "InventaAI - Workspace" en el escritorio
$desk = [Environment]::GetFolderPath("Desktop")
$lnk = Join-Path $desk "InventaAI - Workspace.lnk"
$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut($lnk)
$sc.TargetPath = $root
$sc.WorkingDirectory = $root
$sc.Description = "Workspace InventaAI"
$sc.Save()
Write-Host "✔ Acceso directo: $lnk"

if (Get-Command code -ErrorAction SilentlyContinue) { code $root } else { Write-Host "! VS Code (code) no está en PATH; ábrelo manual: $root" }
Write-Host "== Listo: npm run serve → http://localhost:5173 ==" -ForegroundColor Green
