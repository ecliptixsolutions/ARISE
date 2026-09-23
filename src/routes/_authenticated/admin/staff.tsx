/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, KeyRound, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPatch, apiPut } from "@/integrations/mysql/client";
import { defaultStaffPermissions, staffPermissionGroups } from "@/lib/admin-access";
import { createStaffAccount, resetStaffPassword } from "@/lib/staff-management";
import { PasswordField } from "@/components/ui/PasswordField";

export const Route = createFileRoute("/_authenticated/admin/staff")({ component: StaffPage });

function StaffPage() {
  const auth = useRouteContext({ from: "/_authenticated" });
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [accessMode, setAccessMode] = useState<"full" | "selected">("selected");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(defaultStaffPermissions);

  const { data = [] } = useQuery({
    queryKey: ["staff-management"],
    enabled: auth.isAdmin,
    queryFn: async () => {
      const { data, error } = await apiGet<any[]>("/api/staff");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const allPermissions = useMemo(
    () => staffPermissionGroups.flatMap(g => g.permissions.map(([key]) => key)),
    [],
  );

  async function createStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const full_name = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!full_name || !email || password.length < 8) {
      toast.error("Enter name, email and an 8+ character temporary password.");
      return;
    }
    setCreating(true);
    try {
      const { error } = await createStaffAccount({
        full_name, email, password, role,
        permissions: role === "admin" ? [] : accessMode === "full" ? allPermissions : selectedPermissions,
      });
      if (error) throw new Error(error.message);
      toast.success(role === "admin" ? "Super Admin account created" : "Staff account created");
      (event.currentTarget as HTMLFormElement).reset();
      setRole("staff"); setAccessMode("selected"); setSelectedPermissions(defaultStaffPermissions);
      qc.invalidateQueries({ queryKey: ["staff-management"] });
    } catch (error: any) {
      toast.error(error.message || "Could not create staff");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(staff: any) {
    const next = !staff.is_active;
    if (!confirm(`${next ? "Enable" : "Disable"} ${staff.full_name || staff.email}?`)) return;
    const { error } = await apiPatch(`/api/staff/${staff.id}/active`, { is_active: next });
    if (error) toast.error(error.message);
    else { toast.success(next ? "Staff enabled" : "Staff disabled"); qc.invalidateQueries({ queryKey: ["staff-management"] }); }
  }

  async function savePermissions(userId: string, permissions: string[]) {
    const { error } = await apiPut(`/api/staff/${userId}/permissions`, { permissions });
    if (error) toast.error(error.message);
    else { toast.success("Permissions updated"); qc.invalidateQueries({ queryKey: ["staff-management"] }); }
  }

  async function resetPassword(userId: string) {
    const password = prompt("Temporary password (8+ characters):");
    if (!password) return;
    try {
      const { error } = await resetStaffPassword({ user_id: userId, password });
      if (error) throw new Error(error.message);
      toast.success("Password reset");
    } catch (error: any) {
      toast.error(error.message || "Could not reset password");
    }
  }

  if (!auth.isAdmin) {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Staff Management is available to Super Admin only.</div>;
  }

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Staff Management</h1>
        <p className="text-sm text-muted-foreground">Create staff accounts and assign module permissions.</p>
      </div>
      <form onSubmit={createStaff} className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 font-semibold text-navy"><Plus className="h-4 w-4" /> Create Staff</div>
        <div className="grid gap-3 md:grid-cols-3">
          <Field name="full_name" label="Full name" />
          <Field name="email" label="Email / login" type="email" />
          <PasswordField name="password" label="Temporary password" autoComplete="new-password" />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-navy">Role</span>
            <select name="role" value={role} onChange={e => setRole(e.target.value as "staff" | "admin")} className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15">
              <option value="staff">Staff</option>
              <option value="admin">Super Admin</option>
            </select>
          </label>
        </div>
        {role === "staff" && (
          <>
            <label className="grid max-w-xs gap-1.5 text-sm">
              <span className="font-medium text-navy">Access Mode</span>
              <select value={accessMode} onChange={e => { const next = e.target.value as "full"|"selected"; setAccessMode(next); if (next === "full") setSelectedPermissions(allPermissions); }} className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15">
                <option value="selected">Selected Access</option>
                <option value="full">Full Access</option>
              </select>
            </label>
            {accessMode === "selected" && <PermissionPicker value={selectedPermissions} onChange={setSelectedPermissions} />}
          </>
        )}
        <button disabled={creating} className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70">
          <ShieldCheck className="h-4 w-4" /> {creating ? "Creating..." : role === "admin" ? "Create Super Admin" : "Create Staff"}
        </button>
      </form>
      <div className="mt-6 space-y-3">
        {data.map((staff: any) => (
          <article key={staff.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h2 className="font-semibold text-navy">{staff.full_name || staff.email}</h2>
                <p className="text-sm text-muted-foreground">{staff.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{staff.role === "admin" ? "Super Admin" : "Staff"}</p>
                <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${staff.is_active ? "bg-primary/10 text-primary" : "bg-red-50 text-red-700"}`}>{staff.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => resetPassword(staff.id)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"><KeyRound className="h-4 w-4" /> Reset Access</button>
                <button onClick={() => toggleActive(staff)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface">{staff.is_active ? "Disable" : "Enable"}</button>
              </div>
            </div>
            <div className="mt-4">
              {staff.role === "admin"
                ? <div className="rounded-lg border border-border bg-surface p-3 text-sm text-muted-foreground">Super Admin has full access.</div>
                : <PermissionPicker value={staff.permissions} onChange={p => savePermissions(staff.id, p)} compact allPermissions={allPermissions} />}
            </div>
          </article>
        ))}
        {!data.length && <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No staff accounts yet.</div>}
      </div>
    </div>
  );
}

function PermissionPicker({ value, onChange, compact }: { value: string[]; onChange: (v: string[]) => void; compact?: boolean; allPermissions?: string[] }) {
  function toggle(p: string) { onChange(value.includes(p) ? value.filter(i => i !== p) : [...value, p]); }
  return (
    <div className={`grid gap-3 ${compact ? "md:grid-cols-3" : ""}`}>
      {staffPermissionGroups.map(group => (
        <div key={group.title} className="rounded-lg border border-border p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</div>
          <div className="grid gap-2">
            {group.permissions.map(([permission, label]) => (
              <label key={permission} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={value.includes(permission)} onChange={() => toggle(permission)} className="h-4 w-4" />
                <span>{label}</span>
                {value.includes(permission) && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-navy">{label}</span>
      <input name={name} type={type} required className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
    </label>
  );
}
