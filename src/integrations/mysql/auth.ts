// src/integrations/mysql/auth.ts
// Custom auth — replaces all supabase.auth.* calls
import { setSessionToken, clearSessionToken } from "./client";

const DIRECT_API_URL = "https://arise-api-bqvq.onrender.com";

export type AriseUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: "admin" | "staff";
  isAdmin: boolean;
  isStaff: boolean;
  permissions: string[];
};

export type SignInResult =
  | { user: AriseUser; token: string; error: null }
  | { user: null; token: null; error: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await directLogin(email, password);
  if (error) return { user: null, token: null, error: error.message };
  setSessionToken(data.token);
  return { user: data.user, token: data.token, error: null };
}

async function directLogin(email: string, password: string) {
  return directAuthRequest<{ token: string; user: AriseUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function directAuthRequest<T>(path: string, init: RequestInit = {}) {
  try {
    const token = typeof localStorage === "undefined" ? null : localStorage.getItem("arise_session_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${DIRECT_API_URL}${path}`, {
      ...init,
      headers,
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: { message: json.error ?? "Request failed", status: res.status } } as const;
    return { data: json as T, error: null } as const;
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : "Network error" } } as const;
  }
}

export async function signOut(): Promise<void> {
  await directAuthRequest("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => {});
  clearSessionToken();
}

export async function getUser(): Promise<AriseUser | null> {
  const { data, error } = await directAuthRequest<AriseUser>("/api/auth/me");
  if (error) return null;
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  const { error } = await directAuthRequest("/api/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return { error: error?.message ?? null };
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ error: string | null }> {
  const { error } = await directAuthRequest("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  return { error: error?.message ?? null };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ error: string | null }> {
  const { error } = await directAuthRequest("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return { error: error?.message ?? null };
}

/** Check if a JWT token is present in localStorage (fast, no network) */
export function hasStoredSession(): boolean {
  if (typeof localStorage === "undefined") return false;
  return Boolean(localStorage.getItem("arise_session_token"));
}
