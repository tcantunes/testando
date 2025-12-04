import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { enviarMensagem, buscarMensagensPorVaga } from '../controllers/chatController';

const router = Router();

router.post('/send', authMiddleware, enviarMensagem);
router.get('/vaga/:vagaId', authMiddleware, buscarMensagensPorVaga);

export default router;
