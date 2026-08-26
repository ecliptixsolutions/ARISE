/* eslint-disable @typescript-eslint/no-explicit-any */
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

async function requireAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Super Admin access required");
}

export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => staffPayload.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin((context as any).supabase, (context as any).userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;

    const created = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (created.error || !created.data.user)
      throw new Error(created.error?.message ?? "Could not create staff");

    const user = created.data.user;
    const permissions = data.role === "admin" ? [] : [...new Set(data.permissions)];
    const rows = permissions.map((permission) => ({
      user_id: user.id,
      permission,
      granted_by: (context as any).userId,
    }));

    const [{ error: profileError }, { error: roleError }, { error: permissionError }] =
      await Promise.all([
        admin.from("profiles").upsert({
          id: user.id,
          email: data.email,
          full_name: data.full_name,
          is_active: true,
        } as any),
        admin.from("user_roles").upsert({ user_id: user.id, role: data.role } as any),
        rows.length
          ? admin.from("staff_permissions").upsert(rows as any)
          : Promise.resolve({ error: null }),
      ]);

    const error = profileError || roleError || permissionError;
    if (error) throw new Error(error.message);
    return { id: user.id };
  });

export const resetStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => resetPayload.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin((context as any).supabase, (context as any).userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).auth.admin.updateUserById(data.user_id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
