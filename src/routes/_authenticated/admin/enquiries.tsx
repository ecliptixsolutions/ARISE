import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: async () => (await supabase.from("enquiries").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  useEffect(() => {
    const channel = supabase
      .channel("admin-enquiries-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "enquiries" }, (payload) => {
        qc.setQueryData(["admin-enquiries"], (current: any[] = []) => {
          if (payload.eventType === "DELETE") {
            return current.filter((row) => row.id !== (payload.old as any).id);
          }

          const next = payload.new as any;
          const rows = current.filter((row) => row.id !== next.id);
          return [next, ...rows].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );
        });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          qc.invalidateQueries({ queryKey: ["admin-enquiries"] });
        }
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
  async function toggleRead(id: string, is_read: boolean) {
    const { error } = await supabase.from("enquiries").update({ is_read: !is_read }).eq("id", id);
    if (error) { toast.error("Failed"); return; }
    qc.invalidateQueries({ queryKey: ["admin-enquiries"] });
  }
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Enquiries</h1>
      <p className="text-sm text-muted-foreground">{data.length} total</p>
      <div className="mt-6 space-y-3">
        {data.map((e: any) => (
          <div key={e.id} className={`rounded-2xl border p-5 ${e.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-navy">{e.name} <span className="text-xs text-muted-foreground">· {e.email}{e.mobile ? " · " + e.mobile : ""}</span></div>
                <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
                {e.subject && <div className="mt-2 text-sm font-medium">{e.subject}</div>}
                <p className="mt-1 text-sm text-foreground/80">{e.message}</p>
                {e.organisation && <div className="mt-1 text-xs text-muted-foreground">Org: {e.organisation}</div>}
              </div>
              <button onClick={() => toggleRead(e.id, e.is_read)} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface">{e.is_read ? "Mark unread" : "Mark read"}</button>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">No enquiries yet.</div>}
      </div>
    </div>
  );
}
