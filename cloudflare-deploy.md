# Arise Healthcare Solutions — Cloudflare Worker Deployment Guide

## Worker name: ecliptixsolutionscom-png-arise

## Architecture

```
Browser
  → Cloudflare Worker  (src/server.ts — proxyToHostinger)
  → Render Node.js API (arise-api service)
  → Hostinger MySQL
```

The Cloudflare Worker intercepts all `/api/*` requests and proxies them to the
Render API using the `HOSTINGER_API_URL` Worker secret (name kept for compatibility).
The variable name `HOSTINGER_API_URL` is intentional — the code already uses this name.
Its **value** is now the Render service URL.

---

## ⚠️  CRITICAL — Why POST /api/enquiries returns 404

The 404 on `/api/enquiries` is caused by one (or both) of the following:

### Cause A — Worker not deployed (most common)
The Cloudflare Worker is not running. Without it, Cloudflare Pages serves the
SPA and returns a generic 404 for any `/api/*` path.

**Fix**: Run Step 4 below to deploy (or redeploy) the Worker.

### Cause B — HOSTINGER_API_URL secret not set in the Worker
If the Worker is running but `HOSTINGER_API_URL` is missing from the Worker's
secrets, the proxy returns 503 instead of forwarding to the Render API.

**Fix**: Run Step 2 below to set the secret, then redeploy.

---

## Step 1 — Build

```bash
npm run build
```

Output lands in `.output/` — do NOT commit this directory.

---

## Step 2 — Set Cloudflare Worker secrets

Run these commands from the project root. Use the Render service URL as the value
of `HOSTINGER_API_URL` (the variable name is kept for compatibility — the value
is now the Render URL, not the old Hostinger API domain).

```bash
# The Render API HTTPS URL — get it from Render dashboard → arise-api → Settings → URL
wrangler secret put HOSTINGER_API_URL --name ecliptixsolutionscom-png-arise
# Enter: https://arise-api-xxxx.onrender.com  (your actual Render URL)

# Shared server-to-server secret (MUST match ARISE_API_SECRET set in Render env vars)
wrangler secret put ARISE_API_SECRET --name ecliptixsolutionscom-png-arise
# Enter: <same value as ARISE_API_SECRET in Render environment variables>

# JWT session signing secret (MUST match SESSION_SECRET set in Render env vars)
wrangler secret put SESSION_SECRET --name ecliptixsolutionscom-png-arise
# Enter: <same value as SESSION_SECRET in Render environment variables>
```

> **NEVER** use `VITE_ARISE_API_SECRET` or `VITE_SESSION_SECRET`.
> `VITE_*` variables are embedded into the client bundle at build time and are
> readable by anyone who downloads the page.

---

## Step 3 — Set VITE build-time variable (optional for browser SSR fallback)

Before running `npm run build` for production, set in your local `.env`:

```
VITE_HOSTINGER_API_URL=https://arise-api-xxxx.onrender.com
```

This is the only variable that goes into the browser bundle.
It is a URL only — no credential. Replace `xxxx` with your actual Render service ID.

---

## Step 4 — Deploy

```bash
# From the .output/server directory
npx wrangler deploy --name ecliptixsolutionscom-png-arise
```

Or use Cloudflare Pages CI/CD with build command `npm run build`
and publish directory `.output/public`.

---

## Step 5 — Verify Worker environment variables

```bash
wrangler secret list --name ecliptixsolutionscom-png-arise
```

Expected output (names only — values are encrypted):
```
HOSTINGER_API_URL
ARISE_API_SECRET
SESSION_SECRET
```

---

## Step 6 — Verify the connection

After deploying, test the enquiries endpoint:

```bash
curl -X POST https://www.arisehealthcaresolutions.com/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test enquiry"}'
```

Expected response (HTTP 201):
```json
{"success":true,"id":"<uuid>","message":"Enquiry submitted successfully"}
```

Test a public GET endpoint:

```bash
curl https://www.arisehealthcaresolutions.com/api/services
```

Expected: JSON array of services.

---

## Security checklist

| Variable            | Location               | Exposed to browser? |
|---------------------|------------------------|---------------------|
| HOSTINGER_API_URL   | CF Worker secret       | NO (server-side)    |
| ARISE_API_SECRET    | CF Worker secret       | NO (server-side)    |
| SESSION_SECRET      | CF Worker secret       | NO (server-side)    |
| MYSQL_HOST          | Render env vars        | NO (never leaves Render) |
| MYSQL_PASSWORD      | Render env vars        | NO (never leaves Render) |
| ARISE_API_SECRET    | Render env vars        | NO (never leaves Render) |
| SESSION_SECRET      | Render env vars        | NO (never leaves Render) |
| VITE_HOSTINGER_API_URL | .env (build-time)   | YES — URL only, no secret |

---

## Render environment variables (set in Render dashboard)

These are already configured in the Render arise-api service. Do NOT move them
to Cloudflare or the browser:

```
MYSQL_HOST=<hostinger mysql host>
MYSQL_PORT=3306
MYSQL_DATABASE=<database name>
MYSQL_USER=<user>
MYSQL_PASSWORD=<password>
ARISE_API_SECRET=<same value set in CF Worker>
SESSION_SECRET=<same value set in CF Worker>
ALLOWED_ORIGIN=https://www.arisehealthcaresolutions.com,https://arisehealthcaresolutions.com
NODE_ENV=production
```

---

## Rollback

If the deployment has issues, the previous Cloudflare Worker version can be
re-activated from the Cloudflare dashboard → Workers → ecliptixsolutionscom-png-arise
→ Deployments → roll back.
