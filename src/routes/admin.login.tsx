import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

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

function Page() {
  const nav = useNavigate();
  const search = useSearch({ from: "/admin/login" });
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (search.denied) toast.error("Admin access is restricted to authorised users.");
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav, search.denied]);

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Invalid admin credentials.");
      return;
    }
    nav({ to: "/admin" });
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
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-navy">Password</span>
            <span className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={8}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-11 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-surface"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>
          <button
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            <LockKeyhole className="h-4 w-4" />
            {busy ? "Please wait..." : "Login"}
          </button>
        </form>
        <Link to="/" className="mt-5 block text-center text-sm font-medium text-primary">
          Back to website
        </Link>
      </section>
      <Toaster position="top-right" richColors />
    </main>
  );
}
