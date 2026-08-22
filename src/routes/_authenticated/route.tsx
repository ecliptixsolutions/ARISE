import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Server,
  Settings,
  Star,
  Truck,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { toast } from "sonner";

const seenNotificationToasts = new Set<string>();

function rememberNotificationToast(id: string) {
  if (seenNotificationToasts.has(id)) return false;
  seenNotificationToasts.add(id);
  if (seenNotificationToasts.size > 200) {
    seenNotificationToasts.delete(seenNotificationToasts.values().next().value);
  }
  return true;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "staff" }),
    ]);
    const allowed = Boolean(isAdmin || isStaff);
    if (!allowed) {
      await supabase.auth.signOut();
      throw redirect({ to: "/admin/login", search: { denied: "1" } });
    }
    return { user: data.user };
  },
  component: Shell,
});

function Shell() {
  const router = useRouter();
  const qc = useQueryClient();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    async function loadUnread() {
      const { data } = await (supabase as any).from("notifications").select("id").eq("is_read", false);
      setUnread(data?.length ?? 0);
    }
    void loadUnread();
    function openNotification(notification: any) {
      const to =
        notification.related_table === "repair_requests"
          ? "/admin/repair-requests"
          : notification.related_table === "enquiries"
            ? "/admin/enquiries"
            : "/admin/notifications";
      router.navigate({ to: to as any });
    }
    const channel = supabase
      .channel("admin-shell-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        void loadUnread();
        qc.invalidateQueries({ queryKey: ["admin-notifications"] });

        if (payload.eventType !== "INSERT") return;
        const notification = payload.new as any;
        if (!notification?.id || !rememberNotificationToast(notification.id)) return;

        const message =
          notification.related_table === "repair_requests"
            ? "New Repair Request Received"
            : notification.related_table === "enquiries"
              ? "New Enquiry Received"
              : notification.title || "New notification";

        toast.info(message, {
          description: notification.message,
          duration: 5000,
          action: {
            label: "Open",
            onClick: () => openNotification(notification),
          },
        });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void loadUnread();
          qc.invalidateQueries({ queryKey: ["admin-notifications"] });
        }
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, router]);
  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/admin/login" });
  }
  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/admin/tracking", icon: Truck, label: "Tracking" },
    { to: "/admin/services", icon: Server, label: "Services" },
    { to: "/admin/repair-requests", icon: Wrench, label: "Repair Requests" },
    { to: "/admin/orders", icon: Bell, label: "Orders" },
    { to: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
    { to: "/admin/images", icon: Image, label: "Images" },
    { to: "/admin/notifications", icon: Bell, label: "Notifications" },
    { to: "/admin/testimonials", icon: Star, label: "Testimonials" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];
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
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to as any}
              activeProps={{ className: "bg-primary text-white shadow-sm" }}
              activeOptions={{ exact }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-foreground hover:bg-white hover:text-primary"
            >
              <Icon className="h-4 w-4" /> {label}
              {to === "/admin/notifications" && unread > 0 && (
                <span className="ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">
                  {unread}
                </span>
              )}
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
    </div>
  );
}
