// data-migration.js — Supabase → Hostinger MySQL production data migration
// ============================================================
// SAFETY GUARANTEES:
//   - NEVER deletes Supabase data (read-only access via service-role key)
//   - Uses INSERT IGNORE — duplicates are skipped, not overwritten
//   - Each table migration is wrapped in a transaction (rollback on error)
//   - Row counts compared before/after for every table
//   - Mismatches are reported but never auto-corrected
//   - Supabase service-role key is NEVER logged or printed
//   - Run ONLY on the Hostinger server (MySQL connects via localhost)
//
// Prerequisites:
//   1. Add to .env (Hostinger server only):
//      SUPABASE_URL=https://thcpriduqrznrwqsuocq.supabase.co
//      SUPABASE_SERVICE_ROLE_KEY=<your service-role key>
//   2. Run schema first: node migrate.js
//   3. Run this script: node data-migration.js
//   4. REMOVE SUPABASE_SERVICE_ROLE_KEY from .env when done
// ============================================================

import 'dotenv/config';
import { getPool } from './db.js';

// ── Env validation ────────────────────────────────────────────
const SUPABASE_URL             = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[data-migration] FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  console.error('[data-migration] These are Hostinger-server-only values. Never put them in Cloudflare env.');
  process.exit(1);
}

// Confirm Supabase URL format (avoids accidental wrong env)
if (!SUPABASE_URL.startsWith('https://') || !SUPABASE_URL.includes('.supabase.co')) {
  console.error('[data-migration] SUPABASE_URL does not look like a valid Supabase project URL.');
  process.exit(1);
}

const db = getPool();

// ── Supabase REST fetcher ─────────────────────────────────────
async function fetchSupabase(table, select = '*', extra = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}${extra}&limit=10000`;
  const res = await fetch(url, {
    headers: {
      // Service-role key authorises all reads; never logged or printed
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 404 && body.includes('PGRST205')) return [];
    // Sanitise response body before logging — truncate to avoid accidental secret dump
    throw new Error(`Supabase fetch '${table}' failed: HTTP ${res.status} — ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ── Supabase Auth admin users fetcher (paginated) ─────────────
