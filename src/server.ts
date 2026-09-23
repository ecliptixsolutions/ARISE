import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleMetaLead, sendPageView } from "./lib/meta-capi";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function getHostingerEnv(env: unknown): { apiUrl: string; secret: string } {
  const e = (env ?? {}) as Record<string, string>;
  const apiUrl =
    (e.HOSTINGER_API_URL ?? (typeof process !== "undefined" ? (process as any).env?.HOSTINGER_API_URL : "") ?? "").replace(/\/$/, "");
  const secret = e.ARISE_API_SECRET ?? (typeof process !== "undefined" ? (process as any).env?.ARISE_API_SECRET : "") ?? "";
  return { apiUrl, secret };
}

async function requireUploadUser(request: Request, env: unknown): Promise<Response | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "No token" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { apiUrl, secret } = getHostingerEnv(env);
  if (!apiUrl) {
    console.error("[upload] HOSTINGER_API_URL is not configured in Worker environment");
    return new Response(JSON.stringify({ error: "API service is not configured." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        authorization: auth,
        ...(secret ? { "x-arise-secret": secret } : {}),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[upload] Failed to validate session: ${msg}`);
    return new Response(JSON.stringify({ error: "Unable to validate session. Please try again." }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return null;
}

async function handleUpload(request: Request, env: unknown): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/uploads/")) {
    const images = (env as { BLOG_IMAGES?: { get: (key: string, options?: { type: "arrayBuffer" | "text" }) => Promise<ArrayBuffer | string | null> } }).BLOG_IMAGES;
    if (!images) return new Response("Image storage is not configured.", { status: 503 });
    const key = url.pathname.slice("/uploads/".length);
    const [body, contentType] = await Promise.all([
      images.get(key, { type: "arrayBuffer" }) as Promise<ArrayBuffer | null>,
      images.get(`${key}:content-type`, { type: "text" }) as Promise<string | null>,
    ]);
    if (!body) return new Response("Not found", { status: 404 });
    return new Response(body, {
      headers: {
        "content-type": contentType ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (url.pathname !== "/api/uploads/blog-thumbnail") return null;
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const authError = await requireUploadUser(request, env);
  if (authError) return authError;

  const images = (env as { BLOG_IMAGES?: { put: (key: string, value: ArrayBuffer | string) => Promise<unknown> } }).BLOG_IMAGES;
  if (!images) {
    return new Response(JSON.stringify({ error: "Image storage is not configured." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[upload] Invalid multipart form data: ${msg}`);
    return new Response(JSON.stringify({ error: "Invalid image upload request." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "Image file required." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return new Response(JSON.stringify({ error: "Upload JPG, PNG or WEBP files only." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (file.size > 5 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "Image must be 5 MB or smaller." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `blog-thumbnails/${Date.now()}-${safeName}`;
  try {
    await Promise.all([
      images.put(path, await file.arrayBuffer()),
      images.put(`${path}:content-type`, file.type),
    ]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[upload] Failed to store blog thumbnail: ${msg}`);
    return new Response(JSON.stringify({ error: "Unable to store image. Please try again." }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    path,
    url: `${url.origin}/uploads/${path}`,
    alt: file.name.replace(/\.[^.]+$/, ""),
  }), {
    headers: { "content-type": "application/json" },
  });
}

async function proxyToHostinger(request: Request, env: unknown): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return null;
  if (url.pathname === "/api/meta-capi/lead") return null;

  // Handle CORS preflight for API routes
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": url.origin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,x-arise-secret",
        "Access-Control-Max-Age": "600",
      },
    });
  }

  const { apiUrl, secret } = getHostingerEnv(env);
  if (!apiUrl) {
    console.error("[proxy] HOSTINGER_API_URL is not configured in Worker environment");
    return new Response(JSON.stringify({ error: "API service not configured. Please contact support." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  const target = `${apiUrl}${url.pathname}${url.search}`;
  const headers = new Headers();
  const ct = request.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const auth = request.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  // x-arise-secret is a server-side Worker secret — never exposed to browser JS
  if (secret) headers.set("x-arise-secret", secret);
  // Forward real client IP for rate-limiting on the backend
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) headers.set("x-forwarded-for", cfIp);

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  let body: ArrayBuffer | undefined;
  if (hasBody) {
    try {
      body = await request.arrayBuffer();
    } catch {
      body = undefined;
    }
  }

  try {
    const res = await fetch(target, {
      method,
      headers,
      body: hasBody && body && body.byteLength ? body : undefined,
    });
    const resHeaders = new Headers(res.headers);
    resHeaders.set("x-proxied-by", "cloudflare-worker");
    // Stream the body back — do not buffer large responses
    return new Response(res.body, { status: res.status, headers: resHeaders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[proxy] Failed to reach Hostinger API at ${target}: ${msg}`);
    return new Response(JSON.stringify({ error: "Unable to reach API service. Please try again shortly." }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const uploadResponse = await handleUpload(request, env);
      if (uploadResponse) return uploadResponse;

      if (new URL(request.url).pathname === "/api/meta-capi/lead") {
        return await handleMetaLead(request, env as Parameters<typeof handleMetaLead>[1]);
      }

      const proxied = await proxyToHostinger(request, env);
      if (proxied) return proxied;

      const pageViewEventId = sendPageView(
        request,
        env as Parameters<typeof sendPageView>[1],
        ctx as Parameters<typeof sendPageView>[2],
      );
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      if (pageViewEventId) normalized.headers.append("Set-Cookie", `meta_page_event_id=${pageViewEventId}; Path=/; Max-Age=60; SameSite=Lax; Secure`);
      return normalized;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
