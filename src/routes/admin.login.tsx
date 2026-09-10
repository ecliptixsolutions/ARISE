/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { signIn, requestPasswordReset, resetPassword } from "@/integrations/mysql/auth";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) =>
    z
      .object({
        denied: z.string().optional(),
        reset_token: z.string().optional(),
      })
      .parse(s),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/admin/login" });
  const [mode, setMode] = useState<"login" | "forgot" | "reset">(
    search.reset_token ? "reset" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const deniedMsg =
    search.denied === "1"
      ? "Access denied. You do not have admin or staff access."
      : search.denied === "disabled"
        ? "Your account has been disabled. Contact the Super Admin."
        : null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error("Enter email and password"); return; }
    setLoading(true);
    const { user, error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    if (!user) { toast.error("Login failed"); return; }
    toast.success(`Welcome, ${user.fullName ?? user.email}`);
    void navigate({ to: "/admin" });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }
    setLoading(true);
    const { error } = await requestPasswordReset(email.trim());
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("If that account exists, a reset link has been sent.");
    setMode("login");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (!search.reset_token) { toast.error("Invalid reset link"); return; }
    setLoading(true);
    const { error } = await resetPassword(search.reset_token, newPassword);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Password updated. Please log in.");
    void navigate({ to: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          {deniedMsg && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {deniedMsg}
            </div>
          )}

          {mode === "login" && (
            <>
              <h1 className="font-display text-xl font-bold text-navy">Admin Login</h1>
              <p className="mt-1 text-sm text-muted-foreground">Arise Healthcare Solutions</p>
              <form onSubmit={handleLogin} className="mt-6 grid gap-4">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-navy">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-navy">Password</span>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-10 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <button
                  disabled={loading}
                  className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
              <button
                onClick={() => setMode("forgot")}
                className="mt-4 w-full text-center text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h1 className="font-display text-xl font-bold text-navy">Reset Password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your admin email and we'll send a reset link.
              </p>
              <form onSubmit={handleForgot} className="mt-6 grid gap-4">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-navy">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </label>
                <button
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
              <button
                onClick={() => setMode("login")}
                className="mt-4 w-full text-center text-sm text-primary hover:underline"
              >
                Back to login
              </button>
            </>
          )}

          {mode === "reset" && (
            <>
              <h1 className="font-display text-xl font-bold text-navy">Set New Password</h1>
              <form onSubmit={handleReset} className="mt-6 grid gap-4">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-navy">New password (min 8 characters)</span>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-10 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <button
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
