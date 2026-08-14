import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import {
  Microscope,
  Cpu,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  FlaskConical,
  ScanLine,
  Users,
  ArrowRight,
} from "lucide-react";
import labImg from "@/assets/lab-solder.jpg";
import pcbImg from "@/assets/service-pcb-diagnosis.jpg";
import opticalImg from "@/assets/service-optical-inspection.jpg";
import labTestImg from "@/assets/service-lab-testing.jpg";
import microscopeImg from "@/assets/service-microscope-repair.jpg";
import { settings, phoneHref } from "@/lib/site-data";

export const Route = createFileRoute("/our-infrastructure")({
  head: () => ({
    meta: [
      { title: "Our Infrastructure — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Our technical infrastructure supports careful diagnosis, repair, testing and servicing of critical medical equipment.",
      },
    ],
  }),
  component: Page,
});

const capabilities = [
  {
    Icon: ScanLine,
    title: "Advanced Diagnostic Setup",
    desc: "Calibrated diagnostic instruments used for structured fault identification before repair begins.",
  },
  {
    Icon: Wrench,
    title: "Medical Equipment Repair Facility",
    desc: "Dedicated repair workstations equipped for careful handling of sensitive medical equipment.",
  },
  {
    Icon: Microscope,
    title: "Precision Inspection",
    desc: "Optical and electronic inspection tools support detailed examination of equipment components.",
  },
  {
    Icon: Cpu,
    title: "Component-Level Repair",
    desc: "Board-level and component-level repair capability for complex electronic medical systems.",
  },
  {
    Icon: ShieldCheck,
    title: "Testing & Quality Control",
    desc: "Every repaired unit undergoes functional and safety testing before dispatch.",
  },
  {
    Icon: FlaskConical,
    title: "Technical Workstations",
    desc: "Organised workstations with appropriate tools for different types of medical equipment repair.",
  },
  {
    Icon: CheckCircle2,
    title: "Professional Equipment Handling",
    desc: "Structured processes for receiving, handling, repairing and dispatching medical equipment.",
  },
  {
    Icon: Users,
    title: "Skilled Technical Team",
    desc: "Engineers with focused experience in medical equipment diagnostics, repair and servicing.",
  },
];

const infraImages = [
  { src: labImg, title: "Repair & Service Laboratory", cat: "Facility" },
  { src: pcbImg, title: "Component-Level Diagnostics", cat: "Diagnostics" },
  { src: opticalImg, title: "Precision Optical Inspection", cat: "Inspection" },
  { src: labTestImg, title: "Equipment Testing Bench", cat: "Quality Control" },
  { src: microscopeImg, title: "Scope Repair Workstation", cat: "Repair" },
];

function Page() {
  return (
    <Layout>
      <PageHero
        eyebrow="Our Infrastructure"
        title="Built for Precision Medical Equipment Service"
        subtitle="Our technical infrastructure supports careful diagnosis, repair, testing and servicing of critical medical equipment."
      />

      {/* Capabilities grid */}
      <section className="container-x py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
            Our Technical Capabilities
          </h2>
          <p className="mt-3 text-foreground/70">
            We have built a service environment focused on accurate diagnostics, careful repair
            and reliable quality control for medical equipment.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Infrastructure gallery */}
      <section className="bg-surface">
        <div className="container-x py-16 md:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
              Our Facility
            </h2>
            <p className="mt-3 text-foreground/70">
              A look inside our repair and service environment.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {infraImages.map((img) => (
              <figure
                key={img.title}
                className="group overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {img.cat}
                  </div>
                  <div className="mt-1 font-semibold text-navy">{img.title}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Process highlights */}
      <section className="container-x py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Our Process
            </div>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
              From Receipt to Dispatch
            </h2>
            <p className="mt-4 text-foreground/70">
              Every item that enters our facility goes through a structured process — from initial
              inspection and fault diagnosis through to repair, quality testing and safe dispatch.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Equipment received and logged",
                "Initial inspection and diagnostic review",
                "Quotation provided before work begins",
                "Repair carried out by qualified engineers",
                "Functional and safety testing on completion",
                "Quality sign-off and secure dispatch",
                "Repair documentation provided with each job",
              ].map((pt) => (
                <li key={pt} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  {pt}
                </li>
              ))}
            </ul>
            <Link
              to="/repair-process"
              className="mt-6 inline-flex items-center gap-1.5 font-semibold text-primary hover:text-navy transition"
            >
              View our repair process <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-xl">
            <img
              src={labImg}
              alt="Arise Healthcare Solutions repair laboratory"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface">
        <div className="container-x py-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/15 bg-white p-6 md:p-10 lg:flex-row lg:items-center shadow-sm">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy md:text-3xl">
                Send Your Equipment to Our Facility
              </h2>
              <p className="mt-3 max-w-xl text-foreground/70">
                Contact us to arrange equipment service, get a repair quotation or find out more
                about our capabilities.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                to="/request-repair"
                className="inline-flex items-center gap-2 rounded-2xl btn-primary px-5 py-3 text-sm font-semibold"
              >
                Request Service <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={phoneHref(settings.phonePlaceholder)}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary hover:bg-surface"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
