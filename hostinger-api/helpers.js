// helpers.js — shared utility functions
import { v4 as uuidv4 } from 'uuid';

export function newId() {
  return uuidv4();
}

export function nowUtc() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

/** Normalize Indian mobile numbers: strip leading +91 / 91 from 12/13-digit numbers */
export function normalizeMobile(value) {
  if (!value) return value;
  let v = String(value).trim().replace(/[\s\-().]/g, '');
  if (v.startsWith('+91') && v.length === 13) v = v.slice(3);
  if (v.startsWith('91') && v.length === 12) v = v.slice(2);
  return v;
}

/** Sync a repair_request row into repair_request_public_updates (replaces PostgreSQL trigger) */
export async function syncPublicUpdate(conn, requestId) {
  await conn.execute(
    `INSERT INTO repair_request_public_updates
       (id, request_code, full_name, equipment_category, equipment_name, brand, model_no,
        serial_no, problem_description, status, current_location, customer_visible_note,
        assigned_to, inspection_notes, repair_notes, quality_testing_notes, dispatch_notes,
        created_at, updated_at)
     SELECT id, request_code, full_name, equipment_category, equipment_name, brand, model_no,
            serial_no, problem_description, status, current_location, customer_visible_note,
            assigned_to, inspection_notes, repair_notes, quality_testing_notes, dispatch_notes,
            created_at, updated_at
     FROM repair_requests
     WHERE id = ?
     ON DUPLICATE KEY UPDATE
       request_code = VALUES(request_code),
       full_name = VALUES(full_name),
       equipment_category = VALUES(equipment_category),
       equipment_name = VALUES(equipment_name),
       brand = VALUES(brand),
       model_no = VALUES(model_no),
       serial_no = VALUES(serial_no),
       problem_description = VALUES(problem_description),
       status = VALUES(status),
       current_location = VALUES(current_location),
       customer_visible_note = VALUES(customer_visible_note),
       assigned_to = VALUES(assigned_to),
       inspection_notes = VALUES(inspection_notes),
       repair_notes = VALUES(repair_notes),
       quality_testing_notes = VALUES(quality_testing_notes),
       dispatch_notes = VALUES(dispatch_notes),
       updated_at = VALUES(updated_at)`,
    [requestId],
  );
}

/** Insert a change_log row (used by polling endpoint) */
export async function logChange(conn, tableName, rowId, operation) {
  await conn.execute(
    'INSERT INTO change_log (table_name, row_id, operation) VALUES (?,?,?)',
    [tableName, rowId ?? null, operation],
  );
}

/** Insert a notification row */
export async function insertNotification(conn, type, title, message, relatedTable, relatedId) {
  const id = newId();
  await conn.execute(
    'INSERT INTO notifications (id, type, title, message, related_table, related_id) VALUES (?,?,?,?,?,?)',
    [id, type, title, message, relatedTable ?? null, relatedId ?? null],
  );
  await logChange(conn, 'notifications', id, 'INSERT');
  return id;
}
