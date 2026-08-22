import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statuses = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"];

export const Route = createFileRoute("/_authenticated/admin/orders/$orderId")({
  component: Page,
});

function Page() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const [order, items, events] = await Promise.all([
        (supabase as any).from("orders").select("*").eq("id", orderId).single(),
        (supabase as any).from("order_items").select("*").eq("order_id", orderId),
        (supabase as any).from("order_events").select("*").eq("order_id", orderId).order("created_at"),
      ]);
      if (order.error) throw order.error;
      return { order: order.data, items: items.data ?? [], events: events.data ?? [] };
    },
  });
  async function updateStatus(status: string) {
    const { error } = await (supabase as any).from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error(error.message);
    else {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-order", orderId] });
    }
  }
  if (!data) return <div className="text-sm text-muted-foreground">Loading order...</div>;
  const o = data.order;
  return (
    <div>
      <Link to="/admin/orders" className="text-sm font-semibold text-primary">Back to Orders</Link>
      <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">{o.order_number}</h1>
          <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
        </div>
        <select value={o.status} onChange={(e) => updateStatus(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
          {statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
        </select>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold text-navy">Order Items</h2>
          <div className="mt-3 divide-y divide-border">
            {data.items.map((i: any) => (
              <div key={i.id} className="grid grid-cols-[1fr_auto] gap-3 py-3 text-sm">
                <div><div className="font-medium">{i.name}</div><div className="text-xs text-muted-foreground">Qty {i.quantity}</div></div>
                <div className="text-right">₹{Number(i.total ?? 0).toLocaleString("en-IN")}</div>
              </div>
            ))}
            {data.items.length === 0 && <div className="py-6 text-sm text-muted-foreground">{o.service_name}</div>}
          </div>
        </section>
        <aside className="grid gap-4">
          <Card title="Customer" rows={[o.customer_name, o.customer_email, o.customer_mobile, o.shipping_address]} />
          <Card title="Payment" rows={[o.payment_status, o.payment_method, `₹${Number(o.total_amount ?? 0).toLocaleString("en-IN")}`, o.transaction_id]} />
          <Card title="Fulfillment & Tracking" rows={[o.tracking_id, o.status.replaceAll("_", " "), o.fulfillment_note]} />
        </aside>
      </div>
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Timeline</h2>
        <ol className="mt-3 space-y-3">
          {data.events.map((e: any) => <li key={e.id} className="text-sm"><span className="font-medium text-navy">{e.title}</span><div className="text-xs text-muted-foreground">{e.message} · {new Date(e.created_at).toLocaleString()}</div></li>)}
          {data.events.length === 0 && <li className="text-sm text-muted-foreground">No timeline events yet.</li>}
        </ol>
      </section>
    </div>
  );
}

function Card({ title, rows }: { title: string; rows: any[] }) {
  return <section className="rounded-2xl border border-border bg-card p-5"><h2 className="font-display text-lg font-semibold text-navy">{title}</h2><div className="mt-3 space-y-1 text-sm">{rows.filter(Boolean).map((r, i) => <div key={i}>{r}</div>)}</div></section>;
}
