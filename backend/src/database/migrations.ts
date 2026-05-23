import 'dotenv/config';
import pool from './connection';

async function runMigrations() {
  console.log('🔄 Rodando migrations...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      matricula VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Tabela users criada');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS keys (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      status VARCHAR(10) DEFAULT 'available',
      current_holder_id INT REFERENCES users(id),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Tabela keys criada');

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id VARCHAR(50) NOT NULL,
      type VARCHAR(20) NOT NULL,
      key_id INT REFERENCES keys(id),
      user_id INT REFERENCES users(id),
      device_timestamp TIMESTAMP NOT NULL,
      server_timestamp TIMESTAMP DEFAULT NOW(),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Tabela events criada');

  console.log('🎉 Migrations concluídas!');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('❌ Erro nas migrations:', err);
  process.exit(1);
});