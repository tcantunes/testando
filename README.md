# 🌱 VoluntAí

<div align="center">

![VoluntAí Logo](https://img.shields.io/badge/VoluntAí-Voluntariado-green?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)

**Plataforma móvel que conecta ONGs a voluntários**

</div>

---

## 📋 Sobre o Projeto

O **VoluntAí** é uma plataforma móvel desenvolvida para otimizar a conexão entre organizações não governamentais (ONGs) e voluntários. O projeto aborda a fragmentação e a ineficiência do processo de busca por oportunidades de voluntariado, que atualmente se encontra disperso em diversas plataformas e redes sociais.

A solução técnica, construída utilizando uma arquitetura de **Backend dedicado**, integra funcionalidades de autenticação segura, sistema de busca e filtragem por categoria e localidade, e um sistema de chat em tempo real. O resultado é uma ferramenta intuitiva e eficiente que promove o engajamento cívico.

### 🎯 Objetivos

- ✅ Facilitar a descoberta de oportunidades de voluntariado
- ✅ Conectar ONGs e voluntários de forma direta e segura
- ✅ Permitir gestão completa de vagas e inscrições
- ✅ Registrar e acompanhar horas voluntariadas
- ✅ Promover comunicação contextualizada por vaga

---

## ✨ Funcionalidades

### Para Voluntários 👤

- 🔐 **Autenticação segura** com JWT
- 🔍 **Busca de vagas** por categoria, localidade e proximidade
- ❤️ **Sistema de favoritos** para salvar vagas de interesse
- 📍 **Filtro por distância** (até 50km) usando geolocalização
- ✍️ **Inscrição em vagas** com confirmação instantânea
- 💬 **Chat contextualizado** por vaga para comunicação com ONGs
- 📊 **Histórico de participações** e estatísticas pessoais
- 📤 **Compartilhamento** de vagas nas redes sociais

### Para ONGs 🏢

- 🔐 **Autenticação** com validação de CNPJ
- ➕ **Criação e edição** de vagas de voluntariado
- 📋 **Gerenciamento de inscritos** por vaga
- ✅ **Confirmação de presença** dos voluntários
- ⏱️ **Registro de horas** voluntariadas
- 📊 **Dashboard de estatísticas** e relatórios
- 💬 **Chat** para comunicação com voluntários
- 📈 **Métricas** de engajamento e participação

---

## 🛠️ Tecnologias

### Frontend (Mobile)

- **React Native** 0.81.4 - Framework multiplataforma
- **Expo** 54.0.0 - Plataforma de desenvolvimento
- **TypeScript** 5.3.3 - Tipagem estática
- **React Navigation** 7.x - Navegação entre telas
- **React Native Maps** 1.20.1 - Mapas e geolocalização
- **Axios** 1.8.4 - Cliente HTTP
- **AsyncStorage** - Persistência local
- **Expo Location** - Geolocalização
- **Formik + Yup** - Formulários e validação

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** 4.18.2 - Framework web
- **TypeScript** 5.4.0 - Tipagem estática
- **Prisma ORM** 5.0.0 - Mapeamento objeto-relacional
- **MySQL** - Banco de dados relacional
- **JWT** 9.0.0 - Autenticação baseada em tokens
- **bcrypt** 5.1.0 - Hash de senhas

### Integrações Externas

- **ViaCEP API** - Consulta de endereços por CEP
- **Nominatim/OpenStreetMap** - Geocodificação (endereço → coordenadas)

---

## 📁 Estrutura do Projeto

```
voluntariado-app/
├── backend/                 # API Backend (Node.js + Express)
│   ├── prisma/             # Schema e migrações do banco
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── routes/         # Definição de rotas
│   │   ├── middlewares/    # Middlewares (auth, cors)
│   │   ├── lib/            # Bibliotecas (Prisma, API)
│   │   └── server.ts       # Ponto de entrada
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Aplicativo Mobile (React Native)
   ├── src/
   │   ├── screens/        # Telas da aplicação
   │   ├── components/     # Componentes reutilizáveis
   │   ├── contexts/       # Context API (Toast, Favorites)
   │   ├── services/       # Serviços (API, geocode)
   │   ├── lib/            # Funções de backend
   │   ├── routes/         # Configuração de navegação
   │   ├── utils/          # Utilitários (distance, share)
   │   └── theme/          # Sistema de design
   ├── assets/             # Imagens e ícones
   ├── App.tsx
   └── package.json



---

## 🚀 Instalação

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- **Expo CLI** (`npm install -g expo-cli`)
- **Git** ([Download](https://git-scm.com/))

### 1. Clone o repositório

```bash
git clone https://github.com/tcantunes/voluntai.git
cd voluntai
```

### 2. Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure o arquivo .env
cp .env.example .env
# Edite o .env com suas credenciais:
# DATABASE_URL="mysql://usuario:senha@localhost:3306/voluntariado"
# JWT_SECRET="sua_chave_secreta_aqui"

# Execute as migrações do Prisma
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate

# Inicie o servidor em desenvolvimento
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

### 3. Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Configure a URL da API
# Edite src/services/api.ts e defina:
# baseURL: 'http://SEU_IP:3000/api'
# (Use seu IP local, não localhost)

# Inicie o Expo
npm start
```

Escaneie o QR Code com o app **Expo Go** (disponível na Play Store e App Store).

---

## 📱 Como Usar

### Primeiro Acesso

1. **Cadastro de Voluntário:**
   - Abra o app e selecione "Cadastrar"
   - Escolha "Pessoa Física"
   - Preencha seus dados (nome, email, senha, CPF)
   - Informe seu CEP (endereço será preenchido automaticamente)
   - Finalize o cadastro

2. **Cadastro de ONG:**
   - Selecione "Pessoa Jurídica"
   - Preencha dados da organização (nome, email, CNPJ)
   - Informe o endereço da ONG
   - Finalize o cadastro

### Para Voluntários

- **Buscar Vagas:** Acesse o Dashboard e explore as vagas disponíveis
- **Filtrar:** Use os filtros por categoria, distância ou favoritos
- **Inscrever-se:** Toque na vaga desejada e clique em "Inscrever-se"
- **Chat:** Acesse o chat da vaga para conversar com a ONG
- **Acompanhar:** Veja suas inscrições em "Minhas Vagas"

### Para ONGs

- **Criar Vaga:** Acesse "Criar Vaga" e preencha os detalhes
- **Gerenciar:** Veja os inscritos em "Gerenciar Inscritos"
- **Confirmar Presença:** Após o evento, confirme a presença dos voluntários
- **Relatórios:** Acesse "Relatórios" para ver estatísticas

---

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login e obtenção de token
- `GET /api/auth/me` - Dados do usuário autenticado

### Vagas
- `GET /api/vagas` - Listar todas as vagas
- `GET /api/vagas/:id` - Detalhes de uma vaga
- `POST /api/vagas` - Criar nova vaga (requer auth)
- `PUT /api/vagas/:id` - Atualizar vaga (requer auth)
- `DELETE /api/vagas/:id` - Excluir vaga (requer auth)

### Inscrições
- `POST /api/inscricao` - Inscrever-se em uma vaga
- `GET /api/inscricao/minhas` - Minhas inscrições
- `GET /api/inscricao/vaga/:vagaId` - Inscritos em uma vaga
- `PUT /api/inscricao/:id/presenca` - Confirmar presença

### Chat
- `GET /api/chat/vaga/:vagaId` - Mensagens de uma vaga
- `POST /api/chat` - Enviar mensagem

### Relatórios
- `GET /api/relatorios/ong/:ongId` - Estatísticas da ONG
- `GET /api/relatorios/voluntario/:id` - Estatísticas do voluntário

---

## 🗄️ Modelo de Dados

### Entidades Principais

- **Usuario**: Voluntários (pessoa física) e ONGs (pessoa jurídica)
- **Vaga**: Oportunidades de voluntariado criadas pelas ONGs
- **Inscricao**: Relacionamento entre voluntário e vaga
- **ChatMessage**: Mensagens do chat contextualizadas por vaga

Veja o schema completo em: `backend/prisma/schema.prisma`

---

## 🧪 Scripts Disponíveis

### Backend

```bash
npm run dev          # Inicia servidor em desenvolvimento
npm run build        # Compila TypeScript
npm run start        # Inicia servidor de produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrações
```

### Frontend

```bash
npm start            # Inicia Expo (desenvolvimento)
npm run android      # Inicia no Android
npm run ios          # Inicia no iOS
npm run web          # Inicia versão web
```

---

## 🔒 Segurança

- ✅ Senhas hasheadas com **bcrypt**
- ✅ Autenticação via **JWT** (JSON Web Tokens)
- ✅ Validação de dados no backend
- ✅ CORS configurado
- ✅ Validação de CPF/CNPJ

---

## 🤝 Contribuindo

Este é um projeto acadêmico (TCC), mas contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
