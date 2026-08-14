import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { repairStatusLabels } from "@/lib/site-data";
import { useState } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/repairs")({
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["admin-repairs"],
    queryFn: async () => (await supabase.from("repair_requests").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = data.filter((r: any) => {
    const okQ = !q || `${r.request_code} ${r.full_name} ${r.equipment_name} ${r.mobile} ${r.email}`.toLowerCase().includes(q.toLowerCase());
    const okS = !statusF || r.status === statusF;
    return okQ && okS;
  });

  function exportCsv() {
    const cols = ["request_code","status","full_name","organisation","mobile","email","equipment_name","brand","created_at"];
    const rows = filtered.map((r: any) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `repair-requests-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const open = openId ? data.find((r: any) => r.id === openId) : null;

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Repair Requests</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {data.length}</p>
        </div>
        <button onClick={exportCsv} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-surface">Export CSV</button>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, name, mobile, equipment..." className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm" />
        </div>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
          <option value="">All statuses</option>
          {Object.entries(repairStatusLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>{["Request","Customer","Equipment","Status","Received",""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{r.request_code}</td>
                <td className="px-4 py-3"><div className="font-medium">{r.full_name}</div><div className="text-xs text-muted-foreground">{r.mobile}</div></td>
                <td className="px-4 py-3"><div>{r.equipment_name}</div><div className="text-xs text-muted-foreground">{r.brand}</div></td>
                <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{repairStatusLabels[r.status]}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><button onClick={() => setOpenId(r.id)} className="text-sm font-semibold text-primary">Open</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No requests found.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && <Drawer r={open} onClose={() => setOpenId(null)} onUpdated={() => qc.invalidateQueries({ queryKey: ["admin-repairs"] })} />}
    </div>
  );
}

function Drawer({ r, onClose, onUpdated }: { r: any; onClose: () => void; onUpdated: () => void }) {
  const [status, setStatus] = useState(r.status);
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(r.customer_visible_note ?? "");
  const [adminNote, setAdminNote] = useState(r.admin_notes ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const changes: any = { status, customer_visible_note: visible, admin_notes: adminNote };
    const { error } = await supabase.from("repair_requests").update(changes).eq("id", r.id);
    if (!error && status !== r.status) {
      await supabase.from("repair_status_history").insert({ request_id: r.id, status, note: note || null });
    }
    setBusy(false);
    if (error) { toast.error("Update failed"); return; }
    toast.success("Updated");
    onUpdated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/40" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Repair Request</div>
            <div className="font-mono text-lg font-semibold text-navy">{r.request_code}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-surface"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 grid gap-3 text-sm">
          <Row label="Customer" value={`${r.full_name} · ${r.mobile} · ${r.email}`} />
          <Row label="Organisation" value={r.organisation || "—"} />
          <Row label="Equipment" value={`${r.equipment_name}${r.brand ? " · " + r.brand : ""}${r.model_no ? " · Model " + r.model_no : ""}`} />
          <Row label="Problem" value={r.problem_description} />
          <Row label="Urgency / Contact" value={`${r.urgency} · ${r.preferred_contact}${r.pickup_required ? " · Pickup" : ""}`} />
          <Row label="Location" value={`${r.city || "—"}, ${r.state || "—"}`} />
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm">
              {Object.entries(repairStatusLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Status change note (internal)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Customer-visible update</span>
            <textarea value={visible} onChange={(e) => setVisible(e.target.value)} rows={3} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Internal notes</span>
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} className="rounded-lg border border-border px-3 py-2 text-sm" />
          </label>
          <button disabled={busy} onClick={save} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70">{busy ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: any) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-navy">{value}</div>
    </div>
  );
}
