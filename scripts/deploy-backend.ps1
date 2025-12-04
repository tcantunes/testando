# Script de deploy automático do backend para Windows
# Uso: .\scripts\deploy-backend.ps1 [railway|render]

param(
    [string]$Platform = "railway"
)

Write-Host "🚀 Iniciando deploy do backend para $Platform..." -ForegroundColor Cyan

# Verificar se está no diretório correto
if (-not (Test-Path "backend")) {
    Write-Host "❌ Erro: Execute este script da raiz do projeto" -ForegroundColor Red
    exit 1
}

Set-Location backend

# Verificar variáveis de ambiente
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Arquivo .env não encontrado. Criando a partir do .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Arquivo .env criado. Por favor, configure as variáveis antes de continuar." -ForegroundColor Green
        exit 1
    } else {
        Write-Host "❌ Arquivo .env.example não encontrado" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Configuração verificada" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host ""

if ($Platform -eq "railway") {
    Write-Host "1. Acesse https://railway.app" -ForegroundColor White
    Write-Host "2. Crie um novo projeto e conecte este repositório" -ForegroundColor White
    Write-Host "3. Adicione um banco MySQL" -ForegroundColor White
    Write-Host "4. Configure as variáveis de ambiente no Railway:" -ForegroundColor White
    Write-Host "   - DATABASE_URL (copie do banco criado)" -ForegroundColor Gray
    Write-Host "   - JWT_SECRET (gere com: node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`")" -ForegroundColor Gray
    Write-Host "   - PORT=4000" -ForegroundColor Gray
    Write-Host "5. O Railway fará deploy automático" -ForegroundColor White
} elseif ($Platform -eq "render") {
    Write-Host "1. Acesse https://render.com" -ForegroundColor White
    Write-Host "2. Crie um novo Web Service e conecte este repositório" -ForegroundColor White
    Write-Host "3. Configure:" -ForegroundColor White
    Write-Host "   - Root Directory: backend" -ForegroundColor Gray
    Write-Host "   - Build Command: npm install && npm run build && npx prisma generate && npx prisma migrate deploy" -ForegroundColor Gray
    Write-Host "   - Start Command: npm start" -ForegroundColor Gray
    Write-Host "4. Adicione um banco de dados PostgreSQL/MySQL" -ForegroundColor White
    Write-Host "5. Configure as variáveis de ambiente:" -ForegroundColor White
    Write-Host "   - DATABASE_URL" -ForegroundColor Gray
    Write-Host "   - JWT_SECRET" -ForegroundColor Gray
    Write-Host "   - PORT=10000" -ForegroundColor Gray
    Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 Para mais detalhes, consulte DEPLOY.md" -ForegroundColor Cyan

