// fix-password-hashes.js — one-time cleanup for malformed password_hash values
// Run from inside hostinger-api/: node fix-password-hashes.js
// (or copy this file into hostinger-api/ and run `node fix-password-hashes.js`)
//
// Some rows in `users` ended up with a password_hash 1 byte longer than the
// valid 60-char bcrypt hash (likely a stray whitespace/newline picked up
// during a data import/migration). This trims any password_hash down to the
// correct 60 characters, wherever it's longer than that.

import 'dotenv/config';
import mysql from 'mysql2/promise';

const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

const conn = await mysql.createConnection({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT) || 3306,
  database: MYSQL_DATABASE,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  charset: 'utf8mb4',
});

try {
  const [before] = await conn.execute(
    `SELECT email, LENGTH(password_hash) AS len FROM users WHERE LENGTH(password_hash) <> 60`,
  );
  console.log('[fix-hashes] Affected rows before fix:', before);

  const [result] = await conn.execute(
    `UPDATE users SET password_hash = LEFT(password_hash, 60) WHERE LENGTH(password_hash) <> 60`,
  );
  console.log(`[fix-hashes] Updated ${result.affectedRows} row(s).`);

  const [after] = await conn.execute(
    `SELECT email, LENGTH(password_hash) AS len FROM users WHERE LENGTH(password_hash) <> 60`,
  );
  console.log('[fix-hashes] Remaining bad rows (should be empty):', after);
} finally {
  await conn.end();
}