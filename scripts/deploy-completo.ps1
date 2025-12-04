# Script completo de deploy - Backend + APK
# Uso: .\scripts\deploy-completo.ps1

Write-Host "🚀 Deploy Completo - VoluntAí" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git não encontrado. Recomendado para deploy." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Este script irá:" -ForegroundColor Cyan
Write-Host "1. Preparar o backend para deploy" -ForegroundColor White
Write-Host "2. Preparar o frontend para build" -ForegroundColor White
Write-Host "3. Gerar o APK" -ForegroundColor White
Write-Host ""

$continuar = Read-Host "Deseja continuar? (S/N)"
if ($continuar -ne "S" -and $continuar -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit 0
}

# Parte 1: Backend
Write-Host ""
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host "PARTE 1: CONFIGURAR BACKEND" -ForegroundColor Cyan
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

# Verificar .env
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Arquivo .env criado" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📋 INSTRUÇÕES PARA DEPLOY DO BACKEND:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opção 1 - Railway (Recomendado):" -ForegroundColor Cyan
Write-Host "  1. Acesse: https://railway.app" -ForegroundColor White
Write-Host "  2. Login com GitHub" -ForegroundColor White
Write-Host "  3. New Project → Deploy from GitHub repo" -ForegroundColor White
Write-Host "  4. Adicione MySQL Database" -ForegroundColor White
Write-Host "  5. Configure variáveis:" -ForegroundColor White
Write-Host "     - DATABASE_URL (copie do MySQL)" -ForegroundColor Gray
Write-Host "     - JWT_SECRET (gere com: node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`")" -ForegroundColor Gray
Write-Host "     - PORT=4000" -ForegroundColor Gray
Write-Host ""
Write-Host "Opção 2 - Render:" -ForegroundColor Cyan
Write-Host "  1. Acesse: https://render.com" -ForegroundColor White
Write-Host "  2. New Web Service → Conecte repositório" -ForegroundColor White
Write-Host "  3. Root Directory: backend" -ForegroundColor White
Write-Host "  4. Build: npm install && npm run build && npx prisma generate && npx prisma migrate deploy" -ForegroundColor White
Write-Host "  5. Start: npm start" -ForegroundColor White
Write-Host ""

$backendUrl = Read-Host "Após fazer o deploy, cole aqui a URL do backend (ex: https://voluntai-backend.railway.app)"

if (-not $backendUrl) {
    Write-Host "⚠️  Você pode configurar depois. Continuando..." -ForegroundColor Yellow
    $backendUrl = "https://seu-backend.railway.app"
}

# Parte 2: Frontend
Write-Host ""
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host "PARTE 2: CONFIGURAR FRONTEND" -ForegroundColor Cyan
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location ..
Set-Location frontend

# Configurar .env
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Arquivo .env criado" -ForegroundColor Green
    }
}

# Atualizar URL da API
if (Test-Path ".env") {
    $apiUrl = "$backendUrl/api"
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "EXPO_PUBLIC_API_URL=") {
        $envContent = $envContent -replace "EXPO_PUBLIC_API_URL=.*", "EXPO_PUBLIC_API_URL=$apiUrl"
    } else {
        $envContent += "`nEXPO_PUBLIC_API_URL=$apiUrl"
    }
    
    Set-Content ".env" $envContent
    Write-Host "✅ URL da API configurada: $apiUrl" -ForegroundColor Green
}

# Parte 3: Build APK
Write-Host ""
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host "PARTE 3: GERAR APK" -ForegroundColor Cyan
Write-Host "════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar EAS CLI
try {
    $null = Get-Command eas -ErrorAction Stop
    Write-Host "✅ EAS CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando EAS CLI..." -ForegroundColor Cyan
    npm install -g eas-cli
}

# Login
Write-Host "🔐 Verificando login no Expo..." -ForegroundColor Cyan
try {
    $null = eas whoami 2>&1
    Write-Host "✅ Logado no Expo" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Faça login no Expo:" -ForegroundColor Yellow
    eas login
}

# Build
Write-Host ""
Write-Host "Escolha o tipo de build:" -ForegroundColor Cyan
Write-Host "1) Preview (APK para teste)" -ForegroundColor White
Write-Host "2) Production (APK de produção)" -ForegroundColor White
$buildType = Read-Host "Escolha (1 ou 2)"

if ($buildType -eq "1") {
    Write-Host "🔨 Iniciando build preview..." -ForegroundColor Cyan
    eas build --platform android --profile preview
} elseif ($buildType -eq "2") {
    Write-Host "🔨 Iniciando build de produção..." -ForegroundColor Cyan
    eas build --platform android --profile production
} else {
    Write-Host "❌ Opção inválida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════" -ForegroundColor Green
Write-Host "✅ DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Acompanhe o build em: https://expo.dev" -ForegroundColor Cyan
Write-Host "📥 Quando concluído, baixe o APK" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Para mais informações, consulte DEPLOY.md" -ForegroundColor White

Set-Location ..

