// server.js — Arise Healthcare Solutions Hostinger MySQL API Bridge
// Deploy on Hostinger (Node.js >= 18). The Cloudflare Worker calls this over HTTPS.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { requireApiSecret } from './middleware.js';
import { pruneExpiredSessions } from './auth.js';
import authRoutes from './routes/auth.routes.js';
import repairRoutes from './routes/repair.routes.js';
import staffRoutes from './routes/staff.routes.js';
import contentRoutes from './routes/content.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';

app.set('trust proxy', 1);

// ── Validate critical env vars at startup ─────────────────────
const REQUIRED = ['MYSQL_HOST','MYSQL_DATABASE','MYSQL_USER','MYSQL_PASSWORD','ARISE_API_SECRET','SESSION_SECRET'];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`[arise-api] FATAL: Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

// ── Security headers ──────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  res.removeHeader('X-Powered-By');
  next();
});

// ── CORS ──────────────────────────────────────────────────────
// Split by comma to support multiple origins (e.g. preview + production)
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Server-to-server requests have no origin header — always allow
    if (!origin) return cb(null, true);
    // If no ALLOWED_ORIGIN configured in dev, allow all
    if (allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-arise-secret'],
  credentials: true,
  maxAge: 600,
}));

// ── Body parsing — cap at 2 MB to prevent abuse ───────────────
app.use(express.json({ limit: '2mb' }));

// ── Health check (unauthenticated — returns no internal info) ──
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── Public endpoint allowlist ─────────────────────────────────
// These paths do NOT require the server-to-server x-arise-secret header.
// Everything else under /api/* requires it.
function isPublicPath(method, path) {
  if (method === 'OPTIONS') return true;
  if (method === 'POST' && ['/auth/login', '/auth/request-password-reset', '/auth/reset-password'].includes(path)) return true;
  if (method === 'POST' && path === '/repair-requests') return true;
  if (method === 'POST' && path === '/enquiries') return true;
  if (method === 'GET'  && path === '/services') return true;
  if (method === 'GET'  && (path === '/blogs' || path.startsWith('/blogs/'))) return true;
  if (method === 'GET'  && path === '/testimonials') return true;
  if (method === 'GET'  && path === '/office-availability') return true;
  if (method === 'GET'  && path === '/poll') return true;
  if (method === 'GET'  && (path === '/repair-requests/track' || path.startsWith('/repair-requests/track/'))) return true;
  return false;
}

app.use('/api', (req, res, next) => {
  if (isPublicPath(req.method, req.path)) return next();
  if ((req.headers.authorization ?? '').startsWith('Bearer ')) return next();
  return requireApiSecret(req, res, next);
});

// ── Mount routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/repair-requests', repairRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api', contentRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler — never leak stack traces to client ──
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Log full error server-side only
  console.error(`[API Error] ${req.method} ${req.path} —`, err.message);
  if (NODE_ENV !== 'production') {
    return res.status(500).json({ error: err.message });
  }
  // In production: generic message only
  return res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[arise-api] started on port ${PORT} (${NODE_ENV})`);
  // Prune expired sessions every hour
  setInterval(() => pruneExpiredSessions().catch(e => console.error('[prune]', e.message)), 60 * 60 * 1000);
  // Prune old change_log rows every 24 hours (keep 7 days)
  setInterval(() => pruneLogs().catch(e => console.error('[prune-logs]', e.message)), 24 * 60 * 60 * 1000);
});

async function pruneLogs() {
  const { query } = await import('./db.js');
  await query("DELETE FROM change_log WHERE created_at < NOW() - INTERVAL 7 DAY");
}
