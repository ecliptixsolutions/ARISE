import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import {
  Building2,
  Stethoscope,
  FlaskConical,
  Microscope,
  Heart,
  Syringe,
  TestTube,
  School,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { settings, phoneHref, whatsappHref } from "@/lib/site-data";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/our-clients")({
  head: () => ({
    meta: [
      { title: "Our Clients — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Arise Healthcare Solutions supports hospitals, clinics, diagnostic centres and healthcare institutions with medical equipment repair and servicing.",
      },
    ],
  }),
  component: Page,
});

const clientTypes = [
  {
    Icon: Building2,
    title: "Hospitals",
    desc: "We support multi-specialty and single-specialty hospitals with endoscopy system repair, medical equipment servicing and ongoing technical support to minimise equipment downtime.",
  },
  {
    Icon: Stethoscope,
    title: "Clinics",
    desc: "Small to medium clinics rely on us for reliable medical equipment repair and servicing, keeping their essential diagnostic and treatment equipment operational.",
  },
  {
    Icon: FlaskConical,
    title: "Diagnostic Centres",
    desc: "Diagnostic centres trust us for precise equipment repair and calibration support, helping maintain the quality and reliability of their diagnostic systems.",
  },
  {
    Icon: Microscope,
    title: "Surgical Centres",
    desc: "Surgical centres working with laparoscopy, arthroscopy and rigid scope equipment use our services to keep their instrumentation in peak operational condition.",
  },
  {
    Icon: Heart,
    title: "Endoscopy Centres",
    desc: "Dedicated endoscopy centres benefit from our specialist repair capability for flexible and rigid endoscope systems, camera heads, processors and light sources.",
  },
  {
    Icon: Syringe,
    title: "Urology Centres",
    desc: "We support urology departments with repair and servicing for nephroscopes, ureteroscopes, cystoscopes and associated equipment.",
  },
  {
    Icon: TestTube,
    title: "Medical Laboratories",
    desc: "Medical laboratories partner with us for technical support and equipment repair to maintain reliable laboratory operations.",
  },
  {
    Icon: School,
    title: "Healthcare Institutions",
    desc: "Medical colleges, training institutions and healthcare organisations use our services for equipment maintenance, repair and technical support.",
  },
];

const trustPoints = [
  "Clear quotation before any repair work begins",
  "Regular updates throughout the service process",
  "Documented repair reports with every completed job",
  "3-month warranty on applicable repairs",
  "Professional and respectful handling of all equipment",
  "Experienced team focused on medical equipment",
];

function Page() {
  return (
    <Layout>
      <PageHero
        eyebrow="Our Clients"
        title="Trusted by Healthcare Teams"
        subtitle="Arise Healthcare Solutions supports healthcare facilities and medical teams with dependable equipment repair, servicing and technical support."
      />

      {/* Client types grid */}
      <section className="container-x py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
            Who We Support
          </h2>
          <p className="mt-3 text-foreground/70">
            We work with a range of healthcare organisations across different specialties and
            facility types, providing consistent and reliable medical equipment service.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {clientTypes.map(({ Icon, title, desc }) => (
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

      {/* What clients can expect */}
      <section className="bg-surface">
        <div className="container-x py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Our Commitment
              </div>
              <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
                What Healthcare Facilities Can Expect
              </h2>
              <p className="mt-4 text-foreground/70">
                Every facility we work with receives the same professional, reliable and
                transparent service — regardless of size or speciality.
              </p>
              <ul className="mt-6 space-y-3">
                {trustPoints.map((pt) => (
                  <li key={pt} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground/80">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {/* Testimonials highlight */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  Client Feedback
                </div>
                <p className="text-sm leading-relaxed text-foreground/75">
                  &ldquo;Arise Healthcare Solutions repaired our endoscope efficiently and returned
                  it in excellent working condition. The communication throughout was clear and
                  professional.&rdquo;
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="font-semibold text-navy">Biomedical Department</div>
                  <div className="text-xs text-muted-foreground">Multi-specialty Hospital · Gujarat</div>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  Client Feedback
                </div>
                <p className="text-sm leading-relaxed text-foreground/75">
                  &ldquo;The team handled our nephroscope repair professionally. The repair report
                  was detailed and the equipment has been performing well since returning to
                  service.&rdquo;
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="font-semibold text-navy">Clinical Team</div>
                  <div className="text-xs text-muted-foreground">Urology Centre · India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands note */}
      <section className="container-x py-12">
        <div className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Multi-Brand Support
          </div>
          <h3 className="font-display text-xl font-bold text-navy">
            We Service Equipment from Leading Medical Brands
          </h3>
          <p className="mt-3 text-foreground/70 max-w-3xl">
            Arise Healthcare Solutions supports equipment from a wide range of medical equipment
            manufacturers including Olympus, KARL STORZ, Richard Wolf, Fujifilm, PENTAX Medical,
            Stryker, Aesculap, B. Braun and many others. Our independent service capability means
            facilities are not restricted to a single brand's service network.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface">
        <div className="container-x py-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/15 bg-white p-6 md:p-10 lg:flex-row lg:items-center shadow-sm">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy md:text-3xl">
                Looking for Reliable Equipment Support?
              </h2>
              <p className="mt-3 max-w-xl text-foreground/70">
                Contact our team to discuss your medical equipment repair or servicing
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
