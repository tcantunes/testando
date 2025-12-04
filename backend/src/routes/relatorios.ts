// voluntariado-app/backend/src/routes/relatorios.ts
import { Router } from 'express';
import { getOngMetrics } from '../controllers/reportsController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/ong', authMiddleware, getOngMetrics);

export default router;
