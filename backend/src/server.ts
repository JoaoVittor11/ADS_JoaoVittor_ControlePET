import express from 'express';
import dotenv from 'dotenv';

// ALTERAÇÃO PRINCIPAL: Carrega o dotenv ANTES de qualquer outra importação do nosso código
dotenv.config();

// Agora sim, importa os outros módulos
import './config/database'; 
import tutorRoutes from './routes/tutorRoutes';

const app = express();
// Garante que a porta seja lida corretamente do .env, com um padrão seguro.
const port = process.env.PORT || 3333;

// ======================= DEBUG =======================
// Esta linha vai nos mostrar qual porta estamos realmente tentando usar
console.log(`[DEBUG] Tentando iniciar o servidor na porta: ${port}`);
// =====================================================

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do PetShop System está no ar!');
});

app.use('/api/tutores', tutorRoutes);

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});