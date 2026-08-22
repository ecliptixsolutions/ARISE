import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { repairStatusLabels } from "@/lib/site-data";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Search, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/track-repair")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ code: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Track Your Repair — Arise Healthcare Solutions" },
      {
        name: "description",
        content: "Track the status of your medical equipment repair request.",
      },
      { property: "og:title", content: "Track Repair" },
      {
        property: "og:description",
        content: "Enter your request ID and contact to view current repair status.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const search = useSearch({ from: "/track-repair" });
  const [code, setCode] = useState(search.code ?? "");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  async function look() {
    if (!code || !contact) {
      toast.error("Enter request ID and mobile / email");
      return;
    }
    setLoading(true);
    setData(null);
    setHistory([]);
    const { data: rows, error } = await supabase.rpc("track_repair", {
      _code: code.trim(),
      _contact: contact.trim(),
    });
    if (error) {
      setLoading(false);
      console.error("[Track repair lookup failed]", error);
      toast.error("Unable to check your request right now. Please try again.");
      return;
    }
    if (!rows || rows.length === 0) {
      setLoading(false);
      toast.error("No matching request. Check your details.");
      return;
    }
    const { data: hRows, error: hError } = await supabase.rpc("track_repair_history", {
      _code: code.trim(),
      _contact: contact.trim(),
    });
    if (hError) {
      console.error("[Track repair history failed]", hError);
      toast.error("Unable to load the status timeline right now.");
    }
    setLoading(false);
    setData(rows[0]);
    setHistory(hRows ?? []);
  }

  return (
    <Layout>
      <PageHero
        eyebrow="Track"
        title="Track Your Repair Request"
        subtitle="Enter your request ID plus the mobile or email used at submission."
      />
      <section className="container-x mx-auto max-w-3xl py-14">
        <div className="rounded-3xl blue-panel p-6">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Request ID (e.g. AR-2026-XXXXX)"
              className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Registered mobile or email"
              className="rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <button
              onClick={look}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl btn-primary px-5 py-3 text-sm font-semibold disabled:opacity-70"
            >
              <Search className="h-4 w-4" /> {loading ? "Looking..." : "Track"}
            </button>
          </div>
        </div>

        {data && (
          <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Request
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-navy">
              {data.request_code}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Info
                label="Equipment"
                value={`${data.equipment_name}${data.brand ? " · " + data.brand : ""}`}
              />
              <Info label="Customer" value={data.full_name} />
              <Info
                label="Current status"
                value={
                  (
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                      {repairStatusLabels[data.status]}
                    </span>
                  ) as any
                }
              />
              <Info label="Last updated" value={new Date(data.updated_at).toLocaleString()} />
            </div>
            {data.customer_visible_note && (
              <div className="mt-4 rounded-lg bg-surface p-4 text-sm">
                <strong>Latest update:</strong> {data.customer_visible_note}
              </div>
            )}
            <div className="mt-6">
              <h3 className="font-display text-base font-semibold text-navy">Status Timeline</h3>
              <ol className="mt-3 space-y-3">
                {(history.length > 0
                  ? history
                  : [{ status: data.status, note: null, created_at: data.created_at }]
                ).map((h: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-navy">
                        {repairStatusLabels[h.status]}
                      </div>
                      {h.note && <div className="text-xs text-muted-foreground">{h.note}</div>}
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(h.created_at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-navy">{value}</div>
    </div>
  );
}
