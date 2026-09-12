// auth-security.ts
// Login audit and login alerts are now handled server-side in the Hostinger API
// (hostinger-api/routes/auth.routes.js). This file provides no-op stubs so any
// remaining import references compile without error.
// These functions are intentionally empty — the API bridge handles the logic.

export const recordAdminAuthFailure = async (_data: {
  email?: string;
  event_type: "password_login" | "mfa_verify" | "mfa_enroll";
}) => {
  // Handled by hostinger-api /api/auth/login (failure path)
  return { ok: true };
};

export const recordAdminLoginSuccess = async () => {
  // Handled by hostinger-api /api/auth/login (success path)
  return { ok: true, emailSent: false };
};
