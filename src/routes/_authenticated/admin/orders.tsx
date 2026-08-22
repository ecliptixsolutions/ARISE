import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"];

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => ((await (supabase as any).from("orders").select("*").order("created_at", { ascending: false })).data ?? []) as any[],
  });
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
        toast.info("Order list updated");
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
  const filtered = data.filter((o) => {
    const haystack = `${o.order_number} ${o.customer_name} ${o.customer_email} ${o.customer_mobile} ${o.tracking_id}`.toLowerCase();
    return (!q || haystack.includes(q.toLowerCase())) && (!status || o.status === status);
  });
  function exportCsv() {
    const cols = ["order_number", "customer_name", "customer_email", "total_amount", "payment_status", "payment_method", "status", "created_at"];
    const csv = [cols.join(","), ...filtered.map((o) => cols.map((c) => `"${String(o[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `orders-${Date.now()}.csv`;
    a.click();
  }
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Orders</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {data.length} orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => qc.invalidateQueries({ queryKey: ["admin-orders"] })} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Refresh</button>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"><Download className="h-4 w-4" /> Export CSV</button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, customer, email, mobile, tracking..." className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
          <option value="">All Status</option>
          {orderStatuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>{["Order", "Customer", "Product/Service", "Amount", "Payment", "Method", "Status", "Date", "Actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                <td className="px-4 py-3"><div className="font-medium">{o.customer_name}</div><div className="text-xs text-muted-foreground">{o.customer_email}</div></td>
                <td className="px-4 py-3">{o.service_name}</td>
                <td className="px-4 py-3">₹{Number(o.total_amount ?? 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{o.payment_status}</td>
                <td className="px-4 py-3">{o.payment_method ?? "—"}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{o.status.replaceAll("_", " ")}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><Link to="/admin/orders/$orderId" params={{ orderId: o.id }} className="font-semibold text-primary">View</Link></td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">{data.length ? "No matching orders found." : "No orders found."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
