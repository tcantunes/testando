// backend/src/controllers/reportsController.ts
import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export async function getOngMetrics(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Total de vagas criadas pelo usuário
    const totalVagasCriadas = await prisma.vaga.count({
      where: { criadorId: userId },
    });

    // Total de inscrições recebidas nessas vagas
    const totalInscricoes = await prisma.inscricao.count({
      where: {
        vaga: {
          criadorId: userId,
        },
      },
    });

    return res.json({
      total_vagas_criadas: totalVagasCriadas,
      total_inscricoes: totalInscricoes,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao gerar métricas.' });
  }
}
