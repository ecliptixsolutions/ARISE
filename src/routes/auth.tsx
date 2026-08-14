import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Arise Healthcare Solutions" },
      { name: "description", content: "Sign in to the Arise Healthcare Solutions admin panel." },
      { property: "og:title", content: "Admin Sign In" },
      { property: "og:description", content: "Admin login." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const full_name = String(fd.get("full_name") ?? "").trim();
    if (!email || !password) {
      toast.error("Email & password required");
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name }, emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created. You may need to verify your email.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      nav({ to: "/admin" });
    }
  }

  async function resetPw() {
    const email = prompt("Enter your email:");
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset email sent");
  }

  return (
    <Layout>
      <PageHero
        eyebrow="Admin"
        title="Sign in to the Admin Panel"
        subtitle="Access is restricted to authorised Arise team members."
      />
      <section className="container-x mx-auto max-w-md py-14">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-surface transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
        <div className="rounded-3xl blue-panel p-6">
          <div className="mb-4 flex rounded-lg bg-surface p-1 text-sm">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-md py-2 font-medium ${mode === "signin" ? "bg-card shadow-sm text-navy" : "text-muted-foreground"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-md py-2 font-medium ${mode === "signup" ? "bg-card shadow-sm text-navy" : "text-muted-foreground"}`}
            >
              Create account
            </button>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4">
            {mode === "signup" && (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Full name</span>
                <input
                  name="full_name"
                  className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
                />
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Password</span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
              />
            </label>
            <button
              disabled={busy}
              className="rounded-2xl btn-primary py-2.5 text-sm font-semibold disabled:opacity-70"
            >
              {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <button onClick={resetPw} className="hover:text-primary">
              Forgot password?
            </button>
            <Link to="/" className="hover:text-primary">
              Back to site
            </Link>
          </div>
          <p className="mt-4 rounded-lg bg-surface p-3 text-xs text-muted-foreground">
            After creating the first account, ask a super-admin to grant you an admin role. Roles
            are stored in the <code>user_roles</code> table.
          </p>
        </div>
      </section>
    </Layout>
  );
}
