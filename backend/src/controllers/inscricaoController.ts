// backend/src/controllers/inscricaoController.ts
import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export async function inscrever(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { vagaId } = req.body;

    // verifica se já inscrito
    const existente = await prisma.inscricao.findFirst({
      where: { vagaId, voluntarioId: userId }
    });

    if (existente)
      return res.status(400).json({ error: 'Você já está inscrito.' });

    const inscricao = await prisma.inscricao.create({
      data: {
        vagaId,
        voluntarioId: userId,
      }
    });

    return res.json(inscricao);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao se inscrever.' });
  }
}

export async function cancelarInscricao(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { vagaId } = req.body;

    await prisma.inscricao.deleteMany({
      where: {
        vagaId,
        voluntarioId: userId,
      }
    });

    return res.json({ message: 'Inscrição cancelada.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao cancelar inscrição.' });
  }
}

export async function minhasInscricoes(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const inscricoes = await prisma.inscricao.findMany({
      where: { voluntarioId: userId },
      include: { vaga: true }
    });

    return res.json(inscricoes);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar inscrições.' });
  }
}

export async function listarInscritos(req: AuthRequest, res: Response) {
  try {
    const { vagaId } = req.params;

    const inscritos = await prisma.inscricao.findMany({
      where: { vagaId: Number(vagaId) },
      include: { voluntario: true }
    });

    return res.json(inscritos);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar inscritos.' });
  }
}

export async function confirmarPresenca(req: AuthRequest, res: Response) {
  try {
    const { inscricaoId, horasVoluntariadas } = req.body;
    const userId = req.userId;

    // Buscar a inscrição e verificar se o usuário é o criador da vaga
    const inscricao = await prisma.inscricao.findUnique({
      where: { id: inscricaoId },
      include: { vaga: true }
    });

    if (!inscricao) {
      return res.status(404).json({ error: 'Inscrição não encontrada.' });
    }

    if (inscricao.vaga.criadorId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para confirmar esta presença.' });
    }

    const updated = await prisma.inscricao.update({
      where: { id: inscricaoId },
      data: {
        presencaConfirmada: true,
        dataConfirmacao: new Date(),
        horasVoluntariadas: horasVoluntariadas || 1,
      }
    });

    return res.json(updated);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao confirmar presença.' });
  }
}

export async function estatisticasVoluntario(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const inscricoes = await prisma.inscricao.findMany({
      where: { 
        voluntarioId: userId,
        presencaConfirmada: true
      },
      include: { vaga: true }
    });

    const totalAcoes = inscricoes.length;
    const totalHoras = inscricoes.reduce((acc, i) => acc + (i.horasVoluntariadas || 0), 0);
    
    // Categorias mais voluntariadas
    const categorias: Record<string, number> = {};
    inscricoes.forEach(i => {
      const cat = i.vaga.categoria || 'Geral';
      categorias[cat] = (categorias[cat] || 0) + 1;
    });

    return res.json({
      totalAcoes,
      totalHoras,
      categorias,
      inscricoes
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
}