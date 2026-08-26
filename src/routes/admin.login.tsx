/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { PasswordField } from "@/components/ui/PasswordField";
import { recordAdminAuthFailure, recordAdminLoginSuccess } from "@/lib/auth-security";

export const Route = createFileRoute("/admin/login")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ denied: z.string().optional(), mfa: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Admin Login - Arise Healthcare Solutions" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

type Mode = "login" | "recovery" | "enroll" | "verify";

declare global {
  interface Window {
    turnstile?: { getResponse?: () => string; reset?: () => void };
  }
}

function Page() {
  const nav = useNavigate();
  const search = useSearch({ from: "/admin/login" });
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [factorId, setFactorId] = useState("");
  const [enrollment, setEnrollment] = useState<{
    factorId: string;
    qrCode?: string;
    secret?: string;
  }>();
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    const isRecovery =
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery");
    if (isRecovery) {
      setMode("recovery");
      return;
    }
    if (search.denied === "disabled") {
      toast.error("Your account has been disabled. Please contact the administrator.");
    } else if (search.denied) {
      toast.error("Admin access is restricted to authorised users.");
    } else if (search.mfa) {
      toast.error("MFA verification is required for admin access.");
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void routeAfterMfa(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.denied, search.mfa]);

  useEffect(() => {
    if (!turnstileSiteKey || document.getElementById("turnstile-script")) return;
    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  function captchaToken() {
    return typeof window !== "undefined" ? window.turnstile?.getResponse?.() : undefined;
  }

  async function ensureAdminOrStaff() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;
    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "staff" }),
    ]);
    if (!isAdmin && !isStaff) {
      await supabase.auth.signOut();
      toast.error("Admin access is restricted to authorised users.");
      return false;
    }
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("is_active")
      .eq("id", data.user.id)
      .maybeSingle();
    if (isStaff && profile?.is_active === false) {
      await supabase.auth.signOut();
      toast.error("Your account has been disabled. Please contact the administrator.");
      return false;
    }
    return true;
  }

  async function routeAfterMfa(sendAlert: boolean) {
    if (!(await ensureAdminOrStaff())) return;

    const { data: aal } = await (supabase.auth.mfa as any).getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") {
      if (sendAlert) {
        try {
          await recordAdminLoginSuccess();
        } catch (error) {
          console.error("[Auth alert]", error);
        }
      }
      nav({ to: "/admin" });
      return;
    }

    const { data: factors, error } = await (supabase.auth.mfa as any).listFactors();
    if (error) {
      toast.error(error.message || "Could not check MFA status.");
      return;
    }
    const verified = factors?.totp?.find((factor: any) => factor.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setMode("verify");
    } else {
      setMode("enroll");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      toast.error("Enter email and password.");
      return;
    }
    setBusy(true);
    const token = captchaToken();
    const payload: any = { email, password };
    if (token) payload.options = { captchaToken: token };
    const { error } = await supabase.auth.signInWithPassword(payload);
    setBusy(false);
    if (error) {
      void recordAdminAuthFailure({ data: { email, event_type: "password_login" } });
      window.turnstile?.reset?.();
      toast.error("Invalid email or password.");
      return;
    }
    void routeAfterMfa(true);
  }

  async function startEnrollment() {
    setBusy(true);
    const { data, error } = await (supabase.auth.mfa as any).enroll({
      factorType: "totp",
      friendlyName: "Arise Admin",
    });
    setBusy(false);
    if (error || !data?.id) {
      void recordAdminAuthFailure({ data: { event_type: "mfa_enroll" } });
      toast.error(error?.message || "Could not start MFA setup.");
      return;
    }
    setFactorId(data.id);
    setEnrollment({
      factorId: data.id,
      qrCode: data.totp?.qr_code,
      secret: data.totp?.secret,
    });
  }

  async function verifyMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "").replace(/\s/g, "");
    const currentFactorId = enrollment?.factorId || factorId;
    if (!currentFactorId || !/^\d{6}$/.test(code)) {
      toast.error("Enter the 6 digit authenticator code.");
      return;
    }
    setBusy(true);
    const challenge = await (supabase.auth.mfa as any).challenge({ factorId: currentFactorId });
    const challengeId = challenge.data?.id || challenge.data?.challengeId;
    const verified = challengeId
      ? await (supabase.auth.mfa as any).verify({ factorId: currentFactorId, challengeId, code })
      : { error: challenge.error || new Error("Could not start MFA challenge.") };
    setBusy(false);

    if (verified.error) {
      void recordAdminAuthFailure({ data: { event_type: "mfa_verify" } });
      toast.error(verified.error.message || "Invalid MFA code.");
      return;
    }
    toast.success("MFA verified.");
    await routeAfterMfa(true);
  }

  async function resetPassword() {
    const email = prompt("Enter your registered email:");
    if (!email) return;
    const token = captchaToken();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/login`,
      ...(token ? { captchaToken: token } : {}),
    });
    window.turnstile?.reset?.();
    if (error) toast.error("Unable to send reset email. Please try again.");
    else toast.success("If the account exists, a password reset email has been sent.");
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirm_password") ?? "");
    if (password.length < 8 || password !== confirmPassword) {
      toast.error("Enter matching passwords with at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Could not update password. Please request a new reset link.");
      return;
    }
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    setMode("login");
    window.history.replaceState(null, "", "/admin/login");
  }

  function qrSrc(qrCode?: string) {
    if (!qrCode) return "";
    return qrCode.startsWith("data:")
      ? qrCode
      : `data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`;
  }

  return (
    <main className="grid min-h-screen bg-surface px-4 py-10 md:place-items-center">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Logo size={44} />
          <div>
            <h1 className="font-display text-xl font-bold text-navy">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Arise Healthcare Solutions</p>
          </div>
        </div>
        {mode === "recovery" ? (
          <form onSubmit={updatePassword} className="grid gap-4">
            <PasswordField name="password" label="New password" autoComplete="new-password" />
            <PasswordField
              name="confirm_password"
              label="Confirm password"
              autoComplete="new-password"
            />
            <button
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              <LockKeyhole className="h-4 w-4" />
              {busy ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : mode === "enroll" ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
              MFA is required before admin access. Set up an authenticator app, then enter the 6
              digit code.
            </div>
            {!enrollment ? (
              <button
                type="button"
                onClick={startEnrollment}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
              >
                <LockKeyhole className="h-4 w-4" />
                {busy ? "Preparing..." : "Set up MFA"}
              </button>
            ) : (
              <>
                {enrollment.qrCode && (
                  <img
                    src={qrSrc(enrollment.qrCode)}
                    alt="Authenticator QR code"
                    className="mx-auto h-44 w-44 rounded-lg border border-border bg-white p-2"
                  />
                )}
                {enrollment.secret && (
                  <p className="break-all rounded-lg bg-surface p-3 text-xs text-muted-foreground">
                    Secret: {enrollment.secret}
                  </p>
                )}
                <MfaCodeForm busy={busy} label="Verify MFA" onSubmit={verifyMfa} />
              </>
            )}
          </div>
        ) : mode === "verify" ? (
          <div className="grid gap-4">
            <p className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
              Enter the 6 digit code from your authenticator app.
            </p>
            <MfaCodeForm busy={busy} label="Continue" onSubmit={verifyMfa} />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-navy">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>
            <PasswordField name="password" label="Password" autoComplete="current-password" />
            {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />}
            <button
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              <LockKeyhole className="h-4 w-4" />
              {busy ? "Please wait..." : "Login"}
            </button>
          </form>
        )}
        <div className="mt-5 flex justify-between text-sm font-medium">
          <button type="button" onClick={resetPassword} className="text-primary">
            Forgot password?
          </button>
          <Link to="/" className="text-primary">
            Back to website
          </Link>
        </div>
      </section>
      <Toaster position="top-right" richColors />
    </main>
  );
}

function MfaCodeForm({
  busy,
  label,
  onSubmit,
}: {
  busy: boolean;
  label: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-navy">Authenticator code</span>
        <input
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={6}
          required
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </label>
      <button
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
      >
        <LockKeyhole className="h-4 w-4" />
        {busy ? "Verifying..." : label}
      </button>
    </form>
  );
}
