# Arise Healthcare Solutions — Cloudflare Worker Deployment Guide

## Worker name: ecliptixsolutionscom-png-arise

---

## Step 1 — Build

```bash
npm run build
```

Output lands in `.output/` — do NOT commit this directory.

---

## Step 2 — Set Cloudflare Worker secrets

Run these commands from the project root **after** generating secrets on the Hostinger server
(`node generate-secrets.js`).

```bash
# The full HTTPS URL to the Hostinger API (not a secret — but set as env var)
wrangler secret put HOSTINGER_API_URL --name ecliptixsolutionscom-png-arise
# Enter: https://api.arisehealthcare.in  (or your actual Hostinger domain/port)

# Shared server-to-server secret (MUST match ARISE_API_SECRET on Hostinger .env)
wrangler secret put ARISE_API_SECRET --name ecliptixsolutionscom-png-arise
# Enter: <value from generate-secrets.js output>

# JWT session signing secret (MUST match SESSION_SECRET on Hostinger .env)
wrangler secret put SESSION_SECRET --name ecliptixsolutionscom-png-arise
# Enter: <value from generate-secrets.js output>
```

> **NEVER** use `VITE_ARISE_API_SECRET` or `VITE_SESSION_SECRET`.
> `VITE_*` variables are embedded into the client bundle at build time and are
> readable by anyone who downloads the page.

---

## Step 3 — Set VITE build-time variable

Before running `npm run build` for production, set in your local `.env`:

```
VITE_HOSTINGER_API_URL=https://api.arisehealthcare.in
```

This is the only variable that goes into the browser bundle.
It is a URL only — no credential.

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

## Security checklist

| Variable            | Location          | Exposed to browser? |
|---------------------|-------------------|---------------------|
| HOSTINGER_API_URL   | CF Worker secret  | NO (server-side)    |
| ARISE_API_SECRET    | CF Worker secret  | NO (server-side)    |
| SESSION_SECRET      | CF Worker secret  | NO (server-side)    |
| MYSQL_PASSWORD      | Hostinger .env    | NO (never leaves Hostinger) |
| SUPABASE_SERVICE_ROLE_KEY | Hostinger .env (migration only, then remove) | NO |
| VITE_HOSTINGER_API_URL | .env (build-time) | YES — URL only, no secret |

---

## Rollback

If the deployment has issues, the previous Cloudflare Worker version can be
re-activated from the Cloudflare dashboard → Workers → ecliptixsolutionscom-png-arise
→ Deployments → roll back.

Supabase remains active for 30 days as backup. Do NOT deactivate it yet.
