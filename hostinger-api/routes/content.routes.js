// routes/content.routes.js — services, testimonials, enquiries, notifications,
//                             orders, office availability, website images, polling
import { Router } from 'express';
import { query, transaction } from '../db.js';
import { requireAuth, requirePermission, requireAdmin } from '../middleware.js';
import { newId, logChange, insertNotification } from '../helpers.js';

const router = Router();

function str(val, max = 500) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s.length ? s.slice(0, max) : null;
}

function normalizeEmail(val) {
  const email = str(val, 255);
  return email ? email.toLowerCase() : null;
}

// ══════════════════════════════════════════════════════════════
// SERVICES
// ══════════════════════════════════════════════════════════════
router.get('/services', async (req, res) => {
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'staff';
  const [rows] = await query(
    isAdmin
      ? 'SELECT * FROM services ORDER BY sort_order ASC'
      : 'SELECT * FROM services WHERE is_published = 1 ORDER BY sort_order ASC',
  );
  return res.json(rows.map(r => ({
    ...r,
    common_problems: parseJson(r.common_problems, []),
    carousel_images: parseJson(r.carousel_images, []),
  })));
});

router.put('/services/:slug', requireAuth, requirePermission('services'), async (req, res) => {
  const d = req.body ?? {};
  const exists = (await query('SELECT slug FROM services WHERE slug = ? LIMIT 1', [req.params.slug]))[0].length;

  if (exists) {
    await query(
      `UPDATE services SET name=?,category=?,short_description=?,detailed_description=?,
         common_problems=?,carousel_images=?,primary_image_id=?,is_published=?,is_featured=?,sort_order=?
       WHERE slug=?`,
      [d.name, d.category, d.short_description, d.detailed_description,
       JSON.stringify(d.common_problems ?? []), JSON.stringify(d.carousel_images ?? []),
       d.primary_image_id || null, d.is_published ? 1 : 0, d.is_featured ? 1 : 0,
       d.sort_order ?? 0, req.params.slug],
    );
  } else {
    await query(
      `INSERT INTO services (slug,name,category,short_description,detailed_description,
         common_problems,carousel_images,primary_image_id,is_published,is_featured,sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [req.params.slug, d.name, d.category, d.short_description, d.detailed_description,
       JSON.stringify(d.common_problems ?? []), JSON.stringify(d.carousel_images ?? []),
       d.primary_image_id || null, d.is_published ? 1 : 0, d.is_featured ? 1 : 0, d.sort_order ?? 0],
    );
  }
  return res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════
// TESTIMONIALS
// ══════════════════════════════════════════════════════════════
router.get('/testimonials', async (req, res) => {
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'staff';
  const [rows] = await query(
    isAdmin
      ? 'SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC'
      : 'SELECT * FROM testimonials WHERE is_approved=1 ORDER BY sort_order ASC',
  );
  return res.json(rows);
});

router.post('/testimonials', requireAuth, requirePermission('testimonials'), async (req, res) => {
  const d = req.body ?? {};
  const id = newId();
  await query(
    `INSERT INTO testimonials (id,customer_name,organisation,city,rating,feedback,is_sample,is_approved,is_featured,sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, d.customer_name, d.organisation || null, d.city || null, d.rating ?? 5,
     d.feedback, d.is_sample ? 1 : 0, d.is_approved ? 1 : 0, d.is_featured ? 1 : 0, d.sort_order ?? 0],
  );
  return res.status(201).json({ id });
});

router.patch('/testimonials/:id', requireAuth, requirePermission('testimonials'), async (req, res) => {
  const d = req.body ?? {};
  const fields = ['customer_name','organisation','city','rating','feedback','is_sample','is_approved','is_featured','sort_order'];
  const updates = {};
  for (const f of fields) if (f in d) updates[f] = d[f];
  if (!Object.keys(updates).length) return res.json({ ok: true });
  const set = Object.keys(updates).map(k => `\`${k}\`=?`).join(',');
  await query(`UPDATE testimonials SET ${set} WHERE id=?`, [...Object.values(updates), req.params.id]);
  return res.json({ ok: true });
});

router.delete('/testimonials/:id', requireAuth, requirePermission('testimonials'), async (req, res) => {
  await query('DELETE FROM testimonials WHERE id=?', [req.params.id]);
  return res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════
// ENQUIRIES
// ══════════════════════════════════════════════════════════════
router.post('/enquiries', async (req, res) => {
  try {
    const d = req.body ?? {};
    const name = str(d.name, 120);
    const email = normalizeEmail(d.email);
    const message = str(d.message, 2000);

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, message required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const id = newId();
    const mobile = str(d.mobile, 20);
    const organisation = str(d.organisation, 200);
    const subject = str(d.subject, 300);
    const enquiryType = str(d.enquiry_type, 50) || 'general';

    await transaction(async conn => {
      await conn.execute(
        `INSERT INTO enquiries (id,name,email,mobile,organisation,subject,message,enquiry_type)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, name, email, mobile, organisation, subject, message, enquiryType],
      );
      await insertNotification(conn, 'new_enquiry', 'New Enquiry Received',
        `${name} submitted an enquiry.`, 'enquiries', id);
      await logChange(conn, 'enquiries', id, 'INSERT');
    });
    return res.status(201).json({ id });
  } catch (err) {
    console.error('[enquiry POST]', err.message);
    return res.status(500).json({ error: 'Could not submit enquiry' });
  }
});

router.get('/enquiries', requireAuth, requirePermission('enquiries'), async (req, res) => {
  const [rows] = await query('SELECT * FROM enquiries ORDER BY created_at DESC');
  return res.json(rows);
});

router.patch('/enquiries/:id', requireAuth, requirePermission('enquiries'), async (req, res) => {
  const { is_read, status, admin_note } = req.body ?? {};
  const updates = {};
  if (is_read !== undefined) updates.is_read = is_read ? 1 : 0;
  if (status !== undefined) updates.status = status;
  if (admin_note !== undefined) updates.admin_note = admin_note;
  if (!Object.keys(updates).length) return res.json({ ok: true });
  const set = Object.keys(updates).map(k => `\`${k}\`=?`).join(',');
  await query(`UPDATE enquiries SET ${set} WHERE id=?`, [...Object.values(updates), req.params.id]);
  return res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
router.get('/notifications', requireAuth, requirePermission('notifications'), async (req, res) => {
  const [rows] = await query(
    'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 200',
  );
  return res.json(rows);
});

router.get('/notifications/unread-count', requireAuth, async (req, res) => {
  const [rows] = await query('SELECT COUNT(*) AS cnt FROM notifications WHERE is_read=0');
  return res.json({ count: rows[0].cnt });
});

router.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  await query('UPDATE notifications SET is_read=1 WHERE id=?', [req.params.id]);
  return res.json({ ok: true });
});

router.patch('/notifications/read-all', requireAuth, async (req, res) => {
  await query('UPDATE notifications SET is_read=1 WHERE is_read=0');
  return res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════
// OFFICE AVAILABILITY
// ══════════════════════════════════════════════════════════════
router.get('/office-availability', async (req, res) => {
  const [rows] = await query(
    'SELECT * FROM office_availability ORDER BY starts_at DESC',
  );
  return res.json(rows);
});

router.post('/office-availability', requireAuth, requirePermission('office_availability'), async (req, res) => {
  const d = req.body ?? {};
  if (!d.status || !d.starts_at) return res.status(400).json({ error: 'status and starts_at required' });
  const id = newId();
  await query(
    `INSERT INTO office_availability (id,status,starts_at,ends_at,reason,reopening_at,created_by,updated_by)
     VALUES (?,?,?,?,?,?,?,?)`,
    [id, d.status, d.starts_at, d.ends_at || null, d.reason || null,
     d.reopening_at || null, req.user.userId, req.user.userId],
  );
  await logChange(null, 'office_availability', id, 'INSERT').catch(() => {});
  return res.status(201).json({ id });
});

router.patch('/office-availability/:id', requireAuth, requirePermission('office_availability'), async (req, res) => {
  const d = req.body ?? {};
  const fields = ['status','starts_at','ends_at','reason','reopening_at'];
  const updates = { updated_by: req.user.userId };
  for (const f of fields) if (f in d) updates[f] = d[f] || null;
  const set = Object.keys(updates).map(k => `\`${k}\`=?`).join(',');
  await query(`UPDATE office_availability SET ${set} WHERE id=?`, [...Object.values(updates), req.params.id]);
  return res.json({ ok: true });
});

router.delete('/office-availability/:id', requireAuth, requirePermission('office_availability'), async (req, res) => {
  await query('DELETE FROM office_availability WHERE id=?', [req.params.id]);
  return res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════
router.get('/orders', requireAuth, requirePermission('orders'), async (req, res) => {
  const [rows] = await query('SELECT * FROM orders ORDER BY created_at DESC');
  return res.json(rows);
});

router.get('/orders/:id', requireAuth, requirePermission('orders'), async (req, res) => {
  const [[order]] = await query('SELECT * FROM orders WHERE id=? LIMIT 1', [req.params.id]);
  if (!order) return res.status(404).json({ error: 'Not found' });
  const [items] = await query('SELECT * FROM order_items WHERE order_id=?', [req.params.id]);
  const [events] = await query('SELECT * FROM order_events WHERE order_id=? ORDER BY created_at ASC', [req.params.id]);
  return res.json({ ...order, items, events });
});

router.patch('/orders/:id', requireAuth, requirePermission('orders'), async (req, res) => {
  const allowed = ['status','payment_status','fulfillment_note','tracking_id'];
  const updates = {};
  for (const f of allowed) if (f in (req.body ?? {})) updates[f] = req.body[f];
  if (!Object.keys(updates).length) return res.json({ ok: true });
  const set = Object.keys(updates).map(k => `\`${k}\`=?`).join(',');
  await query(`UPDATE orders SET ${set} WHERE id=?`, [...Object.values(updates), req.params.id]);
  return res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════
// WEBSITE IMAGES
// ══════════════════════════════════════════════════════════════
router.get('/website-images', requireAuth, async (req, res) => {
  const { bucket } = req.query;
  const [rows] = bucket
    ? await query('SELECT * FROM website_images WHERE bucket=? ORDER BY created_at DESC', [bucket])
    : await query('SELECT * FROM website_images ORDER BY created_at DESC');
  return res.json(rows);
});

router.post('/website-images', requireAuth, async (req, res) => {
  const d = req.body ?? {};
  const id = newId();
  await query(
    `INSERT INTO website_images (id,bucket,path,url,alt_text,category,is_primary)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE url=VALUES(url),alt_text=VALUES(alt_text),updated_at=UTC_TIMESTAMP(6)`,
    [id, d.bucket || 'admin-images', d.path, d.url, d.alt_text || null, d.category || null, d.is_primary ? 1 : 0],
  );
  return res.status(201).json({ id });
});

router.delete('/website-images/:id', requireAuth, async (req, res) => {
  await query('DELETE FROM website_images WHERE id=?', [req.params.id]);
  return res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════════
router.get('/dashboard/stats', requireAuth, requirePermission('dashboard'), async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const repairTable = isAdmin ? 'repair_requests' : 'repair_request_public_updates';

  const [[repairStats]] = await query(
    `SELECT
       COUNT(*) AS total,
       SUM(status='request_received') AS new_requests,
       SUM(status IN ('repair_in_progress','under_inspection')) AS in_progress,
       SUM(status='completed') AS completed
     FROM ${repairTable}`,
  );
  const [[enquiryStats]] = await query(
    'SELECT COUNT(*) AS total, SUM(is_read=0) AS unread FROM enquiries',
  );
  const [[notifStats]] = await query(
    'SELECT COUNT(*) AS total, SUM(is_read=0) AS unread FROM notifications',
  );
  const [[orderStats]] = isAdmin
    ? await query("SELECT COUNT(*) AS total, SUM(status='pending') AS pending FROM orders")
    : [[[{ total: 0, pending: 0 }]]];
  const [[svcStats]] = await query(
    'SELECT COUNT(*) AS total, SUM(is_published=1) AS active FROM services',
  );
  const [[imgStats]] = isAdmin
    ? await query('SELECT COUNT(*) AS total FROM website_images')
    : [[[{ total: 0 }]]];

  // Recent repairs
  const [recent] = await query(
    `SELECT id, request_code, status, created_at FROM ${repairTable} ORDER BY created_at DESC LIMIT 8`,
  );
  // By-status breakdown
  const [byStatus] = await query(
    `SELECT status, COUNT(*) AS cnt FROM ${repairTable} GROUP BY status`,
  );

  return res.json({
    repairs: {
      total: repairStats.total,
      new: repairStats.new_requests,
      inProgress: repairStats.in_progress,
      completed: repairStats.completed,
    },
    enquiries: { total: enquiryStats.total, unread: enquiryStats.unread },
    notifications: { total: notifStats.total, unread: notifStats.unread },
    orders: { total: orderStats.total, pending: orderStats.pending },
    services: { total: svcStats.total, active: svcStats.active },
    images: { total: imgStats.total },
    recent,
    byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.cnt])),
  });
});

// ══════════════════════════════════════════════════════════════
// POLLING — change detection for realtime replacement
// GET /api/poll?since=<ISO timestamp>&tables=repair_requests,notifications,...
// ══════════════════════════════════════════════════════════════
router.get('/poll', async (req, res) => {
  const since = req.query.since ?? new Date(Date.now() - 30000).toISOString();
  const tables = (req.query.tables ?? 'repair_requests,notifications,office_availability,enquiries')
    .split(',').map(t => t.trim()).filter(Boolean);

  if (!tables.length) return res.json({ changes: [] });

  const placeholders = tables.map(() => '?').join(',');
  const sinceFormatted = new Date(since).toISOString().replace('T', ' ').replace('Z', '');

  const [rows] = await query(
    `SELECT id, table_name, row_id, operation, created_at
     FROM change_log
     WHERE table_name IN (${placeholders}) AND created_at > ?
     ORDER BY created_at ASC
     LIMIT 100`,
    [...tables, sinceFormatted],
  );

  return res.json({
    changes: rows,
    serverTime: new Date().toISOString(),
  });
});

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════
function parseJson(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val; // mysql2 already parsed JSON column
  try { return JSON.parse(val); } catch { return fallback; }
}

export default router;
