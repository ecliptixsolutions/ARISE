import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import {
  Users,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Microscope,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import { phoneHref, settings, whatsappHref } from "@/lib/site-data";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/why-us")({
  head: () => ({
    meta: [
      { title: "Why Choose Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Discover why healthcare facilities trust Arise Healthcare Solutions for medical equipment repair, servicing and technical support.",
      },
    ],
  }),
  component: Page,
});

const reasons = [
  {
    Icon: Users,
    title: "Experienced Technical Team",
    desc: "Our engineers bring focused experience in medical equipment diagnostics and repair, applying structured processes to each service job.",
  },
  {
    Icon: Microscope,
    title: "Medical Equipment Expertise",
    desc: "We specialise in endoscopy systems, rigid and flexible scopes, and a broad range of critical medical devices used across healthcare facilities.",
  },
  {
    Icon: Wrench,
    title: "Multi-Brand Equipment Support",
    desc: "We service equipment from a wide range of leading medical equipment brands, helping facilities avoid brand-specific service lock-in.",
  },
  {
    Icon: ShieldCheck,
    title: "Quality-Controlled Repairs",
    desc: "Every repair follows documented quality checks and functional testing before equipment is returned, so facilities receive equipment that performs reliably.",
  },
  {
    Icon: Clock,
    title: "Reliable Turnaround",
    desc: "We manage repair timelines carefully and keep customers informed throughout the service process to reduce equipment downtime.",
  },
  {
    Icon: FileText,
    title: "Transparent Service",
    desc: "Clear quotations, documented repair records and straightforward communication — no hidden charges and no surprises at the end of the process.",
  },
  {
    Icon: HeartPulse,
    title: "Technical Diagnosis",
    desc: "We perform structured fault analysis before recommending repairs, ensuring the identified issue is correctly addressed at the right level.",
  },
  {
    Icon: CheckCircle2,
    title: "Professional Customer Support",
    desc: "Our team is accessible throughout the repair process and provides clear service reports with each completed job.",
  },
];

function Page() {
  return (
    <Layout>
      <PageHero
        eyebrow="Why Arise"
        title="Why Healthcare Facilities Choose Arise"
        subtitle="Professional medical equipment repair, servicing and technical support designed to keep critical healthcare equipment reliable and ready for use."
      />

      {/* Reasons grid */}
      <section className="container-x py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ Icon, title, desc }) => (
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

      {/* Stats strip */}
      <section className="bg-[#0b2233]">
        <div className="container-x py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { v: "8+", l: "Years of Experience" },
              { v: "10+", l: "Engineers & Experts" },
              { v: "2,000+", l: "Products & Services" },
              { v: "98.8%", l: "First-Fix Success Rate" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="font-display text-4xl font-extrabold text-[#18b9bb] md:text-5xl">
                  {v}
                </div>
                <div className="mt-1.5 text-sm font-medium text-white/55">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust points */}
      <section className="bg-surface">
        <div className="container-x py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
              Our Commitment to Healthcare Facilities
            </h2>
            <p className="mt-4 text-foreground/70">
              We understand that medical equipment is critical infrastructure for healthcare
              delivery. Our service approach is built around precision, reliability and
              clear communication at every stage.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Structured fault diagnosis before repair",
                "Component-level repair where applicable",
                "Documented quality testing on completion",
                "Clear repair reports with each job",
                "3-month warranty on applicable repairs",
                "Honest quotations with no hidden costs",
                "Regular status updates during service",
                "Professional handling of all equipment",
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground/80">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="container-x py-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/15 bg-surface p-6 md:p-10 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy md:text-3xl">
                Need Reliable Medical Equipment Support?
              </h2>
              <p className="mt-3 max-w-xl text-foreground/70">
                Talk to our team about your equipment repair, servicing or technical support
                requirements.
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
                Call Us Now
              </a>
              <a
                href={whatsappHref()}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-emerald-50"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
