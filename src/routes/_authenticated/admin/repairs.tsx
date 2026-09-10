/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useLocation, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/integrations/mysql/client";
import { hasPermission } from "@/lib/admin-access";
import { locationLabel, repairLocations } from "@/lib/repair-workflow";
import { repairStatusLabels } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/admin/repairs")({ component: RepairRequestsPage });

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POLL_MS = 8000;

export function RepairRequestsPage() {
  const auth = useRouteContext({ from: "/_authenticated" });
  const location = useLocation();
  const navigate = useNavigate();
  const requestedOpen = typeof (location.search as any).open === "string" ? (location.search as any).open.trim() : "";
  const requestedOpenId = uuidPattern.test(requestedOpen) ? requestedOpen : null;
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [locationF, setLocationF] = useState("");
  const [openId, setOpenId] = useState<string | null>(requestedOpenId);
  const qc = useQueryClient();
  const canRead = hasPermission(auth, "repair_requests");
  const table = auth.isAdmin ? "repair_requests" : "repair_request_public_updates";
  const queryKey = useMemo(() => ["admin-repairs", auth.isAdmin ? "admin" : "staff"], [auth.isAdmin]);
  const lastPollRef = useRef<number>(Date.now() - POLL_MS);

  const { data = [] } = useQuery({
    queryKey,
    enabled: canRead,
    queryFn: async () => {
      const { data, error } = await apiGet<any[]>("/api/repair-requests");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  // Polling replaces Supabase realtime
  useEffect(() => {
    if (!canRead) return;
    const interval = setInterval(async () => {
      const since = new Date(lastPollRef.current).toISOString();
      lastPollRef.current = Date.now();
      const { data: pollData } = await apiGet<{ changes: any[] }>("/api/poll", {
        since, tables: table,
      });
      if (pollData?.changes?.length) {
        void qc.invalidateQueries({ queryKey });
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [canRead, qc, queryKey, table]);

  useEffect(() => { setOpenId(requestedOpenId); }, [requestedOpenId]);

  const filtered = data.filter((r: any) => {
    const haystack = [r.request_code, r.full_name, r.equipment_name, r.brand, r.model_no, r.serial_no,
      auth.isAdmin ? r.mobile : "", auth.isAdmin ? r.email : ""]
      .filter(Boolean).join(" ").toLowerCase();
    return (!q || haystack.includes(q.toLowerCase()))
      && (!statusF || r.status === statusF)
      && (!locationF || locationLabel(r.current_location) === locationF);
  });

  function exportCsv() {
    const cols = auth.isAdmin
      ? ["request_code","status","current_location","full_name","organisation","mobile","email","equipment_name","brand","created_at"]
      : ["request_code","status","current_location","full_name","equipment_name","brand","model_no","serial_no","created_at"];
    const rows = filtered.map((r: any) => cols.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [cols.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `repair-requests-${Date.now()}.csv`;
    a.click();
  }

  const open = openId ? (data.find((r: any) => r.id === openId) ?? null) : null;

  function closeOpen() {
    setOpenId(null);
    void navigate({ to: location.pathname as any, search: ({ open: _o, ...rest }: any) => rest, replace: true } as any);
  }

  if (!canRead) return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">You do not have permission to view repair requests.</div>;

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Repair Requests</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {data.length}</p>
        </div>
        <button onClick={exportCsv} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-surface">Export CSV</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search ID, name, equipment..." className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm" />
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
          <option value="">All statuses</option>
          {Object.entries(repairStatusLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={locationF} onChange={e => setLocationF(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
          <option value="">All locations</option>
          {repairLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>{["Request","Customer","Equipment","Status","Location","Received",""].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{r.request_code}</td>
                <td className="px-4 py-3"><div className="font-medium">{r.full_name}</div>{auth.isAdmin && <div className="text-xs text-muted-foreground">{r.mobile}</div>}</td>
                <td className="px-4 py-3"><div>{r.equipment_name}</div><div className="text-xs text-muted-foreground">{[r.brand, r.model_no].filter(Boolean).join(" / ")}</div></td>
                <td className="px-4 py-3"><span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{repairStatusLabels[r.status as keyof typeof repairStatusLabels] ?? r.status}</span></td>
                <td className="px-4 py-3"><span className="inline-flex rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-navy">{locationLabel(r.current_location)}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><button onClick={() => setOpenId(r.id)} className="text-sm font-semibold text-primary">Open</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No requests found.</td></tr>}
          </tbody>
        </table>
      </div>
      {open && <Drawer auth={auth} r={open} queryKey={queryKey} onClose={closeOpen} onUpdated={() => qc.invalidateQueries({ queryKey })} />}
    </div>
  );
}

function Drawer({ auth, r, queryKey, onClose, onUpdated }: { auth: any; r: any; queryKey: unknown[]; onClose: () => void; onUpdated: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(r.status);
  const [currentLocation, setCurrentLocation] = useState(locationLabel(r.current_location));
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(r.customer_visible_note ?? "");
  const [adminNote, setAdminNote] = useState(r.admin_notes ?? "");
  const [inspectionNotes, setInspectionNotes] = useState(r.inspection_notes ?? "");
  const [repairNotes, setRepairNotes] = useState(r.repair_notes ?? "");
  const [qualityTestingNotes, setQualityTestingNotes] = useState(r.quality_testing_notes ?? "");
  const [dispatchNotes, setDispatchNotes] = useState(r.dispatch_notes ?? "");
  const [busy, setBusy] = useState(false);
  const canStatus = hasPermission(auth, "update_status");
  const canLocation = hasPermission(auth, "update_location");
  const canProgress = hasPermission(auth, "update_repair_progress");
  const canInspection = canProgress || hasPermission(auth, "update_inspection");
  const canQuality = canProgress || hasPermission(auth, "quality_testing");
  const canDispatch = canProgress || hasPermission(auth, "dispatch");
  const canDetails = hasPermission(auth, "repair_details");

  const { data: activity = [] } = useQuery({
    queryKey: ["repair-activity", r.id],
    enabled: canDetails,
    queryFn: async () => {
      const { data, error } = await apiGet<any[]>(`/api/repair-requests/${r.id}/activity`);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    refetchInterval: 10_000,
  });

  useEffect(() => {
    setStatus(r.status); setCurrentLocation(locationLabel(r.current_location));
    setVisible(r.customer_visible_note ?? ""); setAdminNote(r.admin_notes ?? "");
    setInspectionNotes(r.inspection_notes ?? ""); setRepairNotes(r.repair_notes ?? "");
    setQualityTestingNotes(r.quality_testing_notes ?? ""); setDispatchNotes(r.dispatch_notes ?? "");
  }, [r]);

  async function save() {
    setBusy(true);
    const { error } = await apiPatch(`/api/repair-requests/${r.id}`, {
      status, current_location: currentLocation,
      customer_visible_note: visible || null,
      admin_notes: auth.isAdmin ? (adminNote || null) : undefined,
      inspection_notes: inspectionNotes || null,
      repair_notes: repairNotes || null,
      quality_testing_notes: qualityTestingNotes || null,
      dispatch_notes: dispatchNotes || null,
      change_note: note || null,
      expected_updated_at: r.updated_at,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    onUpdated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/40" onClick={onClose}>
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <div><div className="text-xs font-semibold uppercase tracking-wider text-primary">Repair Request</div><div className="font-mono text-lg font-semibold text-navy">{r.request_code}</div></div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-surface" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Row label="Status" value={<span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{repairStatusLabels[r.status as keyof typeof repairStatusLabels] ?? r.status}</span>} />
          <Row label="Current Location" value={<span className="inline-flex rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-navy">{locationLabel(r.current_location)}</span>} />
          <Row label="Customer" value={auth.isAdmin ? `${r.full_name} - ${r.mobile} - ${r.email}` : r.full_name} />
          {auth.isAdmin && <Row label="City / State" value={`${r.city || "-"}, ${r.state || "-"}`} />}
          <Row label="Equipment" value={`${r.equipment_name}${r.brand ? " - " + r.brand : ""}${r.model_no ? " - Model " + r.model_no : ""}`} />
          <Row label="Serial Number" value={r.serial_no || "-"} />
          <Row label="Problem" value={r.problem_description} />
          {auth.isAdmin && <Row label="Urgency / Contact" value={`${r.urgency} - ${r.preferred_contact}${r.pickup_required ? " - Pickup" : ""}`} />}
        </div>
        <div className="mt-6 grid gap-3">
          <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)} disabled={!canStatus} className="rounded-lg border border-border px-3 py-2 text-sm disabled:bg-surface">
              {Object.entries(repairStatusLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">Current location</span>
            <select value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} disabled={!canLocation} className="rounded-lg border border-border px-3 py-2 text-sm disabled:bg-surface">
              {repairLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </label>
          <NoteField label="Change note" value={note} onChange={setNote} />
          <NoteField label="Customer-visible update" value={visible} onChange={setVisible} disabled={!canProgress} rows={3} />
          <NoteField label="Inspection notes" value={inspectionNotes} onChange={setInspectionNotes} disabled={!canInspection} rows={3} />
          <NoteField label="Repair notes" value={repairNotes} onChange={setRepairNotes} disabled={!canProgress} rows={3} />
          <NoteField label="Quality testing" value={qualityTestingNotes} onChange={setQualityTestingNotes} disabled={!canQuality} rows={3} />
          <NoteField label="Dispatch" value={dispatchNotes} onChange={setDispatchNotes} disabled={!canDispatch} rows={3} />
          {auth.isAdmin && <NoteField label="Super Admin internal notes" value={adminNote} onChange={setAdminNote} rows={3} />}
          <button disabled={busy} onClick={save} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70">
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
        {canDetails && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-navy">Activity Timeline</h2>
            <ol className="mt-3 space-y-3">
              {(activity as any[]).map((item: any) => (
                <li key={item.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="font-medium text-navy">{activityText(item)}</div>
                  {item.note && <div className="mt-1 text-xs text-muted-foreground">{item.note}</div>}
                  <div className="mt-1 text-[11px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</div>
                </li>
              ))}
              {!(activity as any[]).length && <li className="text-sm text-muted-foreground">No activity recorded yet.</li>}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function activityText(item: any) {
  if (item.action === "status_changed") return `Status: ${repairStatusLabels[item.old_status as keyof typeof repairStatusLabels] ?? item.old_status} → ${repairStatusLabels[item.new_status as keyof typeof repairStatusLabels] ?? item.new_status}`;
  if (item.action === "location_changed") return `Location: ${item.old_location ?? "-"} → ${item.new_location ?? "-"}`;
  if (item.action === "created") return "Request received";
  return item.action.replace(/_/g, " ");
}

function NoteField({ label, value, onChange, disabled, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; rows?: number }) {
  return <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium">{label}</span><textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} disabled={disabled} className="rounded-lg border border-border px-3 py-2 text-sm disabled:bg-surface" /></label>;
}

function Row({ label, value }: any) {
  return <div className="rounded-lg bg-surface p-3"><div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 text-navy">{value}</div></div>;
}
