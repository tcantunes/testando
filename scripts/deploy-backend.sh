#!/bin/bash

# Script de deploy automático do backend
# Uso: ./scripts/deploy-backend.sh [railway|render]

set -e

PLATFORM=${1:-railway}

echo "🚀 Iniciando deploy do backend para $PLATFORM..."

# Verificar se está no diretório correto
if [ ! -d "backend" ]; then
    echo "❌ Erro: Execute este script da raiz do projeto"
    exit 1
fi

cd backend

# Verificar variáveis de ambiente
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado. Por favor, configure as variáveis antes de continuar."
        exit 1
    else
        echo "❌ Arquivo .env.example não encontrado"
        exit 1
    fi
fi

echo "✅ Configuração verificada"
echo ""
echo "📋 Próximos passos:"
echo ""
if [ "$PLATFORM" = "railway" ]; then
    echo "1. Acesse https://railway.app"
    echo "2. Crie um novo projeto e conecte este repositório"
    echo "3. Adicione um banco MySQL"
    echo "4. Configure as variáveis de ambiente no Railway:"
    echo "   - DATABASE_URL (copie do banco criado)"
    echo "   - JWT_SECRET (gere com: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
    echo "   - PORT=4000"
    echo "5. O Railway fará deploy automático"
elif [ "$PLATFORM" = "render" ]; then
    echo "1. Acesse https://render.com"
    echo "2. Crie um novo Web Service e conecte este repositório"
    echo "3. Configure:"
    echo "   - Root Directory: backend"
    echo "   - Build Command: npm install && npm run build && npx prisma generate && npx prisma migrate deploy"
    echo "   - Start Command: npm start"
    echo "4. Adicione um banco de dados PostgreSQL/MySQL"
    echo "5. Configure as variáveis de ambiente:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - PORT=10000"
    echo "   - NODE_ENV=production"
fi

echo ""
echo "📖 Para mais detalhes, consulte DEPLOY.md"

