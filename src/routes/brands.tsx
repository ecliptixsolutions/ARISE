import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { ArrowRight } from "lucide-react";
import { settings, phoneHref, whatsappHref } from "@/lib/site-data";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands We Service — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Arise Healthcare Solutions provides professional repair and servicing for medical equipment and endoscopy systems from leading global brands including Olympus, KARL STORZ, Richard Wolf, Stryker and more.",
      },
    ],
  }),
  component: Page,
});

const brandGroups = [
  {
    heading: "Flexible Endoscopy",
    brands: ["Olympus", "Fujifilm", "PENTAX Medical", "Ambu", "Boston Scientific", "Medtronic", "CONMED"],
  },
  {
    heading: "Rigid Endoscopy & Laparoscopy",
    brands: ["KARL STORZ", "Richard Wolf", "Stryker", "Smith+Nephew", "Arthrex", "Aesculap", "B. Braun", "SCHÖLLY", "RZ Medizintechnik", "Ackermann"],
  },
  {
    heading: "Urology & Nephroscopy",
    brands: ["HOYA", "PENTAX Medical", "KARL STORZ", "Olympus", "Stryker", "Aesculap", "B. Braun", "SCHÖLLY", "RZ Medizintechnik", "Ackermann"],
  },
  {
    heading: "Other Medical Equipment",
    brands: ["Dräger", "GE HealthCare", "Philips", "Mindray", "Siemens Healthineers", "Nihon Kohden", "Getinge", "Hillrom", "Baxter", "STERIS"],
  },
];

// Unique full list for the hero grid
const allBrands = [
  "Olympus", "KARL STORZ", "Richard Wolf", "Fujifilm", "PENTAX Medical",
  "Stryker", "Aesculap", "B. Braun", "SCHÖLLY", "RZ Medizintechnik",
  "Ackermann", "Smith+Nephew", "Arthrex", "Ambu", "HOYA",
  "Dräger", "GE HealthCare", "Philips", "Mindray", "Siemens Healthineers",
  "Nihon Kohden", "Getinge", "Hillrom", "Baxter", "STERIS",
  "Boston Scientific", "Medtronic", "CONMED",
];

function Page() {
  return (
    <Layout>
      <PageHero
        eyebrow="Brands We Service"
        title="Medical Equipment Brands We Service"
        subtitle="Arise Healthcare Solutions provides professional repair and servicing solutions for medical equipment and endoscopy systems from leading global brands."
      />

      {/* Brand pills grid */}
      <section className="container-x py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-foreground/70 text-sm">
            We service equipment from a wide range of leading medical equipment manufacturers.
            All brand names and trademarks are the property of their respective owners.
            Arise Healthcare Solutions is an independent service provider and is not
            affiliated with, authorised by or endorsed by any of the manufacturers listed below
            unless explicitly stated.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {allBrands.map((brand) => (
            <span
              key={brand}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Grouped sections */}
      <section className="bg-surface">
        <div className="container-x py-14 md:py-16">
          <h2 className="font-display mb-10 text-3xl font-bold text-navy md:text-4xl">
            Brands by Category
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {brandGroups.map(({ heading, brands }) => (
              <div key={heading} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  {heading}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-navy"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer + CTA */}
      <section className="container-x py-14">
        <div className="mb-8 rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Important Notice
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">
            All brand names, trademarks and logos mentioned are the property of their respective
            owners. Arise Healthcare Solutions is an independent medical equipment repair and
            servicing company. References to specific brands indicate equipment we have experience
            servicing, not any form of official partnership, authorisation or endorsement unless
            explicitly documented.
          </p>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/15 bg-surface p-6 md:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy md:text-3xl">
              Need Service for Your Medical Equipment?
            </h2>
            <p className="mt-2 max-w-xl text-foreground/70">
              Contact our team to discuss repair or servicing for your specific equipment.
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
            <a
              href={whatsappHref()}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-emerald-50"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
