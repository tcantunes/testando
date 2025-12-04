import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'trocar_essa_chave';

export async function register(req: Request, res: Response) {
  try {
    const {
      nome,
      email,
      senha,
      telefone,
      cep,
      rua,
      cidade,
      estado,
      tipo, // fisico ou juridico
      cpf,
      cnpj,
      latitude,
      longitude
    } = req.body;

    // Validações mínimas
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // Tipo fisico exige CPF
    if (tipo === 'fisico' && !cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório para usuários do tipo físico.' });
    }

    // Tipo juridico exige CNPJ
    if (tipo === 'juridico' && !cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório para usuários do tipo jurídico.' });
    }

    // Verificar se email já existe
    const userExists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    // Criptografar a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        telefone,
        cep,
        rua,
        cidade,
        estado,
        tipo,
        cpf: tipo === 'fisico' ? cpf : null,
        cnpj: tipo === 'juridico' ? cnpj : null,
        latitude: latitude ?? null,
        longitude: longitude ?? null
      },
    });

    // Criar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        telefone: user.telefone,
        cep: user.cep,
        rua: user.rua,
        cidade: user.cidade,
        estado: user.estado,
        cpf: user.cpf,
        cnpj: user.cnpj,
        latitude: user.latitude,
        longitude: user.longitude
      },
    });

  } catch (error) {
    console.error('Erro no register:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senhaHash);

    if (!senhaValida) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      telefone: user.telefone,
      cep: user.cep,
      rua: user.rua,
      cidade: user.cidade,
      estado: user.estado,
      cpf: user.cpf,
      cnpj: user.cnpj,
      latitude: user.latitude,
      longitude: user.longitude
    });

  } catch (error) {
    console.error('Erro no me:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
