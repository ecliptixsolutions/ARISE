import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Wrench, MessageSquare, Star, Server, LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Toaster } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

function Shell() {
  const router = useRouter();
  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  }
  return (
    <div className="admin-shell flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-surface lg:block">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Logo size={40} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-navy">Arise Admin</div>
            <div className="truncate text-xs text-muted-foreground">Healthcare Solutions</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3 text-sm">
          {[
            { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
            { to: "/admin/services", icon: Server, label: "Services" },
            { to: "/admin/repairs", icon: Wrench, label: "Repair Requests" },
            { to: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
            { to: "/admin/testimonials", icon: Star, label: "Testimonials" },
          ].map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-primary text-white shadow-sm" }}
              activeOptions={{ exact }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-foreground hover:bg-white hover:text-primary"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-gold-soft"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <Link
            to="/"
            className="mt-2 block rounded-md py-2 text-center text-xs text-muted-foreground hover:text-primary"
          >
            View website →
          </Link>
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 shadow-sm lg:hidden">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-semibold text-navy">Admin</span>
          </div>
          <button onClick={signOut} className="rounded-md border border-border px-3 py-1.5 text-xs">
            Sign out
          </button>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
