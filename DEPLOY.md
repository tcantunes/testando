# 🚀 Guia de Deploy Automático - VoluntAí

Este guia explica como colocar o backend online e gerar o APK do aplicativo.

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app) ou [Render](https://render.com) (gratuito)
2. Conta no [Expo](https://expo.dev) (gratuito)
3. Node.js instalado localmente
4. Git instalado

---

## 🔧 Parte 1: Deploy do Backend

### Opção A: Railway (Recomendado)

1. **Criar conta e projeto:**
   - Acesse https://railway.app
   - Faça login com GitHub
   - Clique em "New Project" → "Deploy from GitHub repo"
   - Selecione este repositório

2. **Configurar banco de dados MySQL:**
   - No projeto Railway, clique em "+ New" → "Database" → "MySQL"
   - Railway criará automaticamente um banco MySQL
   - Copie a `DATABASE_URL` que será gerada automaticamente

3. **Configurar variáveis de ambiente:**
   - No projeto, vá em "Variables"
   - Adicione as seguintes variáveis:
     ```
     DATABASE_URL=<URL_DO_BANCO_QUE_VOCÊ_COPIOU>
     JWT_SECRET=<GERE_UMA_CHAVE_SECRETA_ALEATÓRIA>
     PORT=4000
     ```
   - Para gerar JWT_SECRET, use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. **Deploy:**
   - Railway detectará automaticamente o `railway.json`
   - O deploy começará automaticamente
   - Aguarde o build completar (pode levar 5-10 minutos)
   - Copie a URL do serviço (ex: `https://voluntai-backend.railway.app`)

### Opção B: Render

1. **Criar conta e serviço:**
   - Acesse https://render.com
   - Faça login com GitHub
   - Clique em "New +" → "Web Service"
   - Conecte este repositório
   - Configure:
     - **Name:** `voluntai-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Node`
     - **Build Command:** `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
     - **Start Command:** `npm start`

2. **Configurar banco de dados:**
   - No dashboard, clique em "New +" → "PostgreSQL" (ou MySQL se disponível)
   - Copie a `DATABASE_URL` interna

3. **Configurar variáveis de ambiente:**
   - No serviço web, vá em "Environment"
   - Adicione:
     ```
     DATABASE_URL=<URL_DO_BANCO>
     JWT_SECRET=<GERE_UMA_CHAVE_SECRETA>
     PORT=10000
     NODE_ENV=production
     ```

4. **Deploy:**
   - Clique em "Create Web Service"
   - Aguarde o deploy completar
   - Copie a URL (ex: `https://voluntai-backend.onrender.com`)

---

## 📱 Parte 2: Configurar Frontend

1. **Criar arquivo .env no frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Editar .env:**
   - Abra `frontend/.env`
   - Substitua `https://seu-backend.onrender.com/api` pela URL do seu backend
   - Exemplo: `EXPO_PUBLIC_API_URL=https://voluntai-backend.railway.app/api`
   - **IMPORTANTE:** Use `https://` e adicione `/api` no final

3. **Testar localmente (opcional):**
   ```bash
   npm start
   ```

---

## 📦 Parte 3: Gerar APK

### Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Login no Expo

```bash
eas login
```

### Configurar projeto

```bash
cd frontend
eas build:configure
```

### Gerar APK

```bash
# APK para teste (preview)
npm run build:preview

# OU APK de produção
npm run build:android
```

### Aguardar build

- O build será feito na nuvem do Expo
- Você receberá um link para acompanhar o progresso
- Quando concluído, você poderá baixar o APK

### Download do APK

- Acesse https://expo.dev
- Vá em "Builds"
- Baixe o APK quando estiver pronto

---

## ✅ Verificação

1. **Testar backend:**
   - Acesse: `https://seu-backend.railway.app/api/vagas` (ou sua URL)
   - Deve retornar JSON (mesmo que vazio)

2. **Testar APK:**
   - Instale o APK no seu dispositivo Android
   - Abra o app
   - Tente fazer login/cadastro
   - Verifique se consegue listar vagas

---

## 🔄 Atualizações Futuras

### Atualizar Backend:
- Faça push para o GitHub
- Railway/Render fará deploy automático

### Atualizar APK:
- Atualize o código
- Execute: `npm run build:android` novamente

---

## 🆘 Troubleshooting

### Backend não inicia:
- Verifique se `DATABASE_URL` está correto
- Verifique logs no Railway/Render
- Certifique-se que as migrações foram executadas

### APK não conecta ao backend:
- Verifique se `EXPO_PUBLIC_API_URL` está correto no `.env`
- Certifique-se que a URL termina com `/api`
- Verifique se o backend está online e acessível

### Erro de CORS:
- O backend já tem CORS configurado
- Se persistir, verifique se está usando `https://` na URL

---

## 📝 Notas Importantes

- **Backend gratuito:** Railway e Render oferecem planos gratuitos com limitações
- **Banco de dados:** Use o banco fornecido pela plataforma (gratuito)
- **APK:** O build do Expo é gratuito, mas pode ter fila de espera
- **URLs:** Sempre use `https://` em produção

---

## 🎉 Pronto!

Seu app está online e funcionando! O APK pode ser instalado em qualquer dispositivo Android.

