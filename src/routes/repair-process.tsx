import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { process } from "@/lib/site-data";

export const Route = createFileRoute("/repair-process")({
  head: () => ({
    meta: [
      { title: "Our Repair Process — Arise Healthcare Solutions" },
      { name: "description", content: "A six-step repair process built for transparency, precision and quality control." },
      { property: "og:title", content: "Repair Process" },
      { property: "og:description", content: "From request to dispatch — how Arise Healthcare Solutions repairs medical equipment." },
    ],
  }),
  component: () => (
    <Layout>
      <PageHero eyebrow="Process" title="Our Six-Step Repair Process" subtitle="Structured, transparent and communicated at every stage." />
      <section className="container-x py-14">
        <ol className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {process.map((p) => (
            <li key={p.step} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl grad-blue text-lg font-bold text-white">{p.step}</div>
              <h3 className="mt-4 text-lg font-semibold text-navy">{p.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{p.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  ),
});
