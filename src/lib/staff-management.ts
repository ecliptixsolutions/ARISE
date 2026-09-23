import { z } from "zod";
import { apiPatch, apiPost } from "@/integrations/mysql/client";

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

export async function createStaffAccount(data: unknown) {
  const payload = staffPayload.parse(data);
  return apiPost<{ id: string }>("/api/staff", payload);
}

export async function resetStaffPassword(data: unknown) {
  const payload = resetPayload.parse(data);
  return apiPatch<{ ok: boolean }>(`/api/staff/${payload.user_id}/password`, {
    password: payload.password,
  });
}
