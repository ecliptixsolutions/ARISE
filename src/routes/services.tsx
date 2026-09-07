import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { getPublicServices } from "@/lib/service-content";
import { useServicesRealtime } from "@/hooks/useServicesRealtime";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import arthroscopeRepair from "@/assets/service-card-backgrounds/arthroscope-repair.png";
import cameraHeadRepair from "@/assets/service-card-backgrounds/camera-head-repair.png";
import co2InsufflatorRepair from "@/assets/service-card-backgrounds/co2-insufflator-repair.png";
import cystoscopeRepair from "@/assets/service-card-backgrounds/cystoscope-repair.png";
import diathermyRepair from "@/assets/service-card-backgrounds/diathermy-repair.png";
import laparoscopeRepair from "@/assets/service-card-backgrounds/laparoscope-repair.png";
import lightFiberRepair from "@/assets/service-card-backgrounds/light-fiber-repair.png";
import lightSourceRepair from "@/assets/service-card-backgrounds/light-source-repair.png";
import patientMonitorRepair from "@/assets/service-card-backgrounds/patient-monitor-repair.png";
import ultrasoundRepair from "@/assets/service-card-backgrounds/ultrasound-repair.png";
import ureteroscopeRepair from "@/assets/service-card-backgrounds/ureteroscope-repair.png";
import ventilatorRepair from "@/assets/service-card-backgrounds/ventilator-repair.png";

const serviceCardBackgrounds: Record<string, string> = {
  "flexible-scope-repair": lightFiberRepair,
  "ureteroscope-repair": ureteroscopeRepair,
  "cystoscope-repair": cystoscopeRepair,
  "laparoscope-repair": laparoscopeRepair,
  "arthroscope-repair": arthroscopeRepair,
  "camera-head-repair": cameraHeadRepair,
  "light-source-repair": lightSourceRepair,
  "co2-insufflator-repair": co2InsufflatorRepair,
  "diathermy-electrosurgical-unit-repair": diathermyRepair,
  "patient-monitor-repair": patientMonitorRepair,
  "ultrasound-equipment-service": ultrasoundRepair,
  "ventilator-and-other-medical-equipment-repair": ventilatorRepair,
};

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
            const background = serviceCardBackgrounds[s.slug];

            return (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className={cn(
                  "group relative flex flex-col rounded-3xl gold-card p-6 transition hover:-translate-y-1 hover:border-gold-border hover:shadow-xl",
                  background && "overflow-hidden border-white/20 bg-navy",
                )}
              >
                {background && (
                  <>
                    <img
                      src={background}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/60 to-primary/35"
                    />
                  </>
                )}
                <h3 className={cn("relative text-lg font-semibold text-navy", background && "text-white")}>
                  {s.name}
                </h3>
                <p className={cn("relative mt-2 flex-1 text-sm text-foreground", background && "text-white/90")}>
                  {s.short}
                </p>
                <span
                  className={cn(
                    "relative mt-4 inline-flex items-center gap-1 font-semibold text-primary",
                    background && "text-white",
                  )}
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
