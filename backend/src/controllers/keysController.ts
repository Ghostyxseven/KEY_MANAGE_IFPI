import { Request, Response } from 'express';
import pool from '../database/connection';

// GET /api/keys
// Retorna o estado atual de todas as chaves, incluindo quem é o titular (se houver)
export async function getKeys(req: Request, res: Response) {
  try {
    // Faz um LEFT JOIN com users para retornar informações do current_holder
    const result = await pool.query(`
      SELECT 
        k.id,
        k.code,
        k.status,
        k.updated_at,
        u.name AS holder_name,
        u.matricula AS holder_matricula
      FROM keys k
      LEFT JOIN users u ON k.current_holder_id = u.id
      ORDER BY k.code ASC
    `);

    // Retorna o total e a lista de chaves ao cliente
    res.json({
      total: result.rows.length,
      keys: result.rows,
    });
  } catch (error) {
    // Em caso de erro no banco, responde 500 com a mensagem
    res.status(500).json({ error: String(error) });
  }
}