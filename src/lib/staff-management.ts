// staff-management.ts
// Staff creation and password reset are now handled through the Hostinger API.
// These server functions forward to /api/staff endpoints.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const staffPayload = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(128),
  role: z.enum(["staff", "admin"]).default("staff"),
  permissions: z.array(z.string().trim().min(1)).default([]),
});

const resetPayload = z.object({
  user_id: z.string().uuid(),
  password: z.string().min(8).max(128),
});

export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => staffPayload.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as { isAdmin: boolean; token: string };
    if (!ctx.isAdmin) throw new Error("Super Admin access required");

    const apiUrl = process.env.HOSTINGER_API_URL ?? "";
    const apiSecret = process.env.ARISE_API_SECRET ?? "";

    const res = await fetch(`${apiUrl}/api/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-arise-secret": apiSecret,
        Authorization: `Bearer ${ctx.token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json() as { id?: string; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Could not create staff account");
    return { id: json.id };
  });

export const resetStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => resetPayload.parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as { isAdmin: boolean; token: string };
    if (!ctx.isAdmin) throw new Error("Super Admin access required");

    const apiUrl = process.env.HOSTINGER_API_URL ?? "";
    const apiSecret = process.env.ARISE_API_SECRET ?? "";

    const res = await fetch(`${apiUrl}/api/staff/${data.user_id}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-arise-secret": apiSecret,
        Authorization: `Bearer ${ctx.token}`,
      },
      body: JSON.stringify({ password: data.password }),
    });

    const json = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) throw new Error(json.error ?? "Could not reset password");
    return { ok: true };
  });
