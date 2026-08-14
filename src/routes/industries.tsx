import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { industries } from "@/lib/site-data";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — Arise Healthcare Solutions" },
      { name: "description", content: "Hospitals, clinics, endoscopy centres, diagnostic centres, medical colleges and healthcare organisations we support." },
      { property: "og:title", content: "Industries We Serve" },
      { property: "og:description", content: "Trusted by healthcare organisations across India." },
    ],
  }),
  component: () => (
    <Layout>
      <PageHero eyebrow="Industries" title="Who We Serve" subtitle="Trusted repair support for healthcare providers of every size." />
      <section className="container-x py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((i) => (
            <div key={i.name} className="flex gap-3 rounded-2xl border border-border bg-card p-6">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
              <div><div className="font-semibold text-navy">{i.name}</div><p className="mt-1 text-sm text-foreground/70">{i.desc}</p></div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  ),
});
