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
