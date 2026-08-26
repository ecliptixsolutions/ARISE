/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const failurePayload = z.object({
  email: z.string().trim().email().max(200).optional(),
  event_type: z.enum(["password_login", "mfa_verify", "mfa_enroll"]),
});

function requestMeta() {
  const request = getRequest();
  const headers = request?.headers;
  return {
    userAgent: headers?.get("user-agent")?.slice(0, 500) ?? null,
    ip:
      headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers?.get("cf-connecting-ip") ||
      null,
  };
}

async function insertAudit(row: Record<string, unknown>) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("admin_login_audit").insert(row);
    if (error) console.error("[Auth audit]", error.message);
  } catch (error) {
    console.error("[Auth audit]", error);
  }
}

async function sendLoginAlert(
  email: string,
  name: string,
  role: string,
  userAgent: string | null,
  ip: string | null,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SECURITY_ALERT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("[Auth alert] RESEND_API_KEY and SECURITY_ALERT_FROM_EMAIL are not configured.");
    return false;
  }

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const lines = [
    "Arise Healthcare Solutions admin login alert",
    `Account: ${name} (${role})`,
    `Time: ${timestamp}`,
    userAgent ? `Browser/device: ${userAgent}` : null,
    ip ? `IP: ${ip}` : null,
    "If you did not perform this login, secure your account immediately.",
  ].filter(Boolean);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Arise Healthcare Solutions login alert",
      text: lines.join("\n"),
    }),
  });

  if (!response.ok) {
    console.error("[Auth alert]", await response.text());
    return false;
  }
  return true;
}

export const recordAdminAuthFailure = createServerFn({ method: "POST" })
  .validator((data: unknown) => failurePayload.parse(data))
  .handler(async ({ data }) => {
    const meta = requestMeta();
    await insertAudit({
      email: data.email ?? null,
      event_type: data.event_type,
      success: false,
      user_agent: meta.userAgent,
      ip_address: meta.ip,
    });
    return { ok: true };
  });

export const recordAdminLoginSuccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId;
    const claims = (context as any).claims;
    if (claims?.aal !== "aal2") throw new Error("MFA verification required");

    const [{ data: isAdmin }, { data: isStaff }, { data: profile }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "staff" }),
      supabase.from("profiles").select("email,full_name").eq("id", userId).maybeSingle(),
    ]);
    if (!isAdmin && !isStaff) throw new Error("Admin access required");
    const role = isAdmin ? "admin" : "staff";
    const email = profile?.email || claims.email;
    const name = profile?.full_name || email || "Admin user";
    const meta = requestMeta();

    await insertAudit({
      user_id: userId,
      email: email ?? null,
      role,
      event_type: "login_success",
      success: true,
      user_agent: meta.userAgent,
      ip_address: meta.ip,
    });

    const emailSent = email
      ? await sendLoginAlert(email, name, role, meta.userAgent, meta.ip)
      : false;
    return { ok: true, emailSent };
  });
