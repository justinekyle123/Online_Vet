import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRow } from '../routes/users';

export interface AuthTokenPayload {
  sub: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

/** Issues a signed JWT for an authenticated user. */
export function signAuthToken(user: Pick<UserRow, 'id' | 'email' | 'role'>): string {
  return jwt.sign({ email: user.email, role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

/** Verifies a JWT and returns its payload. Throws on invalid/expired tokens. */
export function verifyAuthToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, env.jwtSecret);
  if (typeof payload === 'string' || payload.sub === undefined) {
    throw new Error('Invalid token payload');
  }
  return {
    sub: Number(payload.sub),
    email: typeof payload.email === 'string' ? payload.email : '',
    role: typeof payload.role === 'string' ? payload.role : 'owner',
  };
}