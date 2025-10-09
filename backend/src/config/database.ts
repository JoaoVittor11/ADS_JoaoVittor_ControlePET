import { Pool } from 'pg';
import dotenv from 'dotenv';

// Ajusta o caminho para encontrar o .env a partir da pasta /src/config
dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  // Adiciona um timeout para a conexão não ficar presa indefinidamente
  connectionTimeoutMillis: 5000, 
});

// Função assíncrona para testar a conexão e dar um erro detalhado
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Backend conectado com sucesso ao banco de dados PostgreSQL!');
  } catch (error: any) {
    console.error('===================== ERRO DETALHADO DA CONEXÃO =====================');
    console.error(`Ocorreu um erro ao tentar conectar ao banco de dados.`);
    console.error(`- Verifique se o serviço do PostgreSQL está rodando na sua máquina.`);
    console.error(`- Verifique se as credenciais no arquivo .env (usuário, senha, nome do banco) estão corretas.`);
    console.error('Detalhes do erro:', error.message);
    console.error('=====================================================================');
    // Encerra o processo se não conseguir conectar, para o nodemon reiniciar.
    process.exit(1); 
  } finally {
    // Garante que o cliente seja liberado de volta para a pool
    if (client) {
      client.release();
    }
  }
};

// Chama a função de teste para ser executada quando este arquivo for importado
testConnection();

export default pool;
