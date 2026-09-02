import { Router } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db';
import { hashPassword } from '../lib/password';

export const usersRouter = Router();

export interface UserRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: 'owner' | 'veterinarian' | 'staff' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS = 'id, first_name, last_name, email, phone, role, is_active, created_at, updated_at';

// GET /api/users — list users (pagination + role filter)
usersRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const role = req.query.role as string | undefined;

    let sql = `SELECT ${SELECT_COLUMNS} FROM users`;
    const params: unknown[] = [];
    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }
    sql += ' ORDER BY id LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query<UserRow[]>(sql, params);
    res.json({ data: rows, limit, offset });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id — single user
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM users WHERE id = ?`,
      [req.params.id],
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

interface CreateUserBody {
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
  password?: unknown;
}

const VALID_ROLES = ['owner', 'veterinarian', 'staff', 'admin'];

function validateUserBody(body: CreateUserBody): { error: string } | { values: {
  first_name: string; last_name: string; email: string; phone: string | null; role: string;
  password: string | null;
} } {
  const { first_name, last_name, email, role } = body;
  if (typeof first_name !== 'string' || first_name.trim() === '') return { error: 'first_name is required' };
  if (typeof last_name !== 'string' || last_name.trim() === '') return { error: 'last_name is required' };
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'a valid email is required' };
  if (role !== undefined && !VALID_ROLES.includes(role as string)) {
    return { error: `role must be one of: ${VALID_ROLES.join(', ')}` };
  }
  const password = body.password;
  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 8) {
      return { error: 'password must be at least 8 characters' };
    }
  }
  return {
    values: {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      phone: typeof body.phone === 'string' && body.phone.trim() !== '' ? body.phone.trim() : null,
      role: (role as string) ?? 'owner',
      password: typeof password === 'string' ? password : null,
    },
  };
}

// POST /api/users — create user
usersRouter.post('/', async (req, res, next) => {
  const result = validateUserBody(req.body ?? {});
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  try {
    const { values } = result;
    const passwordHash = values.password ? await hashPassword(values.password) : 'pending_setup';
    const [insert] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (first_name, last_name, email, phone, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [values.first_name, values.last_name, values.email, values.phone, values.role, passwordHash],
    );
    const [rows] = await pool.query<UserRow[]>(`SELECT ${SELECT_COLUMNS} FROM users WHERE id = ?`, [insert.insertId]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Duplicate entry')) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }
    next(err);
  }
});

// PATCH /api/users/:id — partial update
usersRouter.patch('/:id', async (req, res, next) => {
  const allowed = ['first_name', 'last_name', 'phone', 'role', 'is_active'] as const;
  const updates: string[] = [];
  const params: unknown[] = [];

  for (const key of allowed) {
    if (req.body?.[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: `Provide at least one of: ${allowed.join(', ')}` });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      [...params, req.params.id],
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const [rows] = await pool.query<UserRow[]>(`SELECT ${SELECT_COLUMNS} FROM users WHERE id = ?`, [req.params.id]);
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id — soft delete (deactivate)
usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ data: { id: Number(req.params.id), is_active: false } });
  } catch (err) {
    next(err);
  }
});
