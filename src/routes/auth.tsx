import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { signIn, requestPasswordReset, hasStoredSession } from "@/integrations/mysql/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PasswordField } from "@/components/ui/PasswordField";

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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hasStoredSession()) nav({ to: "/admin" });
  }, [nav]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      toast.error("Email & password required");
      return;
    }
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      toast.error("Invalid email or password.");
      return;
    }
    nav({ to: "/admin" });
  }

  async function resetPw() {
    const email = prompt("Enter your email:");
    if (!email) return;
    const { error } = await requestPasswordReset(email);
    if (error) toast.error("Unable to send reset email. Please try again.");
    else toast.success("If the account exists, a password reset email has been sent.");
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
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm"
              />
            </label>
            <PasswordField name="password" label="Password" autoComplete="current-password" />
            <button
              disabled={busy}
              className="rounded-2xl btn-primary py-2.5 text-sm font-semibold disabled:opacity-70"
            >
              {busy ? "Please wait..." : "Sign in"}
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
        </div>
      </section>
    </Layout>
  );
}
