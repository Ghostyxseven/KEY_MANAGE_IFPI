import { Request, Response } from 'express';
import pool from '../database/connection';

interface SyncEvent {
  id: string;
  device_id: string;
  type: 'RETIRADA' | 'DEVOLUCAO';
  key_id: number;
  user_id: number;
  device_timestamp: string;
}

// POST /api/sync
export async function syncEvents(req: Request, res: Response) {
  const events: SyncEvent[] = req.body.events;

  if (!events || !Array.isArray(events) || events.length === 0) {
    res.status(400).json({ error: 'Nenhum evento recebido.' });
    return;
  }


  const applied: string[] = [];
  const conflicts: string[] = [];
  const skipped: string[] = [];


  for (const event of events) {
    // 1. Verifica se o evento já existe (evita duplicidade)
    const exists = await pool.query(
      'SELECT id FROM events WHERE id = $1',
      [event.id]
    );

    if (exists.rows.length > 0) {
      skipped.push(event.id);
      continue;
    }

    // 2. Busca o último evento aplicado para essa chave
    const lastEvent = await pool.query(
      `SELECT device_timestamp, type FROM events 
       WHERE key_id = $1 AND status = 'applied'
       ORDER BY device_timestamp DESC 
       LIMIT 1`,
      [event.key_id]
    );

    // 3. Verifica conflito de timestamp
    if (lastEvent.rows.length > 0) {
      const lastTimestamp = new Date(lastEvent.rows[0].device_timestamp);
      const newTimestamp = new Date(event.device_timestamp);

      if (newTimestamp <= lastTimestamp) {
        // Conflito — evento mais antigo chegou depois
        await pool.query(
          `INSERT INTO events (id, device_id, type, key_id, user_id, device_timestamp, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'conflict')`,
          [event.id, event.device_id, event.type, event.key_id, event.user_id, event.device_timestamp]
        );
        conflicts.push(event.id);
        continue;
      }
    }

    // 4. Aplica o evento — atualiza estado da chave
    if (event.type === 'RETIRADA') {
      await pool.query(
        `UPDATE keys SET status = 'in_use', current_holder_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [event.user_id, event.key_id]
      );
    } else if (event.type === 'DEVOLUCAO') {
      await pool.query(
        `UPDATE keys SET status = 'available', current_holder_id = NULL, updated_at = NOW()
         WHERE id = $1`,
        [event.key_id]
      );
    }

    // 5. Registra evento como aplicado
    await pool.query(
      `INSERT INTO events (id, device_id, type, key_id, user_id, device_timestamp, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'applied')`,
      [event.id, event.device_id, event.type, event.key_id, event.user_id, event.device_timestamp]
    );

    applied.push(event.id);
  }

  res.json({
    received: events.length,
    applied: applied.length,
    conflicts: conflicts.length,
    skipped: skipped.length,
    detail: { applied, conflicts, skipped },
  });
}

// GET /api/sync/status/:deviceId
export async function getSyncStatus(req: Request, res: Response) {
  const { deviceId } = req.params;

  const result = await pool.query(
    `SELECT id, type, key_id, device_timestamp, status
     FROM events
     WHERE device_id = $1
     ORDER BY device_timestamp DESC`,
    [deviceId]
  );

  res.json({
    device_id: deviceId,
    total: result.rows.length,
    events: result.rows,
  });
}