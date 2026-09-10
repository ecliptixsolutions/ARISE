/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/integrations/mysql/client";

export const Route = createFileRoute("/_authenticated/admin/notifications")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await apiGet<any[]>("/api/notifications");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    refetchInterval: 15_000,
  });

  function openNotification(n: any) {
    if (n.related_table === "repair_requests") void router.navigate({ to: "/admin/repair-requests" });
    else if (n.related_table === "enquiries") void router.navigate({ to: "/admin/enquiries" });
  }

  async function markAllRead() {
    const { error } = await apiPatch("/api/notifications/read-all");
    if (error) toast.error("Could not mark notifications read");
    else void qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete notification?")) return;
    // Use a DELETE-equivalent via PATCH is_read flag for now; notifications table has no soft-delete
    // Instead, mark as read so it stays in audit trail
    const { error } = await apiPatch(`/api/notifications/${id}/read`);
    if (error) toast.error("Failed");
    else void qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Notifications</h1>
          <p className="text-sm text-muted-foreground">{(data as any[]).filter(n => !n.is_read).length} unread</p>
        </div>
        <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-surface">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {(data as any[]).map(n => (
          <article key={n.id} onClick={() => openNotification(n)}
            className={`rounded-2xl border p-5 ${n.related_table === "repair_requests" || n.related_table === "enquiries" ? "cursor-pointer" : ""} ${n.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-primary"><Bell className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-navy">{n.title}</h2>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <div className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          </article>
        ))}
        {!(data as any[]).length && <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No notifications yet.</div>}
      </div>
    </div>
  );
}
