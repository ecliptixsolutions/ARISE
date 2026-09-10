/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { toast } from "sonner";
import { adminNavItems, canAccessAdminItem } from "@/lib/admin-access";
import { getUser, signOut, hasStoredSession } from "@/integrations/mysql/auth";
import { apiGet, apiPatch } from "@/integrations/mysql/client";
import type { AriseUser } from "@/integrations/mysql/auth";

const POLL_INTERVAL_MS = 8000; // 8-second polling for notifications
const seenToasts = new Set<string>();

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Fast check before network call
    if (!hasStoredSession()) throw redirect({ to: "/admin/login" });

    const user = await getUser();
    if (!user) throw redirect({ to: "/admin/login" });
    if (!["admin", "staff"].includes(user.role)) throw redirect({ to: "/admin/login" });

    return {
      user: { id: user.id, email: user.email } as { id: string; email: string },
      isAdmin: user.isAdmin,
      isStaff: user.isStaff,
      permissions: user.permissions,
    };
  },
  component: Shell,
});

function Shell() {
  const router = useRouter();
  const location = useLocation();
  const qc = useQueryClient();
  const auth = Route.useRouteContext();
  const [unread, setUnread] = useState(0);
  const lastPollRef = useRef<string>(new Date(Date.now() - 30000).toISOString());

  const navItems = useMemo(
    () => adminNavItems.filter(item => canAccessAdminItem(auth, item)),
    [auth],
  );

  // Redirect if current route is not accessible
  useEffect(() => {
    const current = adminNavItems.find(item =>
      item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to),
    );
    if (current && !canAccessAdminItem(auth, current)) {
      void router.navigate({ to: (navItems[0]?.to ?? "/admin") as any });
    }
  }, [auth, location.pathname, navItems, router]);

  // Load initial unread count
  useEffect(() => {
    apiGet<{ count: number }>("/api/notifications/unread-count")
      .then(({ data }) => { if (data) setUnread(data.count); })
      .catch(() => {});
  }, []);

  // Polling — replaces Supabase realtime for notifications
  useEffect(() => {
    const interval = setInterval(async () => {
      const since = lastPollRef.current;
      const { data } = await apiGet<{
        changes: Array<{ id: number; table_name: string; row_id: string; operation: string; created_at: string }>;
        serverTime: string;
      }>("/api/poll", {
        since,
        tables: "notifications,repair_requests,enquiries,office_availability",
      });

      if (!data?.changes?.length) return;

      lastPollRef.current = data.serverTime ?? new Date().toISOString();

      const tables = new Set(data.changes.map(c => c.table_name));

      // Invalidate affected queries
      if (tables.has("notifications")) {
        void qc.invalidateQueries({ queryKey: ["admin-notifications"] });
        void qc.invalidateQueries({ queryKey: ["admin-stats"] });

        // Show toasts for new notification inserts
        const inserts = data.changes.filter(
          c => c.table_name === "notifications" && c.operation === "INSERT",
        );
        for (const change of inserts) {
          if (seenToasts.has(change.row_id)) continue;
          seenToasts.add(change.row_id);

          // Fetch the notification details
          const { data: notifs } = await apiGet<any[]>("/api/notifications");
          const notif = notifs?.find((n: any) => n.id === change.row_id);
          if (notif) {
            toast.info(
              notif.related_table === "repair_requests"
                ? "New Repair Request Received"
                : notif.related_table === "enquiries"
                  ? "New Enquiry Received"
                  : notif.title,
              { description: notif.message, duration: 5000 },
            );
          }
        }

        // Refresh unread count
        const { data: countData } = await apiGet<{ count: number }>(
          "/api/notifications/unread-count",
        );
        if (countData) setUnread(countData.count);
      }

      if (tables.has("repair_requests")) {
        void qc.invalidateQueries({ queryKey: ["admin-repairs"] });
        void qc.invalidateQueries({ queryKey: ["admin-tracking"] });
        void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      }
      if (tables.has("enquiries")) {
        void qc.invalidateQueries({ queryKey: ["admin-enquiries"] });
        void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      }
      if (tables.has("office_availability")) {
        void qc.invalidateQueries({ queryKey: ["office-availability"] });
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [qc]);

  async function handleLogout() {
    await signOut();
    void router.navigate({ to: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border px-5 py-4">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map(item => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as any}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-surface"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.to === "/admin/notifications" && unread > 0 && (
                      <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <Logo />
          <button onClick={handleLogout} aria-label="Sign out">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
