import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { 
  inscrever, 
  cancelarInscricao, 
  listarInscritos, 
  minhasInscricoes,
  confirmarPresenca,
  estatisticasVoluntario
} from '../controllers/inscricaoController';

const router = Router();

router.post('/', authMiddleware, inscrever);
router.delete('/', authMiddleware, cancelarInscricao);
router.get('/vaga/:vagaId', authMiddleware, listarInscritos);
router.get('/me', authMiddleware, minhasInscricoes);
router.post('/confirmar-presenca', authMiddleware, confirmarPresenca);
router.get('/estatisticas', authMiddleware, estatisticasVoluntario);

export default router;
