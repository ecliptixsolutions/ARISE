// auth.js — JWT session helpers (jose, works in Node ≥ 18 and CF Workers)
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from './db.js';

const BCRYPT_ROUNDS = 12;
const SESSION_TTL_HOURS = 24;

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET not configured');
  return new TextEncoder().encode(s);
}

// ── Password helpers ─────────────────────────────────────────
export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ── JWT ──────────────────────────────────────────────────────
export async function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + SESSION_TTL_HOURS * 3600;
  return new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .sign(getSecret());
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
  return payload;
}

// ── Session management ───────────────────────────────────────
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(userId, token, userAgent, ip) {
  const id = uuidv4();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000)
    .toISOString().replace('T', ' ').replace('Z', '');
  await query(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, user_agent, ip_address) VALUES (?,?,?,?,?,?)',
    [id, userId, tokenHash, expiresAt, userAgent?.slice(0, 500) ?? null, ip ?? null],
  );
  return id;
}

export async function validateSession(token) {
  const tokenHash = await sha256Hex(token);
  const [rows] = await query(
    `SELECT s.id, s.user_id, s.expires_at,
            u.email, u.full_name, u.is_active,
            ur.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN user_roles ur ON ur.user_id = s.user_id AND ur.role IN ('admin','staff')
     WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
     LIMIT 1`,
    [tokenHash],
  );
  if (!rows.length) return null;
  const row = rows[0];
  if (!row.is_active) return null;
  return {
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role ?? 'user',
    sessionId: row.id,
  };
}

export async function destroySession(token) {
  const tokenHash = await sha256Hex(token);
  await query('DELETE FROM sessions WHERE token_hash = ?', [tokenHash]);
}

export async function destroyAllUserSessions(userId) {
  await query('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

// ── Cleanup expired sessions (call periodically) ─────────────
export async function pruneExpiredSessions() {
  await query('DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()');
}
