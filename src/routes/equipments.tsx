import { createFileRoute, Link, Outlet, useLocation, useSearch } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { equipments, equipmentCategories } from "@/lib/site-data";
import { Search, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/equipments")({
  validateSearch: (s: Record<string, unknown>) => z.object({ q: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "All Medical Equipment We Repair — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Search and browse the full range of medical equipment we repair — endoscopes, camera heads, processors, monitors, ultrasound and more.",
      },
      { property: "og:title", content: "All Medical Equipment We Repair" },
      {
        property: "og:description",
        content: "Endoscopes, camera heads, processors, light sources, monitors and more.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const location = useLocation();
  const search = useSearch({ from: "/equipments" });
  const [q, setQ] = useState(search.q ?? "");
  const [cat, setCat] = useState<string>(
    search.q && equipmentCategories.includes(search.q) ? search.q : "All",
  );

  const filtered = useMemo(() => {
    return equipments.filter((e) => {
      const matchQ =
        !q || `${e.name} ${e.category} ${e.short}`.toLowerCase().includes(q.toLowerCase());
      const matchCat =
        cat === "All" || e.category === cat || e.name.toLowerCase().includes(cat.toLowerCase());
      return matchQ && matchCat;
    });
  }, [q, cat]);

  if (location.pathname !== "/equipments") return <Outlet />;

  return (
    <Layout>
      <PageHero
        eyebrow="Equipment"
        title="All Medical Equipment We Repair"
        subtitle="Search and filter across our full equipment portfolio. Every card links to detailed capabilities and a repair request form."
      />
      <section className="container-x py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search equipment, category, brand..."
              className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
          >
            <option>All</option>
            {["Endoscopy", "Imaging", "Displays", "Surgical", "Diagnostics", "Critical Care"].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
            {equipmentCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted-foreground">
            No equipment matched. Try another search or category.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <div
                key={e.slug}
                className="group overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <Link to="/equipments/$slug" params={{ slug: e.slug }} className="block">
                  <div className="aspect-[16/10] overflow-hidden bg-surface">
                    <img
                      src={e.image}
                      alt={e.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-5 transition group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {e.category}
                    </div>
                    <span className="rounded-full border border-gold-border/70 bg-gold-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-text">
                      Repair Available
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-navy">{e.name}</h3>
                  <p className="mt-2 text-sm text-foreground">{e.short}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider">
                    <span className="rounded-full bg-surface px-2.5 py-1 text-primary">
                      Service Available
                    </span>
                    <span className="rounded-full bg-gold-soft px-2.5 py-1 text-gold-text">
                      Warranty Available
                    </span>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <Link
                      to="/equipments/$slug"
                      params={{ slug: e.slug }}
                      className="inline-flex items-center justify-center gap-1 rounded-2xl border border-primary/25 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-surface"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to="/request-repair"
                      search={{ equipment: e.slug } as any}
                      className="rounded-2xl btn-primary px-3 py-2 text-center text-sm font-semibold"
                    >
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          Supported equipment brands are managed and updated through the admin panel. Original
          manufacturer trademarks belong to their respective owners; Arise Healthcare Solutions is
          an independent repair service unless authorised partnerships are declared.
        </div>
      </section>
    </Layout>
  );
}
