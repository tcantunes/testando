# Script para gerar APK automaticamente no Windows
# Uso: .\scripts\build-apk.ps1

Write-Host "📱 Iniciando build do APK..." -ForegroundColor Cyan

# Verificar se está no diretório correto
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Erro: Execute este script da raiz do projeto" -ForegroundColor Red
    exit 1
}

Set-Location frontend

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Arquivo .env não encontrado. Criando a partir do .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️  IMPORTANTE: Configure EXPO_PUBLIC_API_URL no arquivo .env com a URL do seu backend!" -ForegroundColor Yellow
        Write-Host "   Exemplo: EXPO_PUBLIC_API_URL=https://seu-backend.railway.app/api" -ForegroundColor Gray
        Read-Host "Pressione Enter após configurar o .env"
    } else {
        Write-Host "❌ Arquivo .env.example não encontrado" -ForegroundColor Red
        exit 1
    }
}

# Verificar se EAS CLI está instalado
try {
    $null = Get-Command eas -ErrorAction Stop
    Write-Host "✅ EAS CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando EAS CLI..." -ForegroundColor Cyan
    npm install -g eas-cli
}

# Verificar login
Write-Host "🔐 Verificando login no Expo..." -ForegroundColor Cyan
try {
    $null = eas whoami 2>&1
    Write-Host "✅ Logado no Expo" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Você precisa fazer login no Expo" -ForegroundColor Yellow
    eas login
}

# Configurar projeto (se necessário)
if (-not (Test-Path "eas.json")) {
    Write-Host "⚙️  Configurando EAS Build..." -ForegroundColor Cyan
    eas build:configure
}

# Perguntar tipo de build
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
Write-Host "✅ Build iniciado!" -ForegroundColor Green
Write-Host "📊 Acompanhe o progresso em: https://expo.dev" -ForegroundColor Cyan
Write-Host "📥 Quando concluído, você poderá baixar o APK" -ForegroundColor Cyan

