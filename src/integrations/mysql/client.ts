// src/integrations/mysql/client.ts
// HTTP client for both Cloudflare Worker (server-side) and browser.
//
// Security boundaries:
//   ARISE_API_SECRET — read from process.env (Worker secret). NEVER from VITE_ vars.
//   VITE_HOSTINGER_API_URL — build-time URL only (not a secret). Used by browser JS.
//   JWT session token — stored in localStorage, sent as Authorization: Bearer header.

// Browser calls should stay same-origin (`/api/...`) so the Cloudflare Worker
// can add the server-side secret and proxy to Hostinger without CORS issues.
const API_URL: string =
  (typeof process !== "undefined" && process.env?.HOSTINGER_API_URL
    ? process.env.HOSTINGER_API_URL
    : null) ?? "";

// API_SECRET is ONLY populated server-side (process.env in Cloudflare Worker).
// In the browser, process.env is undefined — this correctly evaluates to "".
// The secret is therefore never sent from browser requests.
const API_SECRET: string =
  typeof process !== "undefined" && process.env?.ARISE_API_SECRET
    ? process.env.ARISE_API_SECRET
    : "";

function getSessionToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("arise_session_token");
}

export function setSessionToken(token: string): void {
  localStorage.setItem("arise_session_token", token);
}

export function clearSessionToken(): void {
  localStorage.removeItem("arise_session_token");
}

/** Build headers for a request.
 *  - server-to-server secret only included when running server-side (never in browser)
 *  - JWT session token included when available (browser auth)
 */
function buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  // Server-side: add API secret
  if (API_SECRET) headers["x-arise-secret"] = API_SECRET;

  // Client-side: add session JWT
  const token = getSessionToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
}

export type ApiResponse<T = unknown> =
  | { data: T; error: null }
  | { data: null; error: { message: string; status?: number } };

async function readJson<T>(res: Response): Promise<T | Record<string, never>> {
  const text = await res.text();
  if (!text) return {};
  return JSON.parse(text) as T;
}

function apiError(json: unknown, status: number) {
  const message =
    json && typeof json === "object" && "error" in json && typeof json.error === "string"
      ? json.error
      : "Request failed";
  return { data: null, error: { message, status } } as const;
}

export async function apiGet<T = unknown>(
  path: string,
  params?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    let url = `${API_URL}${path}`;
    if (params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) qs.set(k, v);
      }
      const qsStr = qs.toString();
      if (qsStr) url += `?${qsStr}`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
    });
    const json = await readJson<T>(res);
    if (!res.ok) return apiError(json, res.status);
    return { data: json as T, error: null };
  } catch (err: unknown) {
    return { data: null, error: { message: err instanceof Error ? err.message : "Network error" } };
  }
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body ?? {}),
    });
    const json = await readJson<T>(res);
    if (!res.ok) return apiError(json, res.status);
    return { data: json as T, error: null };
  } catch (err: unknown) {
    return { data: null, error: { message: err instanceof Error ? err.message : "Network error" } };
  }
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify(body ?? {}),
    });
    const json = await readJson<T>(res);
    if (!res.ok) return apiError(json, res.status);
    return { data: json as T, error: null };
  } catch (err: unknown) {
    return { data: null, error: { message: err instanceof Error ? err.message : "Network error" } };
  }
}

export async function apiPut<T = unknown>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(body ?? {}),
    });
    const json = await readJson<T>(res);
    if (!res.ok) return apiError(json, res.status);
    return { data: json as T, error: null };
  } catch (err: unknown) {
    return { data: null, error: { message: err instanceof Error ? err.message : "Network error" } };
  }
}

export async function apiDelete<T = unknown>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: buildHeaders(),
    });
    const json = await readJson<T>(res);
    if (!res.ok) return apiError(json, res.status);
    return { data: json as T, error: null };
  } catch (err: unknown) {
    return { data: null, error: { message: err instanceof Error ? err.message : "Network error" } };
  }
}
