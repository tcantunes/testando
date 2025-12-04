// backend/src/controllers/usuariosController.ts
import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth';

export async function getMyProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        cpf: true,
        cnpj: true,
        cep: true,
        rua: true,
        cidade: true,
        estado: true,
        latitude: true,
        longitude: true,
      }
    });

    return res.json(user);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao carregar perfil.' });
  }
}

export async function updateMyProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const {
      nome,
      telefone,
      cpf,
      cnpj,
      cep,
      rua,
      cidade,
      estado,
      latitude,
      longitude,
    } = req.body;

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome,
        telefone,
        cpf,
        cnpj,
        cep,
        rua,
        cidade,
        estado,
        latitude,
        longitude,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        cnpj: true,
        cep: true,
        rua: true,
        cidade: true,
        estado: true,
        latitude: true,
        longitude: true,
      }
    });

    return res.json(updated);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
}
