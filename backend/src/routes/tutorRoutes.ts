import { Router } from 'express';
import { 
    cadastrarTutor, 
    loginTutor, 
    getPerfilTutor, 
    cadastrarPet,
    atualizarPerfilTutor,
    listarPetsTutor,
    atualizarPet,
    deletarPet
} from '../controllers/tutorController';
import { proteger } from '../middlewares/authMiddleware';

const router = Router();

// ============================================
// CADASTRO
// ============================================
router.post('/cadastro', cadastrarTutor);

// ============================================
// LOGIN
// ============================================
router.post('/login', loginTutor);

// ============================================
// PERFIL - GET e PUT
// ============================================
router.get('/perfil', proteger, getPerfilTutor);
router.put('/perfil', proteger, atualizarPerfilTutor);

// ============================================
// PETS - CRUD COMPLETO
// ============================================
router.post('/pets', proteger, cadastrarPet);           // Criar pet
router.get('/pets', proteger, listarPetsTutor);         // Listar pets
router.put('/pets/:petId', proteger, atualizarPet);     // Atualizar pet
router.delete('/pets/:petId', proteger, deletarPet);    // Deletar pet

export default router;
