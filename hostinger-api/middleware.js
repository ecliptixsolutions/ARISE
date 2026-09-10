// middleware.js — Express middleware for Arise API
import { validateSession } from './auth.js';
import { query } from './db.js';

// Constant-time string comparison to prevent timing attacks on the API secret
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ── API secret (Cloudflare Worker → this API) ─────────────────
// Uses constant-time comparison to prevent timing-based enumeration.
export function requireApiSecret(req, res, next) {
  const secret = req.headers['x-arise-secret'] ?? '';
  const expected = process.env.ARISE_API_SECRET ?? '';
  if (!secret || !expected || !safeEqual(secret, expected)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── Session auth — validates JWT and attaches user to req ─────
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers['authorization'] ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });

    const user = await validateSession(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Auth error' });
  }
}

// ── Admin only ────────────────────────────────────────────────
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
}

// ── Staff permission check ────────────────────────────────────
// Admin always passes. Staff must have the specific permission AND be active.
export function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role === 'admin') return next();

    try {
      const [rows] = await query(
        `SELECT 1 FROM staff_permissions sp
         JOIN profiles p ON p.id = sp.user_id
         WHERE sp.user_id = ? AND sp.permission = ? AND p.is_active = 1
         LIMIT 1`,
        [req.user.userId, permission],
      );
      if (!rows.length) return res.status(403).json({ error: 'Permission denied' });
      next();
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// ── Extract client metadata (IP + user-agent) ─────────────────
export function clientMeta(req) {
  // Prefer Cloudflare-provided connecting IP, fall back to x-forwarded-for
  const ip =
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    null;
  return {
    userAgent: (req.headers['user-agent'] ?? '').slice(0, 500) || null,
    ip: ip ? String(ip).slice(0, 50) : null,
  };
}
