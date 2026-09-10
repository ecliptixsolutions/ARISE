/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Image, Server, Wrench, MessageSquare, Clock, CheckCircle2, ExternalLink, ShoppingCart } from "lucide-react";
import { apiGet } from "@/integrations/mysql/client";
import { repairStatusLabels } from "@/lib/site-data";
import { hasPermission } from "@/lib/admin-access";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Page });

function Page() {
  const auth = useRouteContext({ from: "/_authenticated" });
  const { data: stats } = useQuery({
    queryKey: ["admin-stats", auth.isAdmin ? "admin" : "staff"],
    queryFn: async () => {
      const { data, error } = await apiGet<any>("/api/dashboard/stats");
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: hasPermission(auth, "dashboard"),
    refetchInterval: 60_000,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of repair requests, enquiries and activity.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Wrench} label="Total repair requests" value={stats?.repairs?.total ?? "—"} />
        <Stat icon={Clock} label="In progress" value={stats?.repairs?.inProgress ?? "—"} />
        <Stat icon={CheckCircle2} label="Completed" value={stats?.repairs?.completed ?? "—"} />
        <Stat icon={MessageSquare} label="Enquiries" value={stats?.enquiries?.total ?? "—"} sub={stats ? `${stats.enquiries?.unread ?? 0} unread` : ""} />
        <Stat icon={Server} label="Active services" value={stats?.services?.active ?? "—"} />
        <Stat icon={Image} label="Uploaded images" value={stats?.images?.total ?? "—"} />
        <Stat icon={Bell} label="Unread notifications" value={stats?.notifications?.unread ?? "—"} />
        <Stat icon={ShoppingCart} label="Total orders" value={stats?.orders?.total ?? "—"} sub={stats ? `${stats.orders?.pending ?? 0} pending` : ""} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy">Recent repair requests</h2>
            <Link to="/admin/repair-requests" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              View all <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {!stats?.recent?.length && <div className="py-6 text-sm text-muted-foreground">No requests yet.</div>}
            {stats?.recent?.map((r: any) => (
              <Link key={r.id} to="/admin/repair-requests" className="flex items-center justify-between py-3 text-sm hover:bg-surface">
                <span className="font-mono text-xs text-navy">{r.request_code ?? r.id?.slice(0, 8) + "…"}</span>
                <span className="text-xs">{repairStatusLabels[r.status as keyof typeof repairStatusLabels] ?? r.status}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-navy">Status breakdown</h2>
          <div className="mt-3 space-y-2">
            {Object.entries(repairStatusLabels).map(([k, label]) => {
              const n = stats?.byStatus?.[k] ?? 0;
              const total = stats?.repairs?.total || 1;
              const pct = Math.round((n / total) * 100);
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-xs">
                    <span>{label}</span>
                    <span className="text-muted-foreground">{n}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="rounded-3xl border border-gold-border/60 bg-gold-soft p-5 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-primary shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-3xl font-bold text-navy">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="mt-1 text-xs text-primary">{sub}</div>}
    </div>
  );
}
