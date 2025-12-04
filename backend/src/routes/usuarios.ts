// voluntariado-app/backend/src/routes/usuarios.ts
import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/usuarioController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);

export default router;
