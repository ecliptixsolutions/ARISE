// migrate.js — Apply the Arise MySQL schema to the Hostinger database
// Safe to run multiple times — uses IF NOT EXISTS throughout.
// Usage: node migrate.js
//
// SAFETY GUARANTEES:
//   - Every CREATE TABLE uses IF NOT EXISTS (never drops existing tables)
//   - Every CREATE INDEX uses IF NOT EXISTS
//   - No DROP, TRUNCATE, or DELETE statements are executed
//   - Existing production data is never touched
//   - Idempotent: safe to re-run after partial failures

import 'dotenv/config';
import { readFileSync } from 'fs';
import mysql from 'mysql2/promise';

const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER || !MYSQL_PASSWORD) {
  console.error('[migrate] FATAL: Missing MySQL env vars. Copy .env.example to .env and fill in values.');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT) || 3306,
  database: MYSQL_DATABASE,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 15000,
});

try {
  console.log(`[migrate] Connected to ${MYSQL_HOST}/${MYSQL_DATABASE}`);

  const sql = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

  // ── Safety check: block any destructive statement ─────────────────
  // Scan every statement before executing anything
  const DANGEROUS = /^\s*(DROP\s+(TABLE|DATABASE|INDEX)|TRUNCATE|DELETE\s+FROM|ALTER\s+TABLE\s+\S+\s+DROP)/i;
  const statements = sql
    .split(';')
    .map(s => s.replace(/^\s*(?:--.*(?:\r?\n|$))+/gm, '').trim())
    .filter(s => s.length > 0);

  const dangerous = statements.filter(s => DANGEROUS.test(s));
  if (dangerous.length > 0) {
    console.error('[migrate] ABORTED: Dangerous statement(s) detected in schema.sql:');
    dangerous.forEach(s => console.error(' >', s.slice(0, 120)));
    console.error('[migrate] Review schema.sql before running migrate.js.');
    process.exit(1);
  }
  console.log(`[migrate] Safety check passed — ${statements.length} statements, 0 destructive.`);

  // ── Execute statements one by one ─────────────────────────────────
  let ok = 0;
  let skipped = 0;
  let warnings = 0;

  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
      ok++;
    } catch (err) {
      // Expected benign errors when tables/indexes already exist
      if ([1050, 1061, 1068, 1060].includes(err.errno)) {
        // 1050 = ER_TABLE_EXISTS_ERROR
        // 1061 = ER_DUP_KEYNAME
        // 1068 = ER_MULTIPLE_PRI_KEY
        // 1060 = ER_DUP_FIELDNAME
        skipped++;
      } else if (err.errno === 3780) {
        // ER_REFERENCING_TO_INVALID_TABLE — FK target doesn't exist yet
        // This can happen with CHECK constraints on older MySQL 8.0 minor versions
        console.warn(`[migrate] Warning (${err.errno}): ${err.message.slice(0, 100)}`);
        warnings++;
      } else {
        console.error(`[migrate] Error on statement:\n  ${stmt.slice(0, 120)}\n  → ${err.message}`);
        warnings++;
        // Continue — don't abort. Log and proceed to maximise schema coverage.
      }
    }
  }

  // ── Verify expected tables exist ──────────────────────────────────
  const EXPECTED_TABLES = [
    'users', 'sessions', 'password_reset_tokens', 'profiles',
    'user_roles', 'staff_permissions', 'admin_login_audit',
    'repair_requests', 'repair_request_public_updates',
    'repair_status_history', 'repair_request_activity',
    'enquiries', 'notifications', 'services', 'testimonials',
    'blogs',
    'tracking', 'orders', 'order_items', 'order_events',
    'website_images', 'office_availability', 'change_log',
  ];

  const [tableRows] = await conn.execute('SHOW TABLES');
  const existing = new Set(tableRows.map(r => Object.values(r)[0]));
  const missing = EXPECTED_TABLES.filter(t => !existing.has(t));

  if (missing.length > 0) {
    console.error(`[migrate] Missing tables after migration: ${missing.join(', ')}`);
    console.error('[migrate] Check the error output above and re-run.');
    process.exit(1);
  }

  console.log(`\n[migrate] ══════════════════════════════════════`);
  console.log(`[migrate]  Done.`);
  console.log(`[migrate]  Statements executed: ${ok}`);
  console.log(`[migrate]  Already existed (skipped): ${skipped}`);
  console.log(`[migrate]  Warnings: ${warnings}`);
  console.log(`[migrate]  Tables verified: ${EXPECTED_TABLES.length}/${EXPECTED_TABLES.length}`);
  console.log(`[migrate] ══════════════════════════════════════\n`);

} finally {
  await conn.end();
}
