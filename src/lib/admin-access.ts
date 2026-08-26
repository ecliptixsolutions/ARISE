import {
  Bell,
  LayoutDashboard,
  MessageSquare,
  Server,
  Settings,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type AdminContext = {
  isAdmin?: boolean;
  permissions?: string[];
};

export type AdminNavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
  permission?: string;
  adminOnly?: boolean;
};

export const staffPermissionGroups = [
  {
    title: "Core",
    permissions: [
      ["dashboard", "Dashboard"],
      ["repair_requests", "Repair Requests"],
      ["repair_details", "Repair Request Details"],
      ["notifications", "Notifications"],
      ["tracking", "Tracking"],
    ],
  },
  {
    title: "Repair Workflow",
    permissions: [
      ["update_status", "Update Status"],
      ["update_location", "Update Location"],
      ["update_inspection", "Update Inspection"],
      ["update_repair_progress", "Update Repair Progress"],
      ["quality_testing", "Quality Testing"],
      ["dispatch", "Dispatch"],
    ],
  },
  {
    title: "Data",
    permissions: [
      ["import_csv", "Import CSV"],
      ["import_excel", "Import Excel"],
      ["export_csv", "Export CSV"],
      ["export_excel", "Export Excel"],
    ],
  },
  {
    title: "Admin Modules",
    permissions: [
      ["enquiries", "Enquiries"],
      ["services", "Services"],
      ["orders", "Orders"],
      ["testimonials", "Testimonials"],
    ],
  },
] as const;

export const defaultStaffPermissions = [
  "dashboard",
  "repair_requests",
  "repair_details",
  "update_status",
  "update_location",
  "update_repair_progress",
  "notifications",
];

export const adminNavItems: AdminNavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true, permission: "dashboard" },
  { to: "/admin/tracking", icon: Truck, label: "Tracking", permission: "tracking" },
  { to: "/admin/services", icon: Server, label: "Services", permission: "services" },
  {
    to: "/admin/repair-requests",
    icon: Wrench,
    label: "Repair Requests",
    permission: "repair_requests",
  },
  { to: "/admin/orders", icon: Bell, label: "Orders", permission: "orders" },
  { to: "/admin/enquiries", icon: MessageSquare, label: "Enquiries", permission: "enquiries" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications", permission: "notifications" },
  { to: "/admin/testimonials", icon: Star, label: "Testimonials", permission: "testimonials" },
  { to: "/admin/staff", icon: ShieldCheck, label: "Staff", adminOnly: true },
  { to: "/admin/settings", icon: Settings, label: "Settings", adminOnly: true },
];

export function canAccessAdminItem(ctx: AdminContext, item: AdminNavItem) {
  if (ctx.isAdmin) return true;
  if (item.adminOnly) return false;
  return !item.permission || ctx.permissions?.includes(item.permission);
}

export function hasPermission(ctx: AdminContext, permission: string) {
  return Boolean(ctx.isAdmin || ctx.permissions?.includes(permission));
}
