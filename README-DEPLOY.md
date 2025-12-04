# 🚀 Deploy Automático - VoluntAí

## ⚡ Início Rápido

### Windows (PowerShell):
```powershell
.\scripts\deploy-completo.ps1
```

### Linux/Mac:
```bash
chmod +x scripts/*.sh
./scripts/deploy-completo.sh
```

---

## 📋 O que foi configurado

### ✅ Backend
- [x] Configuração para Railway
- [x] Configuração para Render
- [x] Scripts de build automático
- [x] Health check endpoint (`/health`)
- [x] CORS configurado para produção

### ✅ Frontend
- [x] Variável de ambiente para URL da API
- [x] Configuração EAS Build para APK
- [x] Scripts de build automatizados

### ✅ Documentação
- [x] Guia completo (DEPLOY.md)
- [x] Guia rápido (INICIO-RAPIDO.md)
- [x] Scripts automatizados

---

## 🎯 Próximos Passos

1. **Deploy do Backend:**
   - Escolha Railway ou Render
   - Siga as instruções em `DEPLOY.md`
   - Copie a URL do backend

2. **Configurar Frontend:**
   - Crie `frontend/.env`
   - Adicione: `EXPO_PUBLIC_API_URL=https://seu-backend.railway.app/api`

3. **Gerar APK:**
   - Execute: `npm run build:android` no diretório `frontend`
   - Ou use: `.\scripts\build-apk.ps1`

---

## 📁 Arquivos Criados

### Backend:
- `backend/railway.json` - Configuração Railway
- `backend/render.yaml` - Configuração Render
- `backend/Procfile` - Configuração Heroku/Render
- `backend/.env.example` - Exemplo de variáveis

### Frontend:
- `frontend/eas.json` - Configuração EAS Build
- `frontend/.env.example` - Exemplo de variáveis

### Scripts:
- `scripts/deploy-backend.ps1` - Deploy backend (Windows)
- `scripts/deploy-backend.sh` - Deploy backend (Linux/Mac)
- `scripts/build-apk.ps1` - Build APK (Windows)
- `scripts/build-apk.sh` - Build APK (Linux/Mac)
- `scripts/deploy-completo.ps1` - Deploy completo (Windows)

### Documentação:
- `DEPLOY.md` - Guia completo de deploy
- `INICIO-RAPIDO.md` - Guia rápido
- `README-DEPLOY.md` - Este arquivo

---

## 🔧 Variáveis de Ambiente

### Backend (.env):
```env
DATABASE_URL=mysql://usuario:senha@host:porta/banco
JWT_SECRET=sua_chave_secreta_aqui
PORT=4000
```

### Frontend (.env):
```env
EXPO_PUBLIC_API_URL=https://seu-backend.railway.app/api
```

---

## ✅ Verificação

### Backend Online?
Acesse: `https://seu-backend.railway.app/health`
Deve retornar: `{"status":"ok","message":"Backend VoluntAí está online!"}`

### APK Funcionando?
1. Instale no celular
2. Abra o app
3. Tente fazer cadastro
4. Deve conectar ao backend

---

## 🆘 Suporte

Consulte:
- `DEPLOY.md` - Guia completo
- `INICIO-RAPIDO.md` - Guia rápido
- Logs no Railway/Render para erros do backend
- https://expo.dev para status do build

---

## 🎉 Pronto para Deploy!

Tudo está configurado e pronto para uso. Execute o script automatizado ou siga o guia manual.

