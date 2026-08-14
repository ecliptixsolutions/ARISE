import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { getPublicServices } from "@/lib/service-content";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  loader: () => getPublicServices(),
  head: () => ({
    meta: [
      { title: "Medical Equipment Repair Services — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Full-service repair for endoscopy and biomedical equipment — component-level, transparent, quality-controlled.",
      },
      { property: "og:title", content: "Our Services" },
      {
        property: "og:description",
        content: "Endoscope, camera head, processor, PCB and medical equipment repair services.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const location = useLocation();
  const services = Route.useLoaderData();
  if (location.pathname !== "/services") return <Outlet />;

  return (
    <Layout>
      <PageHero
        eyebrow="Services"
        title="Medical Equipment Repair Services"
        subtitle="Focused expertise across endoscopy, imaging, surgical and diagnostic equipment."
      />
      <section className="container-x py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group flex flex-col rounded-3xl gold-card p-6 transition hover:-translate-y-1 hover:border-gold-border hover:shadow-xl"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {s.category}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-navy">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm text-foreground">{s.short}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-semibold text-primary">
                View Service <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
