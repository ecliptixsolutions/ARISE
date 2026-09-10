// src/integrations/mysql/auth.ts
// Custom auth — replaces all supabase.auth.* calls
import { apiPost, apiGet, setSessionToken, clearSessionToken } from "./client";

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
  const { data, error } = await apiPost<{ token: string; user: AriseUser }>("/api/auth/login", {
    email,
    password,
  });
  if (error) return { user: null, token: null, error: error.message };
  setSessionToken(data.token);
  return { user: data.user, token: data.token, error: null };
}

export async function signOut(): Promise<void> {
  await apiPost("/api/auth/logout").catch(() => {});
  clearSessionToken();
}

export async function getUser(): Promise<AriseUser | null> {
  const { data, error } = await apiGet<AriseUser>("/api/auth/me");
  if (error) return null;
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  const { error } = await apiPost("/api/auth/request-password-reset", { email });
  return { error: error?.message ?? null };
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ error: string | null }> {
  const { error } = await apiPost("/api/auth/reset-password", { token, password });
  return { error: error?.message ?? null };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ error: string | null }> {
  const { error } = await apiPost("/api/auth/change-password", { currentPassword, newPassword });
  return { error: error?.message ?? null };
}

/** Check if a JWT token is present in localStorage (fast, no network) */
export function hasStoredSession(): boolean {
  if (typeof localStorage === "undefined") return false;
  return Boolean(localStorage.getItem("arise_session_token"));
}
