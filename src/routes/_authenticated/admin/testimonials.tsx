import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").order("sort_order")).data ?? [],
  });
  const [form, setForm] = useState({ customer_name: "", organisation: "", city: "", rating: 5, feedback: "" });

  async function add() {
    if (!form.customer_name || !form.feedback) { toast.error("Name & feedback required"); return; }
    const { error } = await supabase.from("testimonials").insert({ ...form, is_sample: false, is_approved: true, sort_order: 99 });
    if (error) { toast.error(error.message); return; }
    setForm({ customer_name: "", organisation: "", city: "", rating: 5, feedback: "" });
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    toast.success("Added");
  }
  async function del(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }
  async function toggleApproval(id: string, is_approved: boolean) {
    await supabase.from("testimonials").update({ is_approved: !is_approved }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Testimonials</h1>
      <p className="text-sm text-muted-foreground">Approve, delete or add verified customer feedback.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold text-navy">Add testimonial</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input placeholder="Organisation" value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="rounded-lg border border-border px-3 py-2 text-sm">
            {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
        </div>
        <textarea placeholder="Feedback" value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} rows={3} className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <button onClick={add} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Add testimonial</button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.map((t: any) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-1 text-orange">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
            <p className="mt-2 text-sm text-foreground/80">"{t.feedback}"</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div><div className="font-semibold text-navy">{t.customer_name}</div><div className="text-muted-foreground">{t.organisation}</div></div>
              <div className="flex gap-2">
                {t.is_sample && <span className="rounded-full bg-orange/10 px-2 py-0.5 font-semibold text-orange">Sample</span>}
                <button onClick={() => toggleApproval(t.id, t.is_approved)} className={`rounded-md border px-2 py-1 ${t.is_approved ? "border-primary/40 text-primary" : "border-border"}`}>{t.is_approved ? "Approved" : "Approve"}</button>
                <button onClick={() => del(t.id)} className="rounded-md border border-border p-1 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
