// backend/src/routes/vagas.ts
import { Router } from 'express';
import {
  listVagas,
  getVaga,
  createVaga,
  updateVaga,
  deleteVaga,
  myVagas
} from '../controllers/vagasController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', listVagas);
router.get('/me', authMiddleware, myVagas);
router.get('/:id', getVaga);

router.post('/', authMiddleware, createVaga);
router.put('/:id', authMiddleware, updateVaga);
router.delete('/:id', authMiddleware, deleteVaga);

export default router;
