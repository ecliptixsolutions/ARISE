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

function intVal(val, fallback = 0) {
  const n = Number.parseInt(String(val ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function jsonArray(val) {
  return JSON.stringify(Array.isArray(val) ? val : []);
}

function blogFromRow(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    difficulty: r.difficulty,
    readingTime: r.reading_time,
    date: r.published_at ? new Date(r.published_at).toISOString().slice(0, 10) : null,
    excerpt: r.excerpt,
    image: r.thumbnail_url,
    imageAlt: r.thumbnail_alt,
    keywords: parseJson(r.tags, []),
    equipment: parseJson(r.equipment, []),
    body: r.content,
    takeaways: parseJson(r.takeaways, []),
    seoTitle: r.meta_title,
    seoDescription: r.meta_description,
    status: r.status,
    author: r.author,
    primaryKeyword: r.primary_keyword,
    secondaryKeywords: parseJson(r.secondary_keywords, []),
    canonicalUrl: r.canonical_url,
    ogImageUrl: r.og_image_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function blogPayload(body, userId, existing = {}) {
  const d = body ?? {};
  const title = str(d.title, 255);
  const slug = str(d.slug, 255);
  const excerpt = str(d.excerpt, 5000);
  const content = d.body ?? d.content;
  if (!title || !slug || !excerpt || !content) {
    const err = new Error('title, slug, excerpt and content are required');
    err.status = 400;
    throw err;
  }

  const tags = Array.isArray(d.tags) ? d.tags : Array.isArray(d.keywords) ? d.keywords : [];
  const publishedAt = d.published_at ?? d.publishedAt ?? d.date ?? null;
  const status = d.status === 'draft' ? 'draft' : 'published';
  return {
    id: existing.id ?? newId(),
    title,
    slug: slug.toLowerCase(),
    excerpt,
    content: String(content),
    thumbnail_url: d.thumbnail_url ?? d.thumbnailUrl ?? d.image ?? null,
    thumbnail_alt: str(d.thumbnail_alt ?? d.thumbnailAlt ?? d.imageAlt, 300),
    category: str(d.category, 100) || 'Repair Insights',
    difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(d.difficulty) ? d.difficulty : 'Beginner',
    reading_time: intVal(d.reading_time ?? d.readingTime, 4),
    published_at: publishedAt || null,
    status,
    author: str(d.author, 120) || 'Arise Healthcare Solutions',
    primary_keyword: str(d.primary_keyword ?? d.primaryKeyword ?? tags[0], 200),
    secondary_keywords: jsonArray(d.secondary_keywords ?? d.secondaryKeywords),
    tags: jsonArray(tags),
    equipment: jsonArray(d.equipment),
    takeaways: jsonArray(d.takeaways),
    meta_title: str(d.meta_title ?? d.metaTitle ?? d.seoTitle, 255),
    meta_description: d.meta_description ?? d.metaDescription ?? d.seoDescription ?? null,
    canonical_url: str(d.canonical_url ?? d.canonicalUrl, 500),
    og_image_url: d.og_image_url ?? d.ogImageUrl ?? d.image ?? null,
    user_id: userId ?? null,
  };
}

async function upsertBlog(conn, payload) {
  const [result] = await conn.execute(
    `INSERT INTO blogs
      (id,title,slug,excerpt,content,thumbnail_url,thumbnail_alt,category,difficulty,reading_time,
       published_at,status,author,primary_keyword,secondary_keywords,tags,equipment,takeaways,
       meta_title,meta_description,canonical_url,og_image_url,created_by,updated_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       title=VALUES(title),excerpt=VALUES(excerpt),content=VALUES(content),
       thumbnail_url=VALUES(thumbnail_url),thumbnail_alt=VALUES(thumbnail_alt),
       category=VALUES(category),difficulty=VALUES(difficulty),reading_time=VALUES(reading_time),
       published_at=VALUES(published_at),status=VALUES(status),author=VALUES(author),
       primary_keyword=VALUES(primary_keyword),secondary_keywords=VALUES(secondary_keywords),
       tags=VALUES(tags),equipment=VALUES(equipment),takeaways=VALUES(takeaways),
       meta_title=VALUES(meta_title),meta_description=VALUES(meta_description),
       canonical_url=VALUES(canonical_url),og_image_url=VALUES(og_image_url),
       updated_by=VALUES(updated_by),updated_at=UTC_TIMESTAMP(6)`,
    [
      payload.id, payload.title, payload.slug, payload.excerpt, payload.content,
      payload.thumbnail_url, payload.thumbnail_alt, payload.category, payload.difficulty,
      payload.reading_time, payload.published_at, payload.status, payload.author,
      payload.primary_keyword, payload.secondary_keywords, payload.tags, payload.equipment,
      payload.takeaways, payload.meta_title, payload.meta_description, payload.canonical_url,
      payload.og_image_url, payload.user_id, payload.user_id,
    ],
  );
  return result;
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
// BLOGS
// ══════════════════════════════════════════════════════════════
router.get('/blogs', async (req, res) => {
  const q = str(req.query.q, 200);
  const category = str(req.query.category, 100);
  const difficulty = str(req.query.difficulty, 20);
  const sort = str(req.query.sort, 40) || 'newest';
  const page = Math.max(1, intVal(req.query.page, 1));
  const pageSize = Math.min(50, Math.max(1, intVal(req.query.pageSize, 100)));
  const where = ['status = ?'];
  const args = ['published'];

  if (q) {
    where.push('(title LIKE ? OR slug LIKE ? OR category LIKE ? OR primary_keyword LIKE ? OR JSON_SEARCH(tags, "one", ?) IS NOT NULL)');
    args.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category && category !== 'All') {
    where.push('category = ?');
    args.push(category);
  }
  if (difficulty && difficulty !== 'All Levels') {
    where.push('difficulty = ?');
    args.push(difficulty);
  }

  const order = {
    oldest: 'published_at ASC',
    updated: 'updated_at DESC',
    title_az: 'title ASC',
    title_za: 'title DESC',
  }[sort] || 'published_at DESC';

  const [countRows] = await query(`SELECT COUNT(*) AS total FROM blogs WHERE ${where.join(' AND ')}`, args);
  const [rows] = await query(
    `SELECT * FROM blogs WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...args, pageSize, (page - 1) * pageSize],
  );
  return res.json({ items: rows.map(blogFromRow), total: countRows[0].total, page, pageSize });
});

router.get('/blogs/:slug', async (req, res) => {
  const [[row]] = await query(
    'SELECT * FROM blogs WHERE slug=? AND status="published" LIMIT 1',
    [req.params.slug],
  );
  if (!row) return res.status(404).json({ error: 'Not found' });
  return res.json(blogFromRow(row));
});

router.get('/admin/blogs', requireAuth, requirePermission('blogs'), async (req, res) => {
  const q = str(req.query.q, 200);
  const status = str(req.query.status, 20);
  const category = str(req.query.category, 100);
  const difficulty = str(req.query.difficulty, 20);
  const sort = str(req.query.sort, 40) || 'newest';
  const page = Math.max(1, intVal(req.query.page, 1));
  const pageSize = Math.min(100, Math.max(1, intVal(req.query.pageSize, 25)));
  const where = [];
  const args = [];

  if (q) {
    where.push('(title LIKE ? OR slug LIKE ? OR category LIKE ? OR primary_keyword LIKE ? OR JSON_SEARCH(tags, "one", ?) IS NOT NULL)');
    args.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (status && status !== 'all') {
    where.push('status = ?');
    args.push(status);
  }
  if (category && category !== 'All') {
    where.push('category = ?');
    args.push(category);
  }
  if (difficulty && difficulty !== 'All') {
    where.push('difficulty = ?');
    args.push(difficulty);
  }
  const sqlWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = {
    oldest: 'published_at ASC',
    updated: 'updated_at DESC',
    title_az: 'title ASC',
    title_za: 'title DESC',
  }[sort] || 'published_at DESC';
  const [countRows] = await query(`SELECT COUNT(*) AS total FROM blogs ${sqlWhere}`, args);
  const [rows] = await query(
    `SELECT * FROM blogs ${sqlWhere} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...args, pageSize, (page - 1) * pageSize],
  );
  return res.json({ items: rows.map(blogFromRow), total: countRows[0].total, page, pageSize });
});

router.post('/admin/blogs/seed', requireAuth, requireAdmin, async (req, res) => {
  const items = Array.isArray(req.body?.blogs) ? req.body.blogs : [];
  if (!items.length) return res.status(400).json({ error: 'blogs array required' });
  let accepted = 0;
  let inserted = 0;
  let updated = 0;
  await transaction(async conn => {
    for (const item of items) {
      const payload = blogPayload({ ...item, status: item.status ?? 'published' }, req.user.userId);
      const result = await upsertBlog(conn, payload);
      if (result.affectedRows === 1) inserted += 1;
      if (result.affectedRows === 2) updated += 1;
      accepted += 1;
    }
    await logChange(conn, 'blogs', null, 'UPDATE');
  });
  return res.json({ ok: true, accepted, inserted, updated });
});

router.get('/admin/blogs/:id', requireAuth, requirePermission('blogs'), async (req, res) => {
  const [[row]] = await query('SELECT * FROM blogs WHERE id=? OR slug=? LIMIT 1', [req.params.id, req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  return res.json(blogFromRow(row));
});

router.post('/admin/blogs', requireAuth, requirePermission('blogs'), async (req, res) => {
  try {
    const payload = blogPayload(req.body, req.user.userId);
    const [dupe] = await query('SELECT id FROM blogs WHERE slug=? LIMIT 1', [payload.slug]);
    if (dupe.length) return res.status(409).json({ error: 'Slug already exists' });
    await transaction(async conn => {
      await upsertBlog(conn, payload);
      await logChange(conn, 'blogs', payload.id, 'INSERT');
    });
    return res.status(201).json({ id: payload.id });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Could not create blog' });
  }
});

router.patch('/admin/blogs/:id', requireAuth, requirePermission('blogs'), async (req, res) => {
  try {
    const [[existing]] = await query('SELECT id FROM blogs WHERE id=? LIMIT 1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const payload = blogPayload(req.body, req.user.userId, existing);
    const [dupe] = await query('SELECT id FROM blogs WHERE slug=? AND id<>? LIMIT 1', [payload.slug, payload.id]);
    if (dupe.length) return res.status(409).json({ error: 'Slug already exists' });
    await transaction(async conn => {
      await upsertBlog(conn, payload);
      await logChange(conn, 'blogs', payload.id, 'UPDATE');
    });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Could not update blog' });
  }
});

router.delete('/admin/blogs/:id', requireAuth, requireAdmin, async (req, res) => {
  await transaction(async conn => {
    await conn.execute('DELETE FROM blogs WHERE id=?', [req.params.id]);
    await logChange(conn, 'blogs', req.params.id, 'DELETE');
  });
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
