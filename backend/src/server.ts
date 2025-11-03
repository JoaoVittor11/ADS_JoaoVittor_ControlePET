import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // 1. Importa a biblioteca cors

dotenv.config();

import './config/database'; 
import tutorRoutes from './routes/tutorRoutes';

const app = express();
const port = process.env.PORT || 3333;

app.use(cors()); // 2. Habilita o CORS para todas as rotas
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do PetShop System está no ar!');
});

app.use('/api/tutores', tutorRoutes);

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});