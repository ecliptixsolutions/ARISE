// routes/auth.routes.js — login, logout, password reset
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import {
  hashPassword, verifyPassword, signToken,
  createSession, destroySession, destroyAllUserSessions,
} from '../auth.js';
import { query, transaction } from '../db.js';
import { requireAuth, clientMeta } from '../middleware.js';
import { newId, nowUtc } from '../helpers.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const meta = clientMeta(req);

  const [rows] = await query(
    `SELECT u.id, u.email, u.password_hash, u.full_name, u.is_active, ur.role
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.role IN ('admin','staff')
     WHERE u.email = ?
     LIMIT 1`,
    [email.trim().toLowerCase()],
  );

  const user = rows[0];
  const valid = user ? await verifyPassword(password, user.password_hash) : false;

  // Audit — failure
  if (!valid) {
    const auditId = newId();
    await query(
      'INSERT INTO admin_login_audit (id,email,event_type,success,user_agent,ip_address) VALUES (?,?,?,0,?,?)',
      [auditId, email.slice(0, 255), 'password_login', meta.userAgent, meta.ip],
    ).catch(() => {});
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Account is disabled' });
  }

  if (!user.role || !['admin', 'staff'].includes(user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // Load staff permissions
  const [permRows] = await query(
    'SELECT permission FROM staff_permissions WHERE user_id = ?',
    [user.id],
  );
  const permissions = permRows.map(r => r.permission);

  // Sign token
  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.full_name,
  });

  await createSession(user.id, token, meta.userAgent, meta.ip);

  // Audit — success
  const auditId = newId();
  await query(
    'INSERT INTO admin_login_audit (id,user_id,email,role,event_type,success,user_agent,ip_address) VALUES (?,?,?,?,?,1,?,?)',
    [auditId, user.id, user.email, user.role, 'login_success', meta.userAgent, meta.ip],
  ).catch(() => {});

  // Send login alert email (non-blocking)
  sendLoginAlert(user.email, user.full_name ?? user.email, user.role, meta.userAgent, meta.ip).catch(() => {});

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isAdmin: user.role === 'admin',
      isStaff: user.role === 'staff',
      permissions,
    },
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  const header = req.headers['authorization'] ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) await destroySession(token).catch(() => {});
  return res.json({ ok: true });
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const { userId, role } = req.user;
  const [profRows] = await query(
    'SELECT email, full_name, is_active FROM profiles WHERE id = ?', [userId],
  );
  const [permRows] = await query(
    'SELECT permission FROM staff_permissions WHERE user_id = ?', [userId],
  );
  const profile = profRows[0] ?? {};
  return res.json({
    id: userId,
    email: profile.email ?? req.user.email,
    fullName: profile.full_name ?? req.user.fullName,
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
    permissions: permRows.map(r => r.permission),
  });
});

// ── POST /api/auth/request-password-reset ────────────────────
const resetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
router.post('/request-password-reset', resetLimiter, async (req, res) => {
  const { email } = req.body ?? {};
  // Always return 200 to avoid user enumeration
  if (!email) return res.json({ ok: true });

  const [rows] = await query('SELECT id, email FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (!rows.length) return res.json({ ok: true });

  const user = rows[0];
  const rawToken = uuidv4() + uuidv4();
  const tokenHash = await sha256Hex(rawToken);
  const id = newId();
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString().replace('T', ' ').replace('Z', '');

  await query(
    'INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?,?,?,?)',
    [id, user.id, tokenHash, expiresAt],
  );

  // Send reset email (non-blocking)
  sendPasswordResetEmail(user.email, rawToken).catch(() => {});
  return res.json({ ok: true });
});

// ── POST /api/auth/reset-password ────────────────────────────
router.post('/reset-password', resetLimiter, async (req, res) => {
  const { token, password } = req.body ?? {};
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token and password (≥8 chars) required' });
  }

  const hash = await sha256Hex(token);
  const [rows] = await query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = ? AND used = 0 AND expires_at > UTC_TIMESTAMP()`,
    [hash],
  );
  if (!rows.length) return res.status(400).json({ error: 'Invalid or expired reset link' });

  const { id: tokenId, user_id } = rows[0];
  const passwordHash = await hashPassword(password);

  await transaction(async conn => {
    await conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user_id]);
    await conn.execute('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokenId]);
    await conn.execute('DELETE FROM sessions WHERE user_id = ?', [user_id]);
  });

  return res.json({ ok: true });
});

// ── POST /api/auth/change-password (authenticated) ───────────
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Current password and new password (≥8 chars) required' });
  }

  const [rows] = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.userId]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });

  const valid = await verifyPassword(currentPassword, rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

  const hash = await hashPassword(newPassword);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.userId]);

  return res.json({ ok: true });
});

// ── Internal helpers ──────────────────────────────────────────
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sendLoginAlert(email, name, role, userAgent, ip) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SECURITY_ALERT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const lines = [
    'Arise Healthcare Solutions admin login alert',
    `Account: ${name} (${role})`,
    `Time: ${timestamp}`,
    userAgent ? `Browser/device: ${userAgent}` : null,
    ip ? `IP: ${ip}` : null,
    'If you did not perform this login, secure your account immediately.',
  ].filter(Boolean);
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: email, subject: 'Arise Healthcare Solutions login alert', text: lines.join('\n') }),
  });
}

async function sendPasswordResetEmail(email, rawToken) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SECURITY_ALERT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  const origin = process.env.ALLOWED_ORIGIN || 'https://arisehealthcare.in';
  if (!apiKey || !from) return;
  const link = `${origin}/admin/login?reset_token=${rawToken}`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Arise Healthcare Solutions — Password Reset',
      text: `You requested a password reset.\n\nClick this link within 1 hour:\n${link}\n\nIf you did not request this, ignore this email.`,
    }),
  });
}

export default router;
