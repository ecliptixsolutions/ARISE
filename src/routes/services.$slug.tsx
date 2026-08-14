import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ServiceImageCarousel } from "@/components/site/ServiceImageCarousel";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { getPublicServiceBySlug, getPublicServices } from "@/lib/service-content";
import {
  findServiceBySlug,
  getServiceCarouselImages,
  phoneHref,
  serviceImages,
  settings,
  whatsappHref,
} from "@/lib/site-data";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Beaker,
  Cpu,
  Microscope,
  Phone,
  ShieldCheck,
  Timer,
  Wrench,
} from "lucide-react";

const processSteps = [
  "Equipment inspection",
  "Fault diagnosis",
  "Repair quotation",
  "Component-level repair",
  "Functional and quality testing",
  "Equipment delivery",
];

const serviceWhyChoose = [
  {
    title: "Specialised Technical Expertise",
    desc: "Focused repair support for endoscopy, imaging and biomedical equipment.",
    icon: Cpu,
  },
  {
    title: "Advanced Diagnostic Tools",
    desc: "Structured inspection using appropriate diagnostic and optical tools.",
    icon: Microscope,
  },
  {
    title: "Component & Board-Level Capability",
    desc: "Repair support can include micro-soldering and electronic component checks.",
    icon: Beaker,
  },
  {
    title: "Multi-Brand Equipment Support",
    desc: "Support depends on equipment type, brand, model and parts availability.",
    icon: Award,
  },
  {
    title: "Quality-Controlled Testing",
    desc: "Functional and image-quality checks are completed before delivery.",
    icon: ShieldCheck,
  },
  {
    title: "Repair Warranty Available",
    desc: "Warranty availability is confirmed with the repair scope and quotation.",
    icon: BadgeCheck,
  },
  {
    title: "Quick Turnaround Support",
    desc: "The team prioritises clear updates and practical next steps.",
    icon: Timer,
  },
];

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const allServices = await getPublicServices();
    const service =
      findServiceBySlug(allServices, params.slug) ?? (await getPublicServiceBySlug(params.slug));
    if (!service) throw notFound();
    return { service, allServices };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.service.name} - Arise Healthcare Solutions` },
          { name: "description", content: loaderData.service.short },
          { property: "og:title", content: loaderData.service.name },
          { property: "og:description", content: loaderData.service.short },
        ]
      : [],
    links: loaderData
      ? [
          {
            rel: "preload",
            as: "image",
            href: getServiceCarouselImages(loaderData.service)[0]?.src ?? serviceImages[0].src,
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <Layout>
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-navy">Service not found</h1>
        <Link to="/services" className="mt-4 inline-flex items-center gap-1 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>
      </div>
    </Layout>
  ),
  errorComponent: ({ error }) => (
    <Layout>
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-navy">Error</h1>
        <p className="mt-2 text-foreground/70">{error.message}</p>
      </div>
    </Layout>
  ),
  component: Page,
});

function Page() {
  const { service, allServices } = Route.useLoaderData();
  const images = getServiceCarouselImages(service);
  const requestSearch = { service: service.name } as any;

  return (
    <Layout>
      <section className="relative overflow-hidden grad-navy">
        <div
          className="absolute right-10 top-10 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="container-x py-10 md:py-14">
          <Link
            to="/services"
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-surface"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {service.category}
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold text-navy md:text-4xl lg:text-5xl">
                {service.name}
              </h1>
              <p className="mt-4 max-w-xl text-foreground">{service.short}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {serviceWhyChoose.slice(0, 4).map(({ title }) => (
                  <span
                    key={title}
                    className="rounded-full border border-gold-border/70 bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-text"
                  >
                    {title}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/request-repair"
                  search={requestSearch}
                  className="inline-flex items-center gap-2 rounded-2xl btn-primary px-5 py-3 text-sm font-semibold hover:-translate-y-0.5"
                >
                  Request a Repair <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappHref(`Hello Arise, I have an enquiry about ${service.name}.`)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-emerald-50"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp Our Expert
                </a>
              </div>
            </div>
            <ServiceImageCarousel images={images} />
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">About the Service</h2>
            <p className="mt-3 text-foreground/75">{service.detailedDescription}</p>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-navy">Common Problems We Repair</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {service.commonProblems.map((problem) => (
                <div
                  key={problem}
                  className="flex items-start gap-3 rounded-2xl border border-gold-border/60 bg-gold-soft p-4 shadow-sm"
                >
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground/80">{problem}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-navy">Repair Process</h2>
            <ol className="mt-4 grid gap-3">
              {processSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <span className="mt-0.5 text-sm text-foreground/80">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-navy">
              Why Choose Arise Healthcare Solutions
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {serviceWhyChoose.map(({ title, desc, icon: Icon }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-navy">{title}</div>
                    <p className="mt-0.5 text-xs text-foreground/70">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-3xl cta-gold p-8">
            <div className="mb-2 inline-flex rounded-full border border-gold-border/70 bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-text">
              Repair Support
            </div>
            <h2 className="font-display text-2xl font-semibold text-navy">
              Need Assistance With This Equipment?
            </h2>
            <p className="mt-3 max-w-xl text-foreground">
              Contact our team for expert repair support.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/request-repair"
                search={requestSearch}
                className="inline-flex items-center gap-2 rounded-2xl btn-primary px-5 py-3 text-sm font-semibold"
              >
                Request a Repair <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={phoneHref(settings.phonePlaceholder)}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary hover:bg-white/80"
              >
                <Phone className="h-4 w-4" /> Call Our Repair Expert
              </a>
              <a
                href={whatsappHref(`Hello Arise, I have an enquiry about ${service.name}.`)}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-emerald-50"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-surface hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>

          <div className="rounded-3xl cta-gold p-6">
            <h3 className="font-display text-lg font-semibold text-navy">Request This Repair</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Repair feasibility depends on inspection, parts availability and equipment condition.
            </p>
            <Link
              to="/request-repair"
              search={requestSearch}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl btn-primary py-3 text-sm font-semibold"
            >
              Start Request <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref(`Hello Arise, I have an enquiry about ${service.name}.`)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gold-border/70 bg-white/65 py-3 text-sm font-semibold hover:bg-white"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp Us
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-base font-semibold text-navy">Other Services</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {allServices
                .filter((item) => item.slug !== service.slug)
                .slice(0, 6)
                .map((item) => (
                  <li key={item.slug}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: item.slug }}
                      className="text-foreground/80 hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </section>
    </Layout>
  );
}
