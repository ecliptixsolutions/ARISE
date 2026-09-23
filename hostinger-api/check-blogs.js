// check-blogs.js — read-only Blog CMS database verification
import 'dotenv/config';
import mysql from 'mysql2/promise';

const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER || !MYSQL_PASSWORD) {
  console.error('[check-blogs] Missing MySQL env vars.');
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
  const [tables] = await conn.execute("SHOW TABLES LIKE 'blogs'");
  const exists = tables.length > 0;
  console.log(`blogs table exists: ${exists ? 'YES' : 'NO'}`);
  if (!exists) process.exit(0);

  const [[count]] = await conn.execute('SELECT COUNT(*) AS total FROM blogs');
  const [[duplicates]] = await conn.execute(
    'SELECT COUNT(*) AS duplicate_slug_groups FROM (SELECT slug FROM blogs GROUP BY slug HAVING COUNT(*) > 1) d',
  );
  const [[missing]] = await conn.execute(
    `SELECT
       SUM(title IS NULL OR title = '') AS missing_title,
       SUM(slug IS NULL OR slug = '') AS missing_slug,
       SUM(content IS NULL OR content = '') AS missing_content,
       SUM(thumbnail_url IS NULL OR thumbnail_url = '') AS missing_thumbnail
     FROM blogs`,
  );
  const [[published]] = await conn.execute("SELECT COUNT(*) AS total FROM blogs WHERE status='published'");

  console.log(`final database count: ${count.total}`);
  console.log(`published count: ${published.total}`);
  console.log(`duplicate slug groups: ${duplicates.duplicate_slug_groups}`);
  console.log(`missing title: ${missing.missing_title ?? 0}`);
  console.log(`missing slug: ${missing.missing_slug ?? 0}`);
  console.log(`missing content: ${missing.missing_content ?? 0}`);
  console.log(`missing thumbnail: ${missing.missing_thumbnail ?? 0}`);
} finally {
  await conn.end();
}
