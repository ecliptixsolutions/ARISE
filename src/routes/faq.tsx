import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { faqs } from "@/lib/site-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Arise Healthcare Solutions" },
      { name: "description", content: "Frequently asked questions about medical equipment repair, warranty, brands and turnaround." },
      { property: "og:title", content: "Frequently Asked Questions" },
      { property: "og:description", content: "Answers to common questions about our repair services." },
    ],
  }),
  component: () => (
    <Layout>
      <PageHero eyebrow="Support" title="Frequently Asked Questions" showBack />
      <section className="container-x mx-auto max-w-3xl py-14">
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="cursor-pointer list-none font-semibold text-navy">{f.q}</summary>
              <p className="mt-3 text-sm text-foreground/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Layout>
  ),
});
