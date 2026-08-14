import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { repairStatusLabels } from "@/lib/site-data";
import { Wrench, MessageSquare, Clock, CheckCircle2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Page,
});

function Page() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [repairs, enquiries] = await Promise.all([
        supabase
          .from("repair_requests")
          .select("id,status,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("enquiries").select("id,is_read"),
      ]);
      const rows = repairs.data ?? [];
      const byStatus: Record<string, number> = {};
      rows.forEach((r: any) => {
        byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      });
      return {
        totalRepairs: rows.length,
        newRepairs: byStatus.request_received ?? 0,
        inProgress: (byStatus.repair_in_progress ?? 0) + (byStatus.under_inspection ?? 0),
        completed: byStatus.completed ?? 0,
        byStatus,
        totalEnquiries: enquiries.data?.length ?? 0,
        unreadEnquiries: enquiries.data?.filter((e: any) => !e.is_read).length ?? 0,
        recent: rows.slice(0, 8),
      };
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Overview of repair requests, enquiries and activity.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Wrench} label="Total repair requests" value={stats?.totalRepairs ?? "—"} />
        <Stat icon={Clock} label="In progress" value={stats?.inProgress ?? "—"} />
        <Stat icon={CheckCircle2} label="Completed" value={stats?.completed ?? "—"} />
        <Stat
          icon={MessageSquare}
          label="Enquiries"
          value={stats?.totalEnquiries ?? "—"}
          sub={stats ? `${stats.unreadEnquiries} unread` : ""}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy">Recent repair requests</h2>
            <Link
              to="/admin/repairs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              View all <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats?.recent.length === 0 && (
              <div className="py-6 text-sm text-muted-foreground">No requests yet.</div>
            )}
            {stats?.recent.map((r: any) => (
              <Link
                key={r.id}
                to="/admin/repairs"
                className="flex items-center justify-between py-3 text-sm hover:bg-surface"
              >
                <span className="font-mono text-xs text-navy">{r.id.slice(0, 8)}…</span>
                <span className="text-xs">{repairStatusLabels[r.status]}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-navy">Status breakdown</h2>
          <div className="mt-3 space-y-2">
            {Object.entries(repairStatusLabels).map(([k, label]) => {
              const n = stats?.byStatus[k] ?? 0;
              const total = stats?.totalRepairs || 1;
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
