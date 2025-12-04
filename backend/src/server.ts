import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import relatoriosRoutes from './routes/relatorios';
import vagasRoutes from './routes/vagas';
import inscricaoRoutes from './routes/inscricao';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();

// CORS configurado para aceitar requisições de qualquer origem
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend VoluntAí está online!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vagas', vagasRoutes);
app.use('/api/inscricoes', inscricaoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
