import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { qualityChecks } from "@/lib/site-data";
import { CheckCircle2 } from "lucide-react";
import labImg from "@/assets/lab-solder.jpg";

export const Route = createFileRoute("/quality")({
  head: () => ({
    meta: [
      { title: "Quality & Diagnostic Laboratory — Arise Healthcare Solutions" },
      { name: "description", content: "Our quality-controlled diagnostic laboratory ensures every repair is tested before dispatch." },
      { property: "og:title", content: "Quality & Diagnostic Laboratory" },
      { property: "og:description", content: "Micro-soldering, PCB diagnosis, optical inspection, leakage and safety testing." },
    ],
  }),
  component: () => (
    <Layout>
      <PageHero eyebrow="Quality" title="Diagnostic Laboratory & Quality Testing" subtitle="Calibrated instruments and disciplined workflows for reliable repair outcomes." />
      <section className="container-x grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-3xl border border-border shadow-xl">
          <img src={labImg} alt="Diagnostic laboratory" className="h-full w-full object-cover" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Our Quality Process</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {qualityChecks.map((q) => (<li key={q} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> {q}</li>))}
          </ul>
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
            We do not display ISO or other certifications without valid uploaded proof. Any certification shown on this site is uploaded and approved from the admin panel.
          </div>
        </div>
      </section>
    </Layout>
  ),
});
