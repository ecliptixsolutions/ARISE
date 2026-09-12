// auth-middleware.ts — server-side request authentication
// Replaces Supabase JWT validation with a call to the Hostinger API /auth/me endpoint.
// Used by TanStack Start server functions that need to know the current user.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export type AuthContext = {
  userId: string;
  email: string;
  fullName: string | null;
  role: "admin" | "staff";
  isAdmin: boolean;
  isStaff: boolean;
  permissions: string[];
  token: string;
};

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) throw new Error("Unauthorized: No token");

    const apiUrl = process.env.HOSTINGER_API_URL ?? "";
    const apiSecret = process.env.ARISE_API_SECRET ?? "";

    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-arise-secret": apiSecret,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Unauthorized: Invalid session");

    const user = (await res.json()) as {
      id: string;
      email: string;
      fullName: string;
      role: "admin" | "staff";
      isAdmin: boolean;
      isStaff: boolean;
      permissions: string[];
    };

    return next({
      context: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName ?? null,
        role: user.role,
        isAdmin: user.isAdmin,
        isStaff: user.isStaff,
        permissions: user.permissions ?? [],
        token,
      } satisfies AuthContext,
    });
  },
);
