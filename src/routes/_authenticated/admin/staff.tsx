/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, KeyRound, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { defaultStaffPermissions, staffPermissionGroups } from "@/lib/admin-access";
import { createStaffAccount, resetStaffPassword } from "@/lib/staff-management";
import { PasswordField } from "@/components/ui/PasswordField";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: StaffPage,
});

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
      const [
        { data: roles, error: rolesError },
        { data: profiles, error: profilesError },
        { data: permissions, error: permissionsError },
      ] = await Promise.all([
        (supabase as any).from("user_roles").select("user_id,role").in("role", ["staff", "admin"]),
        supabase.from("profiles").select("id,email,full_name,is_active,created_at"),
        (supabase as any).from("staff_permissions").select("user_id,permission"),
      ]);
      const error = rolesError || profilesError || permissionsError;
      if (error) throw error;
      const roleByUser = new Map((roles ?? []).map((role: any) => [role.user_id, role.role]));
      return (profiles ?? [])
        .filter((profile: any) => roleByUser.has(profile.id))
        .map((profile: any) => ({
          ...profile,
          role: roleByUser.get(profile.id),
          permissions: (permissions ?? [])
            .filter((permission: any) => permission.user_id === profile.id)
            .map((permission: any) => permission.permission),
        }));
    },
  });

  const allPermissions = useMemo(
    () => staffPermissionGroups.flatMap((group) => group.permissions.map(([key]) => key)),
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
      await createStaffAccount({
        data: {
          full_name,
          email,
          password,
          role,
          permissions:
            role === "admin" ? [] : accessMode === "full" ? allPermissions : selectedPermissions,
        },
      });
      toast.success(role === "admin" ? "Super Admin account created" : "Staff account created");
      (event.currentTarget as HTMLFormElement).reset();
      setRole("staff");
      setAccessMode("selected");
      setSelectedPermissions(defaultStaffPermissions);
      qc.invalidateQueries({ queryKey: ["staff-management"] });
    } catch (error: any) {
      toast.error(error.message || "Could not create staff");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(staff: any) {
    const next = !staff.is_active;
    const ok = confirm(`${next ? "Enable" : "Disable"} ${staff.full_name || staff.email}?`);
    if (!ok) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: next } as any)
      .eq("id", staff.id);
    if (error) toast.error(error.message);
    else {
      toast.success(next ? "Staff enabled" : "Staff disabled");
      qc.invalidateQueries({ queryKey: ["staff-management"] });
    }
  }

  async function savePermissions(userId: string, permissions: string[]) {
    const existing = data.find((staff: any) => staff.id === userId)?.permissions ?? [];
    const add = permissions.filter((permission) => !existing.includes(permission));
    const remove = existing.filter((permission: string) => !permissions.includes(permission));
    const inserts = add.map((permission) => ({ user_id: userId, permission }));
    const [addResult, removeResult] = await Promise.all([
      inserts.length
        ? (supabase as any).from("staff_permissions").insert(inserts)
        : Promise.resolve({ error: null }),
      remove.length
        ? (supabase as any)
            .from("staff_permissions")
            .delete()
            .eq("user_id", userId)
            .in("permission", remove)
        : Promise.resolve({ error: null }),
    ]);
    const error = addResult.error || removeResult.error;
    if (error) toast.error(error.message);
    else {
      toast.success("Permissions updated");
      qc.invalidateQueries({ queryKey: ["staff-management"] });
    }
  }

  async function resetPassword(userId: string) {
    const password = prompt("Temporary password (8+ characters):");
    if (!password) return;
    try {
      await resetStaffPassword({ data: { user_id: userId, password } });
      toast.success("Password reset");
    } catch (error: any) {
      toast.error(error.message || "Could not reset password");
    }
  }

  if (!auth.isAdmin) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Staff Management is available to Super Admin only.
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Staff Management</h1>
        <p className="text-sm text-muted-foreground">
          Create staff accounts and assign module permissions.
        </p>
      </div>

      <form
        onSubmit={createStaff}
        className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 font-semibold text-navy">
          <Plus className="h-4 w-4" /> Create Staff
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Field name="full_name" label="Full name" />
          <Field name="email" label="Email / login" type="email" />
          <PasswordField name="password" label="Temporary password" autoComplete="new-password" />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-navy">Role</span>
            <select
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value as "staff" | "admin")}
              className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              <option value="staff">Staff</option>
              <option value="admin">Super Admin</option>
            </select>
          </label>
        </div>
        {role === "staff" && (
          <>
            <label className="grid max-w-xs gap-1.5 text-sm">
              <span className="font-medium text-navy">Access Mode</span>
              <select
                value={accessMode}
                onChange={(event) => {
                  const next = event.target.value as "full" | "selected";
                  setAccessMode(next);
                  if (next === "full") setSelectedPermissions(allPermissions);
                }}
                className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              >
                <option value="selected">Selected Access</option>
                <option value="full">Full Access</option>
              </select>
            </label>
            {accessMode === "selected" && (
              <PermissionPicker value={selectedPermissions} onChange={setSelectedPermissions} />
            )}
          </>
        )}
        <button
          disabled={creating}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
        >
          <ShieldCheck className="h-4 w-4" />{" "}
          {creating ? "Creating..." : role === "admin" ? "Create Super Admin" : "Create Staff"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {data.map((staff: any) => (
          <article key={staff.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h2 className="font-semibold text-navy">{staff.full_name || staff.email}</h2>
                <p className="text-sm text-muted-foreground">{staff.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {staff.role === "admin" ? "Super Admin" : "Staff"}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${staff.is_active ? "bg-primary/10 text-primary" : "bg-red-50 text-red-700"}`}
                >
                  {staff.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => resetPassword(staff.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  <KeyRound className="h-4 w-4" /> Reset Access
                </button>
                <button
                  onClick={() => toggleActive(staff)}
                  className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  {staff.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
            <div className="mt-4">
              {staff.role === "admin" ? (
                <div className="rounded-lg border border-border bg-surface p-3 text-sm text-muted-foreground">
                  Super Admin has full access.
                </div>
              ) : (
                <PermissionPicker
                  value={staff.permissions}
                  onChange={(permissions) => savePermissions(staff.id, permissions)}
                  compact
                  allPermissions={allPermissions}
                />
              )}
            </div>
          </article>
        ))}
        {data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No staff accounts yet.
          </div>
        )}
      </div>
    </div>
  );
}

function PermissionPicker({
  value,
  onChange,
  compact,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  compact?: boolean;
  allPermissions?: string[];
}) {
  function toggle(permission: string) {
    const next = value.includes(permission)
      ? value.filter((item) => item !== permission)
      : [...value, permission];
    onChange(next);
  }

  return (
    <div className={`grid gap-3 ${compact ? "md:grid-cols-3" : ""}`}>
      {staffPermissionGroups.map((group) => (
        <div key={group.title} className="rounded-lg border border-border p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.title}
          </div>
          <div className="grid gap-2">
            {group.permissions.map(([permission, label]) => (
              <label key={permission} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value.includes(permission)}
                  onChange={() => toggle(permission)}
                  className="h-4 w-4"
                />
                <span>{label}</span>
                {value.includes(permission) && (
                  <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                )}
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
      <input
        name={name}
        type={type}
        required
        className="rounded-lg border border-border bg-white px-3 py-2.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
    </label>
  );
}
