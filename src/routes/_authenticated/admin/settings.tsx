import { createFileRoute } from "@tanstack/react-router";
import { Bell, Building2, Shield, UserRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: Page,
});

function Page() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy">Settings</h1>
      <p className="text-sm text-muted-foreground">Admin configuration areas for future rollout.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          { icon: UserRound, title: "Admin Profile", body: "Manage account name, email and password from Supabase Auth." },
          { icon: Building2, title: "Business Information", body: "Central place for company contact details and service hours." },
          { icon: Bell, title: "Notification Preferences", body: "Configure browser alerts and unread notification behaviour." },
          { icon: Shield, title: "Security", body: "Admin access is restricted through Supabase roles and RLS policies." },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title} className="rounded-2xl border border-border bg-card p-5">
            <Icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-semibold text-navy">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
