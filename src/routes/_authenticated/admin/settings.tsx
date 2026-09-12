/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiPost, apiPatch, apiDelete } from "@/integrations/mysql/client";
import { hasPermission } from "@/lib/admin-access";
import {
  getOfficeStatus,
  type OfficeAvailability,
  type OfficeAvailabilityStatus,
  useOfficeAvailability,
} from "@/lib/office-availability";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: Page });

const statusLabels: Record<OfficeAvailabilityStatus, string> = {
  open: "Open",
  closed: "Closed",
  temporarily_closed: "Temporarily Closed",
};

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function todayRange() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return { starts_at: toDatetimeLocal(start.toISOString()), ends_at: toDatetimeLocal(end.toISOString()) };
}

const blankForm = { status: "closed" as OfficeAvailabilityStatus, scope: "today", ...todayRange(), reason: "", reopening_at: "" };

function Page() {
  const auth = useRouteContext({ from: "/_authenticated" });
  const canManage = hasPermission(auth, "office_availability");
  const availability = useOfficeAvailability();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const entries = availability.data ?? [];
  const current = useMemo(() => getOfficeStatus(entries, new Date()), [entries]);
  const upcoming = entries
    .filter(e => new Date(e.ends_at ?? e.starts_at).getTime() >= Date.now())
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  function updateScope(scope: string) {
    if (scope === "today") setForm(c => ({ ...c, scope, ...todayRange() }));
    else setForm(c => ({ ...c, scope }));
  }

  function edit(entry: OfficeAvailability) {
    setEditingId(entry.id);
    setForm({ status: entry.status, scope: "range", starts_at: toDatetimeLocal(entry.starts_at), ends_at: toDatetimeLocal(entry.ends_at), reason: entry.reason ?? "", reopening_at: toDatetimeLocal(entry.reopening_at) });
  }

  function reset() { setEditingId(null); setForm(blankForm); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) return toast.error("You do not have permission to change office availability.");
    const starts_at = fromDatetimeLocal(form.starts_at);
    const ends_at = fromDatetimeLocal(form.ends_at);
    if (!starts_at) return toast.error("Select a start date and time.");
    if (ends_at && new Date(ends_at) <= new Date(starts_at)) return toast.error("End date/time must be after start date/time.");

    setSaving(true);
    const payload = { status: form.status, starts_at, ends_at, reason: form.reason.trim() || null, reopening_at: fromDatetimeLocal(form.reopening_at) };
    const { error } = editingId
      ? await apiPatch(`/api/office-availability/${editingId}`, payload)
      : await apiPost("/api/office-availability", payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Availability updated" : "Availability scheduled");
    reset();
    void availability.refetch();
  }

  async function remove(entry: OfficeAvailability) {
    if (!canManage) return toast.error("You do not have permission.");
    if (!confirm(`Delete ${statusLabels[entry.status]} schedule?`)) return;
    const { error } = await apiDelete(`/api/office-availability/${entry.id}`);
    if (error) toast.error(error.message);
    else { toast.success("Schedule deleted"); void availability.refetch(); }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Settings</h1>
      <p className="text-sm text-muted-foreground">Manage live website settings.</p>
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2 font-semibold text-navy"><CalendarClock className="h-5 w-5 text-primary" /> Office Availability</div>
            <p className="mt-1 text-sm text-muted-foreground">Controls the public top status bar in real time.</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-sm font-semibold ${current.open ? "bg-primary/10 text-primary" : "bg-gold-soft text-navy"}`}>Current: {current.text}</div>
        </div>
        {!canManage && <div className="mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">You can view office availability, but only Super Admin or permitted staff can change it.</div>}
        <form onSubmit={save} className="mt-5 grid gap-4 border-t border-border pt-5">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1.5 text-sm"><span className="font-medium text-navy">Status</span>
              <select disabled={!canManage} value={form.status} onChange={e => setForm(c => ({ ...c, status: e.target.value as OfficeAvailabilityStatus }))} className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary disabled:opacity-60">
                <option value="open">Open</option><option value="closed">Closed</option><option value="temporarily_closed">Temporarily Closed</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm"><span className="font-medium text-navy">Schedule</span>
              <select disabled={!canManage} value={form.scope} onChange={e => updateScope(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary disabled:opacity-60">
                <option value="today">Today</option><option value="specific">Specific date</option><option value="range">Date range</option>
              </select>
            </label>
            <Field label="Reopens at" type="datetime-local" disabled={!canManage} value={form.reopening_at} onChange={v => setForm(c => ({ ...c, reopening_at: v }))} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={form.scope === "specific" ? "Date / start" : "Starts at"} type="datetime-local" disabled={!canManage} value={form.starts_at} onChange={v => setForm(c => ({ ...c, starts_at: v }))} />
            <Field label="Ends at" type="datetime-local" disabled={!canManage} value={form.ends_at} onChange={v => setForm(c => ({ ...c, ends_at: v }))} />
          </div>
          <label className="grid gap-1.5 text-sm"><span className="font-medium text-navy">Reason / message</span>
            <textarea disabled={!canManage} value={form.reason} onChange={e => setForm(c => ({ ...c, reason: e.target.value }))} rows={3} placeholder="Office closed due to holiday" className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary disabled:opacity-60" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button disabled={!canManage || saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : editingId ? "Update Availability" : "Save Availability"}
            </button>
            {editingId && <button type="button" onClick={reset} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Cancel</button>}
          </div>
        </form>
      </section>
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-navy">Upcoming Scheduled Closures</h2>
        {availability.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading availability...</p>
          : upcoming.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No scheduled availability changes.</p>
          : <div className="mt-4 grid gap-3">
            {upcoming.map(entry => (
              <article key={entry.id} className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-4 md:flex-row md:items-center">
                <div>
                  <div className="font-semibold text-navy">{statusLabels[entry.status]}</div>
                  <div className="text-sm text-muted-foreground">{new Date(entry.starts_at).toLocaleString()} - {entry.ends_at ? new Date(entry.ends_at).toLocaleString() : "until changed"}</div>
                  {entry.reason && <div className="mt-1 text-sm text-muted-foreground">{entry.reason}</div>}
                </div>
                {canManage && <div className="flex gap-2">
                  <button onClick={() => edit(entry)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-white">Edit</button>
                  <button onClick={() => remove(entry)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-red-600 hover:bg-white"><Trash2 className="h-4 w-4" /> Delete</button>
                </div>}
              </article>
            ))}
          </div>}
      </section>
    </div>
  );
}

function Field({ label, type = "text", value, disabled, onChange }: { label: string; type?: string; value: string; disabled?: boolean; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-navy">{label}</span>
      <input type={type} value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary disabled:opacity-60" />
    </label>
  );
}
