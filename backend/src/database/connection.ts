import 'dotenv/config';
import { Pool } from 'pg';

const dbPassword = process.env.DB_PASSWORD;

console.log('🔍 DB Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: dbPassword ? '***definida***' : 'VAZIA',
  database: process.env.DB_NAME,
});

if (!dbPassword || typeof dbPassword !== 'string' || dbPassword.trim() === '') {
  console.error('❌ DB_PASSWORD inválida ou não definida. Abortando inicialização. Verifique backend/.env');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: dbPassword,
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool do PostgreSQL:', err);
});

export default pool;