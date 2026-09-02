import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { ScryptOptions } from 'node:crypto';

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS: ScryptOptions = { N: 16384, r: 8, p: 1 };

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/** Hashes a password with a random salt, stored as `salt:hash` (hex). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `${salt}:${hash.toString('hex')}`;
}

/** Constant-time comparison of a plaintext password against a stored `salt:hash`. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const separator = stored.indexOf(':');
  if (separator === -1) return false;
  const salt = stored.slice(0, separator);
  const expectedHex = stored.slice(separator + 1);
  if (!salt || !expectedHex) return false;

  try {
    const candidate = await scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
    const expected = Buffer.from(expectedHex, 'hex');
    if (candidate.length !== expected.length) return false;
    return timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}