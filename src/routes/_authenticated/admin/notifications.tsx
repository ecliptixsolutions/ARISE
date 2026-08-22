import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () =>
      ((await (supabase as any)
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })).data ?? []) as any[],
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-notifications"] });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          qc.invalidateQueries({ queryKey: ["admin-notifications"] });
        }
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  function openNotification(n: any) {
    if (n.related_table === "repair_requests") router.navigate({ to: "/admin/repair-requests" });
    else if (n.related_table === "enquiries") router.navigate({ to: "/admin/enquiries" });
  }

  async function markAllRead() {
    const { error } = await (supabase as any).from("notifications").update({ is_read: true }).eq("is_read", false);
    if (error) toast.error("Could not mark notifications read");
    else qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete notification?")) return;
    const { error } = await (supabase as any).from("notifications").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else qc.invalidateQueries({ queryKey: ["admin-notifications"] });
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Notifications</h1>
          <p className="text-sm text-muted-foreground">{data.filter((n) => !n.is_read).length} unread</p>
        </div>
        <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-surface">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {data.map((n) => (
          <article
            key={n.id}
            onClick={() => openNotification(n)}
            className={`rounded-2xl border p-5 ${n.related_table === "repair_requests" || n.related_table === "enquiries" ? "cursor-pointer" : ""} ${n.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-navy">{n.title}</h2>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <div className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <button onClick={(event) => { event.stopPropagation(); void remove(n.id); }} className="grid h-8 w-8 place-items-center rounded-md text-red-600 hover:bg-red-50" aria-label="Delete notification">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
        {data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
