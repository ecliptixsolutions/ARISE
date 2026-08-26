/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useLocation, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { hasPermission } from "@/lib/admin-access";
import { locationLabel, repairLocations } from "@/lib/repair-workflow";
import { repairStatusLabels } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/admin/repairs")({
  component: RepairRequestsPage,
});

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function RepairRequestsPage() {
  const auth = useRouteContext({ from: "/_authenticated" });
  const location = useLocation();
  const navigate = useNavigate();
  const requestedOpen =
    typeof (location.search as any).open === "string" ? (location.search as any).open.trim() : "";
  const requestedOpenId = uuidPattern.test(requestedOpen) ? requestedOpen : null;
  const invalidOpenId = Boolean(requestedOpen && !requestedOpenId);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("");
  const [locationF, setLocationF] = useState("");
  const [openId, setOpenId] = useState<string | null>(requestedOpenId);
  const qc = useQueryClient();
  const canRead = hasPermission(auth, "repair_requests");
  const table = auth.isAdmin ? "repair_requests" : "repair_request_public_updates";
  const queryKey = useMemo(
    () => ["admin-repairs", auth.isAdmin ? "admin" : "staff"],
    [auth.isAdmin],
  );

  const { data = [] } = useQuery({
    queryKey,
    enabled: canRead,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!canRead) return;
    const channel = supabase
      .channel(`admin-repairs-live-${auth.isAdmin ? "admin" : "staff"}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        qc.setQueryData(queryKey, (current: any[] = []) => {
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
        if (status === "SUBSCRIBED") qc.invalidateQueries({ queryKey });
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [auth.isAdmin, canRead, qc, queryKey, table]);

  useEffect(() => {
    setOpenId(requestedOpenId);
  }, [requestedOpenId]);

  const filtered = data.filter((r: any) => {
    const haystack = [
      r.request_code,
      r.full_name,
      r.equipment_name,
      r.brand,
      r.model_no,
      r.serial_no,
      auth.isAdmin ? r.mobile : "",
      auth.isAdmin ? r.email : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const okQ = !q || haystack.includes(q.toLowerCase());
    const okS = !statusF || r.status === statusF;
    const okL = !locationF || locationLabel(r.current_location) === locationF;
    return okQ && okS && okL;
  });

  function exportCsv() {
    const cols = auth.isAdmin
      ? [
          "request_code",
          "status",
          "current_location",
          "full_name",
          "organisation",
          "mobile",
          "email",
          "equipment_name",
          "brand",
          "created_at",
        ]
      : [
          "request_code",
          "status",
          "current_location",
          "full_name",
          "equipment_name",
          "brand",
          "model_no",
          "serial_no",
          "created_at",
        ];
    const rows = filtered.map((r: any) =>
      cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","),
    );
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repair-requests-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const listedOpen = openId ? data.find((r: any) => r.id === openId) : null;
  const {
    data: fetchedOpen,
    isLoading: isOpenLoading,
    isError: isOpenError,
  } = useQuery({
    queryKey: ["admin-repair-open", auth.isAdmin ? "admin" : "staff", openId],
    enabled: canRead && Boolean(openId) && !listedOpen,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .eq("id", openId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const open = listedOpen ?? fetchedOpen ?? null;
  const missingOpen = Boolean(openId) && !open && !isOpenLoading;

  function closeOpen() {
    setOpenId(null);
    void navigate({
      to: location.pathname as any,
      search: ({ open: _open, ...rest }: any) => rest,
      replace: true,
    } as any);
  }

  if (!canRead) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        You do not have permission to view repair requests.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Repair Requests</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {data.length}
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-surface"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ID, name, equipment..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm"
          />
        </div>
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(repairStatusLabels).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={locationF}
          onChange={(e) => setLocationF(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
        >
          <option value="">All locations</option>
          {repairLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Request", "Customer", "Equipment", "Status", "Location", "Received", ""].map(
                (h) => (
                  <th key={h} className="px-4 py-3">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{r.request_code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.full_name}</div>
                  {auth.isAdmin && <div className="text-xs text-muted-foreground">{r.mobile}</div>}
                </td>
                <td className="px-4 py-3">
                  <div>{r.equipment_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[r.brand, r.model_no].filter(Boolean).join(" / ")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <LocationBadge location={locationLabel(r.current_location)} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setOpenId(r.id)}
                    className="text-sm font-semibold text-primary"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(invalidOpenId || isOpenError || missingOpen) && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Repair request not found.
        </div>
      )}

      {open && (
        <Drawer
          auth={auth}
          r={open}
          queryKey={queryKey}
          onClose={closeOpen}
          onUpdated={() => qc.invalidateQueries({ queryKey })}
        />
      )}
    </div>
  );
}

function Drawer({
  auth,
  r,
  queryKey,
  onClose,
  onUpdated,
}: {
  auth: any;
  r: any;
  queryKey: unknown[];
  onClose: () => void;
  onUpdated: () => void;
}) {
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
      const { data, error } = await (supabase as any)
        .from("repair_request_activity")
        .select("*")
        .eq("request_id", r.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    setStatus(r.status);
    setCurrentLocation(locationLabel(r.current_location));
    setVisible(r.customer_visible_note ?? "");
    setAdminNote(r.admin_notes ?? "");
    setInspectionNotes(r.inspection_notes ?? "");
    setRepairNotes(r.repair_notes ?? "");
    setQualityTestingNotes(r.quality_testing_notes ?? "");
    setDispatchNotes(r.dispatch_notes ?? "");
  }, [r]);

  useEffect(() => {
    if (!canDetails) return;
    const channel = supabase
      .channel(`repair-activity-${r.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "repair_request_activity",
          filter: `request_id=eq.${r.id}`,
        },
        () => qc.invalidateQueries({ queryKey: ["repair-activity", r.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [canDetails, qc, r.id]);

  async function save() {
    if (status !== r.status && !canStatus) return toast.error("Missing status update permission");
    if (currentLocation !== locationLabel(r.current_location) && !canLocation) {
      return toast.error("Missing location update permission");
    }
    if (
      (visible !== (r.customer_visible_note ?? "") || repairNotes !== (r.repair_notes ?? "")) &&
      !canProgress
    ) {
      return toast.error("Missing repair progress permission");
    }
    if (inspectionNotes !== (r.inspection_notes ?? "") && !canInspection) {
      return toast.error("Missing inspection update permission");
    }
    if (qualityTestingNotes !== (r.quality_testing_notes ?? "") && !canQuality) {
      return toast.error("Missing quality testing permission");
    }
    if (dispatchNotes !== (r.dispatch_notes ?? "") && !canDispatch) {
      return toast.error("Missing dispatch permission");
    }

    setBusy(true);
    const optimistic = {
      ...r,
      status,
      current_location: currentLocation,
      customer_visible_note: visible,
      admin_notes: auth.isAdmin ? adminNote : r.admin_notes,
      inspection_notes: inspectionNotes,
      repair_notes: repairNotes,
      quality_testing_notes: qualityTestingNotes,
      dispatch_notes: dispatchNotes,
      updated_at: new Date().toISOString(),
    };
    const previous = qc.getQueryData(queryKey);
    qc.setQueryData(queryKey, (current: any[] = []) =>
      current.map((row) => (row.id === r.id ? optimistic : row)),
    );

    const { error } = await (supabase as any).rpc("update_repair_operation", {
      _request_id: r.id,
      _status: status,
      _current_location: currentLocation,
      _customer_visible_note: visible || null,
      _admin_notes: auth.isAdmin ? adminNote || null : null,
      _inspection_notes: inspectionNotes || null,
      _repair_notes: repairNotes || null,
      _quality_testing_notes: qualityTestingNotes || null,
      _dispatch_notes: dispatchNotes || null,
      _change_note: note || null,
      _expected_updated_at: r.updated_at,
    });

    setBusy(false);
    if (error) {
      qc.setQueryData(queryKey, previous);
      toast.error(error.message || "Update failed");
      return;
    }
    toast.success("Updated");
    onUpdated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Repair Request
            </div>
            <div className="font-mono text-lg font-semibold text-navy">{r.request_code}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-surface"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Row label="Status" value={<StatusBadge status={r.status} />} />
          <Row
            label="Current Location"
            value={<LocationBadge location={locationLabel(r.current_location)} />}
          />
          <Row
            label="Customer"
            value={auth.isAdmin ? `${r.full_name} - ${r.mobile} - ${r.email}` : r.full_name}
          />
          {auth.isAdmin && (
            <Row label="City / State" value={`${r.city || "-"}, ${r.state || "-"}`} />
          )}
          <Row
            label="Equipment"
            value={`${r.equipment_name}${r.brand ? " - " + r.brand : ""}${r.model_no ? " - Model " + r.model_no : ""}`}
          />
          <Row label="Serial Number" value={r.serial_no || "-"} />
          <Row label="Problem" value={r.problem_description} />
          {auth.isAdmin && (
            <Row
              label="Urgency / Contact"
              value={`${r.urgency} - ${r.preferred_contact}${r.pickup_required ? " - Pickup" : ""}`}
            />
          )}
        </div>

        <div className="mt-6 grid gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!canStatus}
              className="rounded-lg border border-border px-3 py-2 text-sm disabled:bg-surface"
            >
              {Object.entries(repairStatusLabels).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Current location</span>
            <select
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              disabled={!canLocation}
              className="rounded-lg border border-border px-3 py-2 text-sm disabled:bg-surface"
            >
              {repairLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
          <NoteField label="Change note" value={note} onChange={setNote} />
          <NoteField
            label="Customer-visible update"
            value={visible}
            onChange={setVisible}
            disabled={!canProgress}
            rows={3}
          />
          <NoteField
            label="Inspection notes"
            value={inspectionNotes}
            onChange={setInspectionNotes}
            disabled={!canInspection}
            rows={3}
          />
          <NoteField
            label="Repair notes"
            value={repairNotes}
            onChange={setRepairNotes}
            disabled={!canProgress}
            rows={3}
          />
          <NoteField
            label="Quality testing"
            value={qualityTestingNotes}
            onChange={setQualityTestingNotes}
            disabled={!canQuality}
            rows={3}
          />
          <NoteField
            label="Dispatch"
            value={dispatchNotes}
            onChange={setDispatchNotes}
            disabled={!canDispatch}
            rows={3}
          />
          {auth.isAdmin && (
            <NoteField
              label="Super Admin internal notes"
              value={adminNote}
              onChange={setAdminNote}
              rows={3}
            />
          )}
          <button
            disabled={busy}
            onClick={save}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>

        {canDetails && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-navy">Activity Timeline</h2>
            <ol className="mt-3 space-y-3">
              {activity.map((item: any) => (
                <li key={item.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="font-medium text-navy">{activityText(item)}</div>
                  {item.note && (
                    <div className="mt-1 text-xs text-muted-foreground">{item.note}</div>
                  )}
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
              {activity.length === 0 && (
                <li className="text-sm text-muted-foreground">No activity recorded yet.</li>
              )}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function activityText(item: any) {
  if (item.action === "status_changed") {
    return `Status changed from ${repairStatusLabels[item.old_status] ?? item.old_status} to ${repairStatusLabels[item.new_status] ?? item.new_status}`;
  }
  if (item.action === "location_changed") {
    return `Location changed from ${item.old_location ?? "-"} to ${item.new_location ?? "-"}`;
  }
  if (item.action === "created") return "Request received";
  return item.action.replace(/_/g, " ");
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {repairStatusLabels[status] ?? status}
    </span>
  );
}

function LocationBadge({ location }: { location: string }) {
  return (
    <span className="inline-flex rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-navy">
      {location}
    </span>
  );
}

function NoteField({
  label,
  value,
  onChange,
  disabled,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={disabled}
        className="rounded-lg border border-border px-3 py-2 text-sm disabled:bg-surface"
      />
    </label>
  );
}

function Row({ label, value }: any) {
  return (
    <div className="rounded-lg bg-surface p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-navy">{value}</div>
    </div>
  );
}