async function fetchSupabaseUsers() {
  const users = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?per_page=1000&page=${page}`,
      { headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY } },
    );
    if (!res.ok) throw new Error(`Supabase auth/users fetch failed: HTTP ${res.status}`);
    const { users: batch = [] } = await res.json();
    if (!batch.length) break;
    users.push(...batch);
    if (batch.length < 1000) break;
    page++;
  }
  return users;
}

// ── Convert ISO timestamp to MySQL DATETIME(6) string ─────────
function ts(value) {
  if (!value) return null;
  try {
    return new Date(value).toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+$/, '');
  } catch { return null; }
}

// ── Table migration runner ─────────────────────────────────────
async function migrateTable({ label, mysqlTable, rows, insertFn }) {
  if (!rows.length) {
    console.log(`  [${label}] 0 Supabase rows — skipping`);
    return { sourceCount: 0, inserted: 0, skipped: 0, failed: 0 };
  }

  const [[beforeRow]] = await db.execute(`SELECT COUNT(*) AS cnt FROM \`${mysqlTable}\``);
  const beforeCount = Number(beforeRow.cnt);

  let inserted = 0;
  let skipped  = 0;
  let failed   = 0;

  const conn = await db.getConnection();
  await conn.beginTransaction();
  try {
    for (const row of rows) {
      try {
        const [result] = await insertFn(conn, row);
        if (result?.affectedRows > 0) inserted++;
        else skipped++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
          skipped++;
        } else {
          failed++;
          // Log the error type but never log raw row data (may contain PII)
          console.warn(`    [${label}] row error (${err.code ?? err.errno}): ${err.message.slice(0, 120)}`);
        }
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  const [[afterRow]] = await db.execute(`SELECT COUNT(*) AS cnt FROM \`${mysqlTable}\``);
  const afterCount = Number(afterRow.cnt);

  const net = afterCount - beforeCount;
  const status = failed > 0 ? '⚠' : '✓';
  console.log(
    `  ${status} [${label}] Supabase: ${rows.length} rows | ` +
    `Inserted: ${inserted} | Skipped (dup): ${skipped} | Failed: ${failed} | ` +
    `MySQL: ${beforeCount} → ${afterCount} (+${net})`,
  );

  return { sourceCount: rows.length, inserted, skipped, failed, beforeCount, afterCount };
}

// ── Main migration ─────────────────────────────────────────────
async function run() {
  console.log('\n[data-migration] ════════════════════════════════════════════');
  console.log('[data-migration]  Arise Healthcare — Supabase → MySQL Migration');
  console.log('[data-migration] ════════════════════════════════════════════\n');

  const results = {};

  // ── 1. Auth users (Supabase admin API — separate endpoint) ───
  console.log('[1/12] Auth users...');
  try {
    const users = await fetchSupabaseUsers();
    results.users = await migrateTable({
      label: 'users', mysqlTable: 'users', rows: users,
      insertFn: async (conn, u) => {
        // Supabase stores bcrypt hashes in encrypted_password — copy directly.
        // If empty (OAuth-only users), use a LOCKED placeholder that forces reset.
        const hash = u.encrypted_password?.startsWith('$2')
          ? u.encrypted_password
          : '$2a$12$LOCKED.PASSWORD.PLACEHOLDER.RESET.REQUIRED.XXXXXXXXXXX';
        return conn.execute(
          `INSERT IGNORE INTO users (id, email, password_hash, full_name, is_active, created_at)
           VALUES (?,?,?,?,1,?)`,
          [u.id, u.email?.toLowerCase(), hash, u.user_metadata?.full_name ?? null, ts(u.created_at)],
        );
      },
    });
  } catch (e) {
    console.error(`  [users] FAILED: ${e.message}`);
    results.users = { error: e.message };
  }

  // ── 2. Profiles ───────────────────────────────────────────────
  console.log('[2/12] Profiles...');
  const profiles = await fetchSupabase('profiles');
  results.profiles = await migrateTable({
    label: 'profiles', mysqlTable: 'profiles', rows: profiles,
    insertFn: async (conn, p) => conn.execute(
      `INSERT IGNORE INTO profiles (id, email, full_name, is_active, created_at)
       VALUES (?,?,?,?,?)`,
      [p.id, p.email?.toLowerCase(), p.full_name, p.is_active !== false ? 1 : 0, ts(p.created_at)],
    ),
  });

  // ── 3. User roles ─────────────────────────────────────────────
  console.log('[3/12] User roles...');
  const userRoles = await fetchSupabase('user_roles');
  results.user_roles = await migrateTable({
    label: 'user_roles', mysqlTable: 'user_roles', rows: userRoles,
    insertFn: async (conn, r) => conn.execute(
      `INSERT IGNORE INTO user_roles (id, user_id, role, created_at) VALUES (?,?,?,?)`,
      [r.id, r.user_id, r.role, ts(r.created_at)],
    ),
  });

  // ── 4. Staff permissions ──────────────────────────────────────
  console.log('[4/12] Staff permissions...');
  const perms = await fetchSupabase('staff_permissions');
  results.staff_permissions = await migrateTable({
    label: 'staff_permissions', mysqlTable: 'staff_permissions', rows: perms,
    insertFn: async (conn, p) => conn.execute(
      `INSERT IGNORE INTO staff_permissions (user_id, permission, granted_by, created_at)
       VALUES (?,?,?,?)`,
      [p.user_id, p.permission, p.granted_by ?? null, ts(p.created_at)],
    ),
  });

  // ── 5. Admin login audit ───────────────────────────────────────
  console.log('[5/16] Admin login audit...');
  const audit = await fetchSupabase('admin_login_audit');
  results.admin_login_audit = await migrateTable({
    label: 'admin_login_audit', mysqlTable: 'admin_login_audit', rows: audit,
    insertFn: async (conn, a) => conn.execute(
      `INSERT IGNORE INTO admin_login_audit
         (id, user_id, email, role, event_type, success, user_agent, ip_address, created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [a.id, a.user_id ?? null, a.email?.toLowerCase() ?? null, a.role ?? null,
       a.event_type, a.success ? 1 : 0, a.user_agent ?? null, a.ip_address ?? null, ts(a.created_at)],
    ),
  });

  // ── 6. Repair requests ────────────────────────────────────────
  console.log('[6/16] Repair requests...');
  const repairs = await fetchSupabase('repair_requests');
  results.repair_requests = await migrateTable({
    label: 'repair_requests', mysqlTable: 'repair_requests', rows: repairs,
    insertFn: async (conn, r) => conn.execute(
      `INSERT IGNORE INTO repair_requests
         (id, request_code, full_name, organisation, mobile, whatsapp, email,
          city, state, equipment_category, equipment_name, brand, model_no, serial_no,
          problem_description, urgency, preferred_contact, pickup_required, consent,
          request_source, status, current_location, admin_notes, customer_visible_note,
          estimated_cost, assigned_to, inspection_notes, repair_notes,
          quality_testing_notes, dispatch_notes, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        r.id, r.request_code,
        r.full_name, r.organisation ?? null,
        r.mobile, r.whatsapp ?? null, r.email?.toLowerCase(),
        r.city ?? null, r.state ?? null, r.equipment_category ?? null,
        r.equipment_name, r.brand ?? null, r.model_no ?? null, r.serial_no ?? null,
        r.problem_description,
        r.urgency || 'normal', r.preferred_contact || 'phone',
        r.pickup_required ? 1 : 0, r.consent ? 1 : 0,
        r.request_source || 'Website',
        r.status || 'request_received',
        r.current_location || 'Office',
        r.admin_notes ?? null, r.customer_visible_note ?? null,
        r.estimated_cost ?? null, r.assigned_to ?? null,
        r.inspection_notes ?? null, r.repair_notes ?? null,
        r.quality_testing_notes ?? null, r.dispatch_notes ?? null,
        ts(r.created_at), ts(r.updated_at),
      ],
    ),
  });

  // ── 6b. Sync repair_request_public_updates ────────────────────
  console.log('[6b] Syncing repair_request_public_updates from migrated repair_requests...');
  await db.execute(`
    INSERT IGNORE INTO repair_request_public_updates
      (id, request_code, full_name, equipment_category, equipment_name, brand, model_no,
       serial_no, problem_description, status, current_location, customer_visible_note,
       assigned_to, inspection_notes, repair_notes, quality_testing_notes, dispatch_notes,
       created_at, updated_at)
    SELECT
      id, request_code, full_name, equipment_category, equipment_name, brand, model_no,
      serial_no, problem_description, status, current_location, customer_visible_note,
      assigned_to, inspection_notes, repair_notes, quality_testing_notes, dispatch_notes,
      created_at, updated_at
    FROM repair_requests
  `);
  const [[rrpuRow]] = await db.execute('SELECT COUNT(*) AS cnt FROM repair_request_public_updates');
  console.log(`  ✓ [repair_request_public_updates] ${rrpuRow.cnt} rows synced`);
  results.repair_request_public_updates = { afterCount: Number(rrpuRow.cnt) };

  // ── 7. Repair status history ──────────────────────────────────
  console.log('[7/16] Repair status history...');
  const history = await fetchSupabase('repair_status_history');
  results.repair_status_history = await migrateTable({
    label: 'repair_status_history', mysqlTable: 'repair_status_history', rows: history,
    insertFn: async (conn, h) => conn.execute(
      `INSERT IGNORE INTO repair_status_history
         (id, request_id, status, old_status, new_status, old_location, new_location,
          note, created_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [h.id, h.request_id, h.status, h.old_status ?? null, h.new_status ?? null,
       h.old_location ?? null, h.new_location ?? null, h.note ?? null,
       h.created_by ?? null, ts(h.created_at)],
    ),
  });

  // ── 8. Repair request activity ────────────────────────────────
  console.log('[8/16] Repair request activity...');
  const activity = await fetchSupabase('repair_request_activity');
  results.repair_request_activity = await migrateTable({
    label: 'repair_request_activity', mysqlTable: 'repair_request_activity', rows: activity,
    insertFn: async (conn, a) => conn.execute(
      `INSERT IGNORE INTO repair_request_activity
         (id, request_id, actor_id, action, old_status, new_status, old_location, new_location, note, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [a.id, a.request_id, a.actor_id ?? null, a.action, a.old_status ?? null, a.new_status ?? null,
       a.old_location ?? null, a.new_location ?? null, a.note ?? null, ts(a.created_at)],
    ),
  });

  // ── 9. Enquiries ──────────────────────────────────────────────
  console.log('[9/16] Enquiries...');
  const enquiries = await fetchSupabase('enquiries');
  results.enquiries = await migrateTable({
    label: 'enquiries', mysqlTable: 'enquiries', rows: enquiries,
    insertFn: async (conn, e) => conn.execute(
      `INSERT IGNORE INTO enquiries
         (id, name, email, mobile, organisation, subject, message,
          enquiry_type, status, is_read, admin_note, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [e.id, e.name, e.email?.toLowerCase(), e.mobile ?? null, e.organisation ?? null,
       e.subject ?? null, e.message, e.enquiry_type || 'general',
       e.status || 'new', e.is_read ? 1 : 0, e.admin_note ?? null, ts(e.created_at)],
    ),
  });

  // ── 10. Testimonials ──────────────────────────────────────────
  console.log('[10/16] Testimonials...');
  const testimonials = await fetchSupabase('testimonials');
  results.testimonials = await migrateTable({
    label: 'testimonials', mysqlTable: 'testimonials', rows: testimonials,
    insertFn: async (conn, t) => conn.execute(
      `INSERT IGNORE INTO testimonials
         (id, customer_name, organisation, city, rating, feedback,
          is_sample, is_approved, is_featured, sort_order, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [t.id, t.customer_name, t.organisation ?? null, t.city ?? null,
       t.rating ?? 5, t.feedback,
       t.is_sample ? 1 : 0, t.is_approved ? 1 : 0, t.is_featured ? 1 : 0,
       t.sort_order ?? 0, ts(t.created_at)],
    ),
  });

  // ── 11. Services ──────────────────────────────────────────────
  console.log('[11/16] Services...');
  const services = await fetchSupabase('services');
  results.services = await migrateTable({
    label: 'services', mysqlTable: 'services', rows: services,
    insertFn: async (conn, s) => conn.execute(
      `INSERT IGNORE INTO services
         (slug, name, category, short_description, detailed_description,
          common_problems, carousel_images, primary_image_id,
          is_published, is_featured, sort_order, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [s.slug, s.name, s.category, s.short_description, s.detailed_description,
       JSON.stringify(Array.isArray(s.common_problems) ? s.common_problems : []),
       JSON.stringify(s.carousel_images ?? []),
       s.primary_image_id ?? null,
       s.is_published ? 1 : 0, s.is_featured ? 1 : 0,
       s.sort_order ?? 0, ts(s.created_at), ts(s.updated_at)],
    ),
  });

  // ── 12. Notifications ─────────────────────────────────────────
  console.log('[12/16] Notifications...');
  const notifs = await fetchSupabase('notifications');
  results.notifications = await migrateTable({
    label: 'notifications', mysqlTable: 'notifications', rows: notifs,
    insertFn: async (conn, n) => conn.execute(
      `INSERT IGNORE INTO notifications
         (id, type, title, message, related_table, related_id, is_read, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [n.id, n.type || 'system', n.title, n.message,
       n.related_table ?? null, n.related_id ?? null,
       n.is_read ? 1 : 0, ts(n.created_at)],
    ),
  });

  // ── 13. Tracking ──────────────────────────────────────────────
  console.log('[13/16] Tracking...');
  const tracking = await fetchSupabase('tracking');
  results.tracking = await migrateTable({
    label: 'tracking', mysqlTable: 'tracking', rows: tracking,
    insertFn: async (conn, tr) => conn.execute(
      `INSERT IGNORE INTO tracking
         (id, tracking_id, order_id, customer_name, customer_email, customer_mobile,
          equipment_name, status, timeline, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [tr.id, tr.tracking_id ?? null, tr.order_id ?? null, tr.customer_name ?? null,
       tr.customer_email?.toLowerCase() ?? null, tr.customer_mobile ?? null,
       tr.equipment_name ?? null, tr.status || 'pending',
       JSON.stringify(tr.timeline ?? []), ts(tr.created_at), ts(tr.updated_at)],
    ),
  });

  // ── 14. Orders ────────────────────────────────────────────────
  console.log('[14/16] Orders...');
  const orders = await fetchSupabase('orders');
  results.orders = await migrateTable({
    label: 'orders', mysqlTable: 'orders', rows: orders,
    insertFn: async (conn, o) => conn.execute(
      `INSERT IGNORE INTO orders
         (id, order_number, customer_name, customer_email, customer_mobile, shipping_address,
          service_name, total_amount, payment_status, payment_method, transaction_id,
          status, tracking_id, fulfillment_note, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [o.id, o.order_number ?? null, o.customer_name ?? null, o.customer_email?.toLowerCase() ?? null,
       o.customer_mobile ?? null, o.shipping_address ?? null, o.service_name ?? null,
       o.total_amount ?? 0, o.payment_status || 'pending', o.payment_method ?? null,
       o.transaction_id ?? null, o.status || 'pending', o.tracking_id ?? null,
       o.fulfillment_note ?? null, ts(o.created_at), ts(o.updated_at)],
    ),
  });

  // ── 15. Order items/events ────────────────────────────────────
  console.log('[15/16] Order items...');
  const orderItems = await fetchSupabase('order_items');
  results.order_items = await migrateTable({
    label: 'order_items', mysqlTable: 'order_items', rows: orderItems,
    insertFn: async (conn, item) => conn.execute(
      `INSERT IGNORE INTO order_items (id, order_id, name, image_url, quantity, price, total, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [item.id, item.order_id, item.name ?? null, item.image_url ?? null,
       item.quantity ?? 1, item.price ?? 0, item.total ?? 0, ts(item.created_at)],
    ),
  });

  console.log('[15b] Order events...');
  const orderEvents = await fetchSupabase('order_events');
  results.order_events = await migrateTable({
    label: 'order_events', mysqlTable: 'order_events', rows: orderEvents,
    insertFn: async (conn, ev) => conn.execute(
      `INSERT IGNORE INTO order_events (id, order_id, title, message, status, created_at)
       VALUES (?,?,?,?,?,?)`,
      [ev.id, ev.order_id, ev.title ?? null, ev.message ?? null, ev.status ?? null, ts(ev.created_at)],
    ),
  });

  // ── 16. Office availability ───────────────────────────────────
  console.log('[16/16] Office availability...');
  const oa = await fetchSupabase('office_availability');
  results.office_availability = await migrateTable({
    label: 'office_availability', mysqlTable: 'office_availability', rows: oa,
    insertFn: async (conn, o) => conn.execute(
      `INSERT IGNORE INTO office_availability
         (id, status, starts_at, ends_at, reason, reopening_at,
          created_by, updated_by, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [o.id, o.status, ts(o.starts_at), ts(o.ends_at) ?? null,
       o.reason ?? null, ts(o.reopening_at) ?? null,
       o.created_by ?? null, o.updated_by ?? null,
       ts(o.created_at), ts(o.updated_at)],
    ),
  });

  // ── 16b. Website images ───────────────────────────────────────
  console.log('[16b] Website images...');
  const images = await fetchSupabase('website_images');
  results.website_images = await migrateTable({
    label: 'website_images', mysqlTable: 'website_images', rows: images,
    insertFn: async (conn, i) => conn.execute(
      `INSERT IGNORE INTO website_images
         (id, bucket, path, url, alt_text, category, is_primary, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [i.id, i.bucket, i.path, i.url ?? null, i.alt_text ?? null,
       i.category ?? null, i.is_primary ? 1 : 0, ts(i.created_at), ts(i.updated_at)],
    ),
  });

  // ── Verification report ───────────────────────────────────────
  console.log('\n[data-migration] ══════════════════════════════════════════');
  console.log('[data-migration]  VERIFICATION REPORT');
  console.log('[data-migration] ══════════════════════════════════════════');

  const VERIFY_TABLES = [
    'users', 'profiles', 'user_roles', 'staff_permissions', 'admin_login_audit',
    'repair_requests', 'repair_request_public_updates', 'repair_status_history',
    'repair_request_activity', 'enquiries', 'testimonials', 'services',
    'notifications', 'tracking', 'orders', 'order_items', 'order_events',
    'office_availability', 'website_images',
  ];

  let totalMissing = 0;
  for (const t of VERIFY_TABLES) {
    const [[row]] = await db.execute(`SELECT COUNT(*) AS cnt FROM \`${t}\``);
    const mysqlCount   = Number(row.cnt);
    const sourceResult = results[t];
    const sourceCount  = sourceResult?.sourceCount ?? sourceResult?.afterCount ?? '—';
    const match = typeof sourceCount === 'number'
      ? (mysqlCount >= sourceCount ? '✓' : '⚠ MISMATCH')
      : '—';
    const missing = typeof sourceCount === 'number' ? Math.max(0, sourceCount - mysqlCount) : 0;
    totalMissing += missing;
    console.log(`  ${match.padEnd(12)} ${t.padEnd(42)} Supabase: ${String(sourceCount).padStart(5)} | MySQL: ${String(mysqlCount).padStart(5)}${missing > 0 ? ` | MISSING: ${missing}` : ''}`);
  }

  console.log('\n[data-migration] ══════════════════════════════════════════');
  if (totalMissing > 0) {
    console.log(`[data-migration]  ⚠ WARNING: ${totalMissing} total records missing.`);
    console.log('[data-migration]  Investigate mismatches before going live.');
    console.log('[data-migration]  Do NOT delete Supabase data until counts match.');
  } else {
    console.log('[data-migration]  ✓ All row counts match or exceed source.');
    console.log('[data-migration]  ✓ Supabase data was NOT modified.');
  }
  console.log('[data-migration]  ✓ Next step: run the Hostinger API and verify login.');
  console.log('[data-migration]  ✓ Remove SUPABASE_SERVICE_ROLE_KEY from .env when done.');
  console.log('[data-migration] ══════════════════════════════════════════\n');

  process.exit(totalMissing > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('[data-migration] Fatal error:', err.message);
  process.exit(1);
});
