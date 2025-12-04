#!/bin/bash

# Script para gerar APK automaticamente
# Uso: ./scripts/build-apk.sh

set -e

echo "📱 Iniciando build do APK..."

# Verificar se está no diretório correto
if [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script da raiz do projeto"
    exit 1
fi

cd frontend

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️  IMPORTANTE: Configure EXPO_PUBLIC_API_URL no arquivo .env com a URL do seu backend!"
        echo "   Exemplo: EXPO_PUBLIC_API_URL=https://seu-backend.railway.app/api"
        read -p "Pressione Enter após configurar o .env..."
    else
        echo "❌ Arquivo .env.example não encontrado"
        exit 1
    fi
fi

# Verificar se EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo "📦 Instalando EAS CLI..."
    npm install -g eas-cli
fi

# Verificar login
echo "🔐 Verificando login no Expo..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  Você precisa fazer login no Expo"
    eas login
fi

# Configurar projeto (se necessário)
if [ ! -f "eas.json" ]; then
    echo "⚙️  Configurando EAS Build..."
    eas build:configure
fi

# Perguntar tipo de build
echo ""
echo "Escolha o tipo de build:"
echo "1) Preview (APK para teste)"
echo "2) Production (APK de produção)"
read -p "Escolha (1 ou 2): " build_type

if [ "$build_type" = "1" ]; then
    echo "🔨 Iniciando build preview..."
    eas build --platform android --profile preview
elif [ "$build_type" = "2" ]; then
    echo "🔨 Iniciando build de produção..."
    eas build --platform android --profile production
else
    echo "❌ Opção inválida"
    exit 1
fi

echo ""
echo "✅ Build iniciado!"
echo "📊 Acompanhe o progresso em: https://expo.dev"
echo "📥 Quando concluído, você poderá baixar o APK"

