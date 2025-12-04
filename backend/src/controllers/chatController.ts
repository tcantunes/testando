import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export async function enviarMensagem(req: AuthRequest, res: Response) {
  const { mensagem, vagaId } = req.body;

  if (!mensagem || mensagem.trim() === '')
    return res.status(400).json({ error: 'Mensagem vazia.' });

  const nova = await prisma.chatMessage.create({
    data: {
      mensagem,
      vagaId,
      usuarioId: req.userId!
    }
  });

  res.json(nova);
}

export async function buscarMensagensPorVaga(req: Request, res: Response) {
  const vagaId = Number(req.params.vagaId);

  const mensagens = await prisma.chatMessage.findMany({
    where: { vagaId },
    include: {
      usuario: {
        select: { id: true, nome: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json(mensagens);
}
