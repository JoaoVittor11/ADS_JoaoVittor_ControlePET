import { Router } from 'express';
import { cadastrarTutor, loginTutor, getPerfilTutor } from '../controllers/tutorController';
import { proteger } from '../middlewares/authMiddleware';

const router = Router();

router.post('/cadastro', cadastrarTutor);
router.post('/login', loginTutor);

// Rota GET para o perfil, protegida pelo middleware 'proteger'
router.get('/perfil', proteger, getPerfilTutor);

export default router;
