// routes/repair.routes.js — repair requests, tracking, status, activity
import { Router } from 'express';
import { query, transaction } from '../db.js';
import { requireAuth, requirePermission } from '../middleware.js';
import {
  newId, normalizeMobile,
  syncPublicUpdate, logChange, insertNotification,
} from '../helpers.js';

const router = Router();

// ── Allowlists — prevent arbitrary enum values reaching MySQL ─
const VALID_STATUSES = new Set([
  'request_received','awaiting_equipment','equipment_received','under_inspection',
  'quotation_sent','approval_pending','repair_in_progress','quality_testing',
  'ready_for_dispatch','dispatched','completed','on_hold','cancelled',
]);
const VALID_LOCATIONS = new Set(['Office', 'LAB 1', 'LAB 2']);

// ── Input sanitiser: trim + cap length ───────────────────────
function str(val, max = 500) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s.length ? s.slice(0, max) : null;
}

// ── Repair code generator ─────────────────────────────────────
function makeCode() {
  const y = new Date().getFullYear();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `AR-${y}-${rnd}`;
}

// ─────────────────────────────────────────────────────────────
// POST /api/repair-requests  (public — no auth required)
// ─────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const d = req.body ?? {};

    // Required field validation
    if (!str(d.full_name) || !str(d.mobile) || !str(d.email) ||
        !str(d.equipment_name) || !str(d.problem_description)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email).trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate enums against allowlist (never trust client-supplied enum values)
    const status   = VALID_STATUSES.has(d.status) ? d.status : 'request_received';
    const location = VALID_LOCATIONS.has(d.current_location) ? d.current_location : 'Office';
    const urgency  = ['low','normal','urgent'].includes(d.urgency) ? d.urgency : 'normal';
    const preferred= ['phone','whatsapp','email'].includes(d.preferred_contact) ? d.preferred_contact : 'phone';

    let code;
    let inserted = false;
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      code = makeCode();
      try {
        const id = newId();
        await transaction(async conn => {
          await conn.execute(
            `INSERT INTO repair_requests
               (id, request_code, full_name, organisation, mobile, whatsapp, email,
                city, state, equipment_category, equipment_name, brand, model_no, serial_no,
                problem_description, urgency, preferred_contact, pickup_required, consent,
                request_source, status, current_location, admin_notes)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              id, code,
              str(d.full_name, 120), str(d.organisation, 200),
              str(d.mobile, 20), str(d.whatsapp, 20), String(d.email).trim().toLowerCase().slice(0, 200),
              str(d.city, 100), str(d.state, 100), str(d.equipment_category, 100),
              str(d.equipment_name, 200), str(d.brand, 100), str(d.model_no, 100), str(d.serial_no, 100),
              str(d.problem_description, 2000),
              urgency, preferred,
              d.pickup_required ? 1 : 0, d.consent ? 1 : 0,
              d.request_source || 'Website', status, location,
              null, // admin_notes: public form never sets this
            ],
          );
          await syncPublicUpdate(conn, id);
          await conn.execute(
            `INSERT INTO tracking (id, tracking_id, customer_name, customer_email, customer_mobile, equipment_name, status)
             VALUES (?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = UTC_TIMESTAMP(6)`,
            [newId(), code, str(d.full_name, 120), String(d.email).trim().toLowerCase().slice(0, 200),
             str(d.mobile, 20), str(d.equipment_name, 200), 'pending'],
          );
          const actId = newId();
          await conn.execute(
            `INSERT INTO repair_request_activity (id, request_id, action, new_status, new_location)
             VALUES (?,?,'created',?,?)`,
            [actId, id, status, location],
          );
          await insertNotification(
            conn, 'new_repair', 'New Repair Request Received',
            `${str(d.full_name, 80)} submitted a repair request for ${str(d.equipment_name, 80)}.`,
            'repair_requests', id,
          );
          await logChange(conn, 'repair_requests', id, 'INSERT');
        });
        inserted = true;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') throw err;
        // duplicate code — retry
      }
    }

    if (!inserted) return res.status(500).json({ error: 'Failed to generate unique request code' });
    return res.status(201).json({ request_code: code });
  } catch (err) {
    console.error('[repair POST]', err.message);
    return res.status(500).json({ error: 'Could not submit repair request' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/repair-requests  (admin/staff)
// ─────────────────────────────────────────────────────────────
router.get('/', requireAuth, requirePermission('repair_requests'), async (req, res) => {
  const table = req.user.role === 'admin' ? 'repair_requests' : 'repair_request_public_updates';
  const [rows] = await query(`SELECT * FROM ${table} ORDER BY updated_at DESC LIMIT 500`);
  return res.json(rows);
});

// ─────────────────────────────────────────────────────────────
// GET /api/repair-requests/track  (public — NO auth)
// ─────────────────────────────────────────────────────────────
router.get('/track', async (req, res) => {
  const { code, contact } = req.query;
  if (!code && !contact) return res.status(400).json({ error: 'code or contact required' });

  const normalContact = normalizeMobile(String(contact ?? '').trim().slice(0, 100));
  const lowerContact  = normalContact.toLowerCase();

  let rows;
  if (code && String(code).trim()) {
    [rows] = await query(
      `SELECT id, request_code, full_name, equipment_name, brand, status,
              current_location, customer_visible_note, created_at, updated_at
       FROM repair_request_public_updates
       WHERE UPPER(request_code) = UPPER(?)
       LIMIT 25`,
      [String(code).trim().slice(0, 30)],
    );
  } else {
    [rows] = await query(
      `SELECT rpu.id, rpu.request_code, rpu.full_name, rpu.equipment_name, rpu.brand,
              rpu.status, rpu.current_location, rpu.customer_visible_note,
              rpu.created_at, rpu.updated_at
       FROM repair_request_public_updates rpu
       JOIN repair_requests rr ON rr.id = rpu.id
       WHERE ? != '' AND (
           REPLACE(REPLACE(REPLACE(rr.mobile,   ' ',''),'-',''),'+','') = REPLACE(REPLACE(REPLACE(?,   ' ',''),'-',''),'+','')
         OR REPLACE(REPLACE(REPLACE(rr.whatsapp,' ',''),'-',''),'+','') = REPLACE(REPLACE(REPLACE(?,   ' ',''),'-',''),'+','')
         OR LOWER(rr.email) = LOWER(?)
       )
       ORDER BY rr.updated_at DESC
       LIMIT 25`,
      [lowerContact, normalContact, normalContact, lowerContact],
    );
  }

  // Mask internal lab names from public view
  const masked = (rows ?? []).map(r => ({
    ...r,
    current_location: r.current_location === 'Office' ? 'Office' : 'Service Lab',
  }));
  return res.json(masked);
});

// ─────────────────────────────────────────────────────────────
// GET /api/repair-requests/track/:code/history  (public)
// ─────────────────────────────────────────────────────────────
router.get('/track/:code/history', async (req, res) => {
  const [rows] = await query(
    `SELECT h.new_status AS status, h.new_location AS current_location, h.note, h.created_at
     FROM repair_status_history h
     JOIN repair_requests r ON r.id = h.request_id
     WHERE UPPER(r.request_code) = UPPER(?)
     ORDER BY h.created_at ASC`,
    [String(req.params.code).slice(0, 30)],
  );
  const masked = rows.map(r => ({
    ...r,
    current_location: r.current_location === 'Office' ? 'Office' : r.current_location ? 'Service Lab' : null,
  }));
  return res.json(masked);
});

// ─────────────────────────────────────────────────────────────
// GET /api/repair-requests/:id  (admin/staff)
// ─────────────────────────────────────────────────────────────
router.get('/:id', requireAuth, requirePermission('repair_requests'), async (req, res) => {
  const table = req.user.role === 'admin' ? 'repair_requests' : 'repair_request_public_updates';
  const [rows] = await query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  return res.json(rows[0]);
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/repair-requests/:id  (admin/staff — replaces update_repair_operation RPC)
// ─────────────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  const {
    status, current_location,
    customer_visible_note, admin_notes,
    inspection_notes, repair_notes,
    quality_testing_notes, dispatch_notes,
    change_note, expected_updated_at,
  } = req.body ?? {};

  // Validate enums
  if (status !== undefined && !VALID_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (current_location !== undefined && !VALID_LOCATIONS.has(current_location)) {
    return res.status(400).json({ error: 'Invalid location' });
  }

  const isAdmin = req.user.role === 'admin';
  const userId  = req.user.userId;

  // Load current row
  const [current] = await query('SELECT * FROM repair_requests WHERE id = ? LIMIT 1', [req.params.id]);
  if (!current.length) return res.status(404).json({ error: 'Not found' });
  const r = current[0];

  // Optimistic concurrency check
  if (expected_updated_at) {
    const expectedTs = new Date(expected_updated_at).getTime();
    const actualTs   = new Date(r.updated_at).getTime();
    if (Math.abs(actualTs - expectedTs) > 2000) {
      return res.status(409).json({ error: 'Record was modified by someone else. Please refresh.' });
    }
  }

  // ── Server-side permission enforcement (mirrors original PostgreSQL trigger) ──
  if (!isAdmin) {
    const [permRows] = await query(
      `SELECT permission FROM staff_permissions sp
       JOIN profiles p ON p.id = sp.user_id
       WHERE sp.user_id = ? AND p.is_active = 1`,
      [userId],
    );
    const perms = new Set(permRows.map(p => p.permission));

    if (status !== undefined && status !== r.status && !perms.has('update_status'))
      return res.status(403).json({ error: 'Missing status update permission' });
    if (current_location !== undefined && current_location !== r.current_location && !perms.has('update_location'))
      return res.status(403).json({ error: 'Missing location update permission' });
    if ((customer_visible_note !== undefined || repair_notes !== undefined) && !perms.has('update_repair_progress'))
      return res.status(403).json({ error: 'Missing repair progress permission' });
    if (inspection_notes !== undefined && !perms.has('update_inspection') && !perms.has('update_repair_progress'))
      return res.status(403).json({ error: 'Missing inspection update permission' });
    if (quality_testing_notes !== undefined && !perms.has('quality_testing') && !perms.has('update_repair_progress'))
      return res.status(403).json({ error: 'Missing quality testing permission' });
    if (dispatch_notes !== undefined && !perms.has('dispatch') && !perms.has('update_repair_progress'))
      return res.status(403).json({ error: 'Missing dispatch permission' });
  }

  const updates = {};
  if (status              !== undefined) updates.status               = status;
  if (current_location    !== undefined) updates.current_location     = current_location;
  if (customer_visible_note !== undefined) updates.customer_visible_note = str(customer_visible_note, 2000);
  if (inspection_notes    !== undefined) updates.inspection_notes     = str(inspection_notes, 2000);
  if (repair_notes        !== undefined) updates.repair_notes         = str(repair_notes, 2000);
  if (quality_testing_notes !== undefined) updates.quality_testing_notes = str(quality_testing_notes, 2000);
  if (dispatch_notes      !== undefined) updates.dispatch_notes       = str(dispatch_notes, 2000);
  if (isAdmin && admin_notes !== undefined) updates.admin_notes       = str(admin_notes, 2000);

  if (!Object.keys(updates).length) return res.json({ ok: true });

  const setClauses = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
  const values     = [...Object.values(updates), req.params.id];

  await transaction(async conn => {
    await conn.execute(`UPDATE repair_requests SET ${setClauses} WHERE id = ?`, values);
    const [updated] = await conn.execute('SELECT * FROM repair_requests WHERE id = ? LIMIT 1', [req.params.id]);
    const newRow = updated[0];

    await syncPublicUpdate(conn, req.params.id);

    const actId  = newId();
    const action = (status !== undefined && status !== r.status) ? 'status_changed'
                 : (current_location !== undefined && current_location !== r.current_location) ? 'location_changed'
                 : 'updated';
    await conn.execute(
      `INSERT INTO repair_request_activity
         (id, request_id, actor_id, action, old_status, new_status, old_location, new_location, note)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [actId, req.params.id, userId, action,
       r.status, newRow.status, r.current_location, newRow.current_location,
       str(change_note, 500)],
    );

    if (status !== undefined && status !== r.status) {
      const hId = newId();
      await conn.execute(
        `INSERT INTO repair_status_history
           (id, request_id, status, old_status, new_status, old_location, new_location, note, created_by)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [hId, req.params.id, status, r.status, status,
         r.current_location, newRow.current_location, str(change_note, 500), userId],
      );
      await insertNotification(
        conn, 'repair_update', 'Repair Status Updated',
        `${r.full_name}'s repair status changed to ${status}.`,
        'repair_requests', req.params.id,
      );
    }
    await logChange(conn, 'repair_requests', req.params.id, 'UPDATE');
  });

  return res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────
// GET /api/repair-requests/:id/activity  (admin/staff)
// ─────────────────────────────────────────────────────────────
router.get('/:id/activity', requireAuth, requirePermission('repair_details'), async (req, res) => {
  const [rows] = await query(
    'SELECT * FROM repair_request_activity WHERE request_id = ? ORDER BY created_at ASC',
    [req.params.id],
  );
  return res.json(rows);
});

// ─────────────────────────────────────────────────────────────
// POST /api/repair-requests/bulk  (CSV/Excel import — staff with import_csv perm)
// ─────────────────────────────────────────────────────────────
router.post('/bulk', requireAuth, requirePermission('import_csv'), async (req, res) => {
  const { rows: inputRows } = req.body ?? {};
  if (!Array.isArray(inputRows) || !inputRows.length) {
    return res.status(400).json({ error: 'No rows provided' });
  }
  if (inputRows.length > 1000) {
    return res.status(400).json({ error: 'Maximum 1000 rows per import' });
  }

  const results = { imported: 0, skipped: 0, failed: 0, errors: [] };

  for (const [idx, d] of inputRows.entries()) {
    if (!str(d.full_name) || !str(d.mobile) || !str(d.email) ||
        !str(d.equipment_name) || !str(d.problem_description)) {
      results.failed++;
      results.errors.push({ row: idx + 2, error: 'Missing required fields' });
      continue;
    }

    const rowStatus   = VALID_STATUSES.has(d.status) ? d.status : 'request_received';
    const rowLocation = VALID_LOCATIONS.has(d.current_location) ? d.current_location : 'Office';

    let inserted = false;
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      const code = makeCode();
      try {
        const id = newId();
        await transaction(async conn => {
          await conn.execute(
            `INSERT INTO repair_requests
               (id, request_code, full_name, organisation, mobile, whatsapp, email,
                city, state, equipment_category, equipment_name, brand, model_no, serial_no,
                problem_description, urgency, preferred_contact, pickup_required, consent,
                request_source, status, current_location, admin_notes)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              id, code, str(d.full_name, 120), str(d.organisation, 200),
              str(d.mobile, 20), str(d.whatsapp, 20), String(d.email).trim().toLowerCase().slice(0, 200),
              str(d.city, 100), str(d.state, 100), str(d.equipment_category, 100),
              str(d.equipment_name, 200), str(d.brand, 100), str(d.model_no, 100), str(d.serial_no, 100),
              str(d.problem_description, 2000),
              ['low','normal','urgent'].includes(d.urgency) ? d.urgency : 'normal',
              'phone', 0, 1, 'Import', rowStatus, rowLocation, str(d.admin_notes, 2000),
            ],
          );
          await syncPublicUpdate(conn, id);
          await conn.execute(
            `INSERT INTO tracking (id, tracking_id, customer_name, customer_email, customer_mobile, equipment_name, status)
             VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE updated_at = UTC_TIMESTAMP(6)`,
            [newId(), code, str(d.full_name, 120), String(d.email).trim().toLowerCase().slice(0, 200),
             str(d.mobile, 20), str(d.equipment_name, 200), 'pending'],
          );
          await logChange(conn, 'repair_requests', id, 'INSERT');
        });
        inserted = true;
        results.imported++;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          results.failed++;
          results.errors.push({ row: idx + 2, error: 'Insert failed' }); // never expose raw DB error
          break;
        }
        // duplicate code — retry with new code
      }
    }
    if (!inserted && results.errors[results.errors.length - 1]?.row !== idx + 2) {
      results.skipped++;
    }
  }

  return res.json(results);
});

export default router;
