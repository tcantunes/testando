import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

function parseBrazilianDate(dateStr: string) {
  // Formato esperado: DD/MM/AAAA HH:MM
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  return new Date(year, month - 1, day, hour, minute);
}

export async function listVagas(req: Request, res: Response) {
  const vagas = await prisma.vaga.findMany({
    include: { criador: { select: { id: true, nome: true, email: true } } },
  });
  res.json(vagas);
}

export async function getVaga(req: Request, res: Response) {
  const id = Number(req.params.id);

  const vaga = await prisma.vaga.findUnique({
    where: { id },
    include: { criador: { select: { id: true, nome: true } } },
  });

  if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });

  res.json(vaga);
}

export async function createVaga(req: AuthRequest, res: Response) {
  try {
    const criadorId = Number(req.userId);

    const {
      nome,
      descricao,
      local,
      data_hora,
      vagas_disponiveis,
      categoria,
      cep,
      cidade,
      estado,
      latitude,
      longitude
    } = req.body;

    if (!nome || !descricao || !local || !data_hora) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    let dataISO = null;

    if (data_hora) {
      dataISO = parseBrazilianDate(data_hora);
      if (isNaN(dataISO.getTime())) {
        return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/AAAA HH:MM' });
      }
    }

    const vaga = await prisma.vaga.create({
      data: {
        nome,
        descricao,
        local,
        data_hora: dataISO,
        vagas_disponiveis,
        categoria,
        cep,
        cidade,
        estado,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        criadorId
      },
    });

    return res.json(vaga);

  } catch (err) {
    console.error("ERRO AO CRIAR VAGA:", err);
    return res.status(500).json({ error: 'Erro interno ao criar a vaga.' });
  }
}

export async function updateVaga(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const criadorId = Number(req.userId);

  const vaga = await prisma.vaga.findUnique({ where: { id } });
  if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });

  if (vaga.criadorId !== criadorId)
    return res.status(403).json({ error: 'Não autorizado' });

  const updated = await prisma.vaga.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
}

export async function deleteVaga(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const criadorId = Number(req.userId);

  const vaga = await prisma.vaga.findUnique({ where: { id } });
  if (!vaga) return res.status(404).json({ error: 'Vaga não encontrada' });

  if (vaga.criadorId !== criadorId)
    return res.status(403).json({ error: 'Não autorizado' });

  await prisma.vaga.delete({ where: { id } });

  res.json({ ok: true });
}

export async function myVagas(req: AuthRequest, res: Response) {
  const criadorId = Number(req.userId);
  const vagas = await prisma.vaga.findMany({ where: { criadorId } });
  res.json(vagas);
}
