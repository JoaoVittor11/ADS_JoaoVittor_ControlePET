import { Router } from 'express';
// Importa a função específica do arquivo do controlador
import { cadastrarTutor } from '../controllers/tutorController';

const router = Router();

router.post('/cadastro', cadastrarTutor);

// Exporta o roteador como padrão
export default router;