import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db';
import { hashPassword, verifyPassword } from '../lib/password';
import { signAuthToken, verifyAuthToken } from '../lib/jwt';
import type { UserRow } from './users';

export const authRouter = Router();

const PUBLIC_USER_COLUMNS = 'id, first_name, last_name, email, phone, role, is_active, created_at, updated_at';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Middleware: requires a valid `Authorization: Bearer <token>` header. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    req.auth = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function publicUser(user: UserRow) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

// POST /api/auth/register — create an account and log the user in
authRouter.post('/register', async (req, res, next) => {
  const { first_name, last_name, email, password, phone } = req.body ?? {};

  if (typeof first_name !== 'string' || first_name.trim() === '') {
    res.status(400).json({ error: 'First name is required' });
    return;
  }
  if (typeof last_name !== 'string' || last_name.trim() === '') {
    res.status(400).json({ error: 'Last name is required' });
    return;
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }
  if (typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const [insert] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [
        first_name.trim(),
        last_name.trim(),
        email.toLowerCase().trim(),
        typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null,
        passwordHash,
      ],
    );
    const [rows] = await pool.query<UserRow[]>(
      `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ?`,
      [insert.insertId],
    );
    const user = rows[0];
    const token = signAuthToken(user);
    res.status(201).json({ data: { user: publicUser(user), token } });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Duplicate entry')) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }
    next(err);
  }
});

// POST /api/auth/login — email + password, returns a token
authRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const [rows] = await pool.query<(UserRow & { password_hash: string })[]>(
      `SELECT ${PUBLIC_USER_COLUMNS}, password_hash FROM users WHERE email = ?`,
      [email.toLowerCase().trim()],
    );
    const user = rows[0];
    if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = signAuthToken(user);
    res.json({ data: { user: publicUser(user), token } });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — restore the session from a token
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ?`,
      [req.auth!.sub],
    );
    if (rows.length === 0 || !rows[0].is_active) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }
    res.json({ data: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout — stateless: the client discards its token
authRouter.post('/logout', requireAuth, (_req, res) => {
  res.status(204).send();
});
