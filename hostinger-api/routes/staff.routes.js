// routes/staff.routes.js — staff management (admin only)
import { Router } from 'express';
import { query, transaction } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware.js';
import { hashPassword } from '../auth.js';
import { newId } from '../helpers.js';

const router = Router();

// All staff routes require auth + admin
router.use(requireAuth, requireAdmin);

// ── GET /api/staff ────────────────────────────────────────────
router.get('/', async (req, res) => {
  const [roles] = await query(
    `SELECT user_id, role FROM user_roles WHERE role IN ('admin','staff')`,
  );
  const [profiles] = await query(
    `SELECT id, email, full_name, is_active, created_at FROM profiles`,
  );
  const [perms] = await query(`SELECT user_id, permission FROM staff_permissions`);

  const roleMap = new Map(roles.map(r => [r.user_id, r.role]));
  const permMap = new Map();
  perms.forEach(p => {
    if (!permMap.has(p.user_id)) permMap.set(p.user_id, []);
    permMap.get(p.user_id).push(p.permission);
  });

  const staff = profiles
    .filter(p => roleMap.has(p.id))
    .map(p => ({
      ...p,
      role: roleMap.get(p.id),
      permissions: permMap.get(p.id) ?? [],
    }));

  return res.json(staff);
});

// ── POST /api/staff ───────────────────────────────────────────
router.post('/', async (req, res) => {
  const { full_name, email, password, role = 'staff', permissions = [] } = req.body ?? {};
  if (!full_name || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'full_name, email, and password (≥8 chars) required' });
  }
  if (!['admin', 'staff'].includes(role)) {
    return res.status(400).json({ error: 'role must be admin or staff' });
  }

  // Check email uniqueness
  const [existing] = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
  if (existing.length) return res.status(409).json({ error: 'Email already in use' });

  const id = newId();
  const passwordHash = await hashPassword(password);
  const effectivePerms = role === 'admin' ? [] : [...new Set(permissions)];

  await transaction(async conn => {
    await conn.execute(
      `INSERT INTO users (id, email, password_hash, full_name, is_active) VALUES (?,?,?,?,1)`,
      [id, email.trim().toLowerCase(), passwordHash, full_name.trim()],
    );
    await conn.execute(
      `INSERT INTO profiles (id, email, full_name, is_active) VALUES (?,?,?,1)`,
      [id, email.trim().toLowerCase(), full_name.trim()],
    );
    await conn.execute(
      `INSERT INTO user_roles (id, user_id, role) VALUES (?,?,?)`,
      [newId(), id, role],
    );
    for (const perm of effectivePerms) {
      await conn.execute(
        `INSERT IGNORE INTO staff_permissions (user_id, permission, granted_by) VALUES (?,?,?)`,
        [id, perm, req.user.userId],
      );
    }
  });

  return res.status(201).json({ id });
});

// ── PATCH /api/staff/:id/active ───────────────────────────────
router.patch('/:id/active', async (req, res) => {
  const { is_active } = req.body ?? {};
  if (is_active === undefined) return res.status(400).json({ error: 'is_active required' });

  await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
  await query('UPDATE profiles SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);

  if (!is_active) {
    // invalidate all sessions for disabled user
    await query('DELETE FROM sessions WHERE user_id = ?', [req.params.id]);
  }

  return res.json({ ok: true });
});

// ── PATCH /api/staff/:id/password ─────────────────────────────
router.patch('/:id/password', async (req, res) => {
  const { password } = req.body ?? {};
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be ≥ 8 characters' });
  }
  const hash = await hashPassword(password);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
  await query('DELETE FROM sessions WHERE user_id = ?', [req.params.id]);
  return res.json({ ok: true });
});

// ── PUT /api/staff/:id/permissions ────────────────────────────
router.put('/:id/permissions', async (req, res) => {
  const { permissions } = req.body ?? {};
  if (!Array.isArray(permissions)) return res.status(400).json({ error: 'permissions array required' });

  await transaction(async conn => {
    await conn.execute('DELETE FROM staff_permissions WHERE user_id = ?', [req.params.id]);
    for (const perm of [...new Set(permissions)]) {
      await conn.execute(
        'INSERT INTO staff_permissions (user_id, permission, granted_by) VALUES (?,?,?)',
        [req.params.id, perm, req.user.userId],
      );
    }
  });

  return res.json({ ok: true });
});

export default router;
