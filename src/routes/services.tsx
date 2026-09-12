import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { getPublicServices } from "@/lib/service-content";
import { getServiceCarouselImages } from "@/lib/site-data";
import { useServicesRealtime } from "@/hooks/useServicesRealtime";
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
  useServicesRealtime();
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
          {services.map((s) => {
            const cardImage = s.heroImages?.length ? getServiceCarouselImages(s)[0] : null;

            return (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:border-gold-border hover:shadow-xl ${
                  cardImage ? "border border-gold-border shadow-soft" : "gold-card"
                }`}
              >
                {cardImage ? (
                  <>
                    <img
                      src={cardImage.src}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-neutral-950/50" aria-hidden="true" />
                  </>
                ) : null}
                <h3 className={`relative text-lg font-semibold ${cardImage ? "text-white" : "text-navy"}`}>
                  {s.name}
                </h3>
                <p className={`relative mt-2 flex-1 text-sm ${cardImage ? "text-white/90" : "text-foreground"}`}>
                  {s.short}
                </p>
                <span
                  className={`relative mt-4 inline-flex items-center gap-1 font-semibold ${
                    cardImage ? "text-white" : "text-primary"
                  }`}
                >
                  View Service <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
