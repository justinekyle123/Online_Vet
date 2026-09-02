import { Router } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db';
import type { UserRow } from './users';

export const petsRouter = Router();

interface PetRow extends RowDataPacket {
  id: number;
  owner_id: number;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile' | 'other';
  breed: string | null;
  sex: 'male' | 'female' | 'unknown';
  date_of_birth: string | null;
  color: string | null;
  microchip_number: string | null;
  weight_kg: string | null;
  allergies: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  'id, owner_id, name, species, breed, sex, date_of_birth, color, microchip_number, weight_kg, allergies, notes, created_at, updated_at';

const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'other'];

async function ownerExists(ownerId: number): Promise<boolean> {
  const [rows] = await pool.query<UserRow[]>('SELECT id FROM users WHERE id = ?', [ownerId]);
  return rows.length > 0;
}

// GET /api/pets — list pets (optional ?owner_id= filter)
petsRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    let sql = `SELECT ${SELECT_COLUMNS} FROM pets`;
    const params: unknown[] = [];
    if (req.query.owner_id) {
      sql += ' WHERE owner_id = ?';
      params.push(Number(req.query.owner_id));
    }
    sql += ' ORDER BY id LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query<PetRow[]>(sql, params);
    res.json({ data: rows, limit, offset });
  } catch (err) {
    next(err);
  }
});

// GET /api/pets/:id
petsRouter.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query<PetRow[]>(`SELECT ${SELECT_COLUMNS} FROM pets WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/pets — create pet
petsRouter.post('/', async (req, res, next) => {
  const { owner_id, name, species } = req.body ?? {};
  if (!Number.isInteger(owner_id)) {
    res.status(400).json({ error: 'owner_id (integer) is required' });
    return;
  }
  if (typeof name !== 'string' || name.trim() === '') {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  if (!SPECIES.includes(species)) {
    res.status(400).json({ error: `species must be one of: ${SPECIES.join(', ')}` });
    return;
  }

  try {
    if (!(await ownerExists(owner_id))) {
      res.status(404).json({ error: `Owner ${owner_id} does not exist` });
      return;
    }
    const [insert] = await pool.query<ResultSetHeader>(
      `INSERT INTO pets (owner_id, name, species, breed, sex, date_of_birth, color, microchip_number, weight_kg, allergies, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        owner_id,
        name.trim(),
        species,
        req.body.breed ?? null,
        req.body.sex ?? 'unknown',
        req.body.date_of_birth ?? null,
        req.body.color ?? null,
        req.body.microchip_number ?? null,
        req.body.weight_kg ?? null,
        req.body.allergies ?? null,
        req.body.notes ?? null,
      ],
    );
    const [rows] = await pool.query<PetRow[]>(`SELECT ${SELECT_COLUMNS} FROM pets WHERE id = ?`, [insert.insertId]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Duplicate entry')) {
      res.status(409).json({ error: 'A pet with this microchip number already exists' });
      return;
    }
    next(err);
  }
});

// PATCH /api/pets/:id — partial update
petsRouter.patch('/:id', async (req, res, next) => {
  const allowed = ['name', 'species', 'breed', 'sex', 'date_of_birth', 'color', 'microchip_number', 'weight_kg', 'allergies', 'notes'] as const;
  const updates: string[] = [];
  const params: unknown[] = [];

  for (const key of allowed) {
    if (req.body?.[key] !== undefined) {
      if (key === 'species' && !SPECIES.includes(req.body[key])) {
        res.status(400).json({ error: `species must be one of: ${SPECIES.join(', ')}` });
        return;
      }
      if (key === 'name' && (typeof req.body[key] !== 'string' || req.body[key].trim() === '')) {
        res.status(400).json({ error: 'name cannot be empty' });
        return;
      }
      updates.push(`${key} = ?`);
      params.push(key === 'name' ? req.body[key].trim() : req.body[key]);
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: `Provide at least one of: ${allowed.join(', ')}` });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE pets SET ${updates.join(', ')} WHERE id = ?`,
      [...params, req.params.id],
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }
    const [rows] = await pool.query<PetRow[]>(`SELECT ${SELECT_COLUMNS} FROM pets WHERE id = ?`, [req.params.id]);
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pets/:id — hard delete (owner records keep RESTRICT; appointments SET NULL)
petsRouter.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM pets WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
