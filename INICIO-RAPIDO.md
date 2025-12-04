# ⚡ Início Rápido - Deploy Automático

## 🎯 Objetivo
Colocar o backend online e gerar o APK do aplicativo.

## 🚀 Método Rápido (Windows)

### 1. Execute o script automatizado:

```powershell
.\scripts\deploy-completo.ps1
```

O script irá:
- ✅ Preparar o backend
- ✅ Configurar o frontend
- ✅ Gerar o APK automaticamente

### 2. Siga as instruções na tela

O script guiará você através de:
1. **Deploy do Backend** (Railway ou Render)
2. **Configuração da URL da API**
3. **Geração do APK**

---

## 📋 Método Manual

### Passo 1: Backend Online

#### Railway (Recomendado - Mais Fácil)

1. Acesse: https://railway.app
2. Login com GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Selecione este repositório
5. Adicione **MySQL Database**
6. Configure variáveis:
   - `DATABASE_URL` (copie do MySQL criado)
   - `JWT_SECRET` (gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `PORT=4000`
7. Aguarde o deploy (5-10 min)
8. **Copie a URL** (ex: `https://voluntai-backend.railway.app`)

### Passo 2: Configurar Frontend

1. Crie `frontend/.env`:
   ```bash
   cd frontend
   copy .env.example .env
   ```

2. Edite `.env` e adicione:
   ```
   EXPO_PUBLIC_API_URL=https://SUA-URL-BACKEND.railway.app/api
   ```
   ⚠️ **IMPORTANTE:** Substitua pela URL real do seu backend e adicione `/api` no final!

### Passo 3: Gerar APK

1. Instale EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login no Expo:
   ```bash
   eas login
   ```

3. Gere o APK:
   ```bash
   cd frontend
   npm run build:android
   ```

4. Aguarde o build (10-20 min)
5. Baixe o APK em: https://expo.dev

---

## ✅ Verificação

1. **Backend funcionando?**
   - Acesse: `https://seu-backend.railway.app/api/vagas`
   - Deve retornar JSON (mesmo que vazio `[]`)

2. **APK funcionando?**
   - Instale no celular
   - Abra o app
   - Tente fazer cadastro/login
   - Deve conectar ao backend

---

## 🆘 Problemas Comuns

### Backend não inicia
- ✅ Verifique `DATABASE_URL` está correto
- ✅ Verifique logs no Railway/Render
- ✅ Certifique-se que as migrações rodaram

### APK não conecta
- ✅ Verifique `EXPO_PUBLIC_API_URL` no `.env`
- ✅ URL deve terminar com `/api`
- ✅ Use `https://` (não `http://`)
- ✅ Backend deve estar online

### Erro de build
- ✅ Certifique-se que está logado: `eas login`
- ✅ Verifique se tem conta no Expo: https://expo.dev

---

## 📚 Documentação Completa

Para mais detalhes, consulte: **DEPLOY.md**

---

## 🎉 Pronto!

Seu app está online e o APK pode ser instalado em qualquer Android!

