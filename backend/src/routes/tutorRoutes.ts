import { Router } from 'express';
import { 
    cadastrarTutor, 
    loginTutor, 
    getPerfilTutor, 
    cadastrarPet,
    atualizarPerfilTutor
} from '../controllers/tutorController';
import { proteger } from '../middlewares/authMiddleware';

const router = Router();

// Cadastro
router.post('/cadastro', cadastrarTutor);

// Login
router.post('/login', loginTutor);

// Perfil - GET e PUT
router.get('/perfil', proteger, getPerfilTutor);
router.put('/perfil', proteger, atualizarPerfilTutor);

// Pets
router.post('/pets', proteger, cadastrarPet);

export default router;
