// auth-attacher.ts — replaces Supabase session injection
// Reads the JWT from localStorage and injects it as Authorization header
// into TanStack Start server function calls.
import { createMiddleware } from "@tanstack/react-start";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("arise_session_token")
        : null;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
