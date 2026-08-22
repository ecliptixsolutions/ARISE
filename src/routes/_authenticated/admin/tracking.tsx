import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/tracking")({
  component: Page,
});

const statuses = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];

function Page() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-tracking"],
    queryFn: async () =>
      ((await (supabase as any)
        .from("tracking")
        .select("*")
        .order("updated_at", { ascending: false })).data ?? []) as any[],
  });
  const filtered = data.filter((t) =>
    `${t.tracking_id} ${t.customer_name} ${t.customer_mobile} ${t.equipment_name}`.toLowerCase().includes(q.toLowerCase()),
  );
  async function updateStatus(id: string, status: string) {
    const { error } = await (supabase as any).from("tracking").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Tracking updated");
      qc.invalidateQueries({ queryKey: ["admin-tracking"] });
    }
  }
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Tracking</h1>
      <p className="text-sm text-muted-foreground">{filtered.length} tracking records</p>
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tracking ID, customer, mobile, equipment..." className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm" />
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>{["Tracking ID", "Customer", "Equipment", "Status", "Received", "Updated"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{t.tracking_id}</td>
                <td className="px-4 py-3"><div className="font-medium">{t.customer_name}</div><div className="text-xs text-muted-foreground">{t.customer_mobile}</div></td>
                <td className="px-4 py-3">{t.equipment_name}</td>
                <td className="px-4 py-3">
                  <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="rounded-md border border-border bg-white px-2 py-1 text-xs">
                    {statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleString()}</td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No tracking records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
