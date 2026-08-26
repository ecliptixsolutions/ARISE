import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { PasswordField } from "@/components/ui/PasswordField";

export const Route = createFileRoute("/admin/login")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ denied: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Admin Login - Arise Healthcare Solutions" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

declare global {
  interface Window {
    turnstile?: { getResponse?: () => string; reset?: () => void };
  }
}

function Page() {
  const nav = useNavigate();
  const search = useSearch({ from: "/admin/login" });
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    const isRecovery =
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery");
    setRecovery(isRecovery);
    if (search.denied === "disabled") {
      toast.error("Your account has been disabled. Please contact the administrator.");
    } else if (search.denied) {
      toast.error("Admin access is restricted to authorised users.");
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !isRecovery) nav({ to: "/admin" });
    });
  }, [nav, search.denied]);

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
    const payload: Parameters<typeof supabase.auth.signInWithPassword>[0] = { email, password };
    if (token) payload.options = { captchaToken: token };
    const { error } = await supabase.auth.signInWithPassword(payload);
    setBusy(false);
    if (error) {
      window.turnstile?.reset?.();
      toast.error("Invalid email or password.");
      return;
    }
    nav({ to: "/admin" });
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
    setRecovery(false);
    window.history.replaceState(null, "", "/admin/login");
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
        {recovery ? (
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
