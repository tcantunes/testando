import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'trocar_essa_chave';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token não enviado' });

  const token = header.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; tipo: string };
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
