import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Layout, PageHero } from "@/components/site/Layout";
import { settings } from "@/lib/site-data";

const exclusions = [
  "Physical damage after delivery",
  "Liquid or chemical damage after service",
  "Mishandling",
  "Unauthorised opening or repair",
  "Electrical surge",
  "Improper installation",
  "Damage caused by incompatible accessories",
  "Consumable parts",
  "Normal wear and tear",
  "Pre-existing unrelated faults",
  "Equipment used outside manufacturer guidelines",
];

const serviceProcess = [
  "Repair request",
  "Equipment receipt and inspection",
  "Diagnosis",
  "Quotation approval",
  "Repair or servicing",
  "Quality testing",
  "Delivery or pickup",
];

const limitations = [
  "Equipment category",
  "Brand",
  "Model",
  "Fault condition",
  "Spare-part availability",
  "Technical feasibility",
];

const claimSteps = [
  "Contact Arise Healthcare Solutions.",
  "Provide invoice or service reference number.",
  "Describe the issue clearly.",
  "Submit photos or videos where requested.",
  "Send the equipment for inspection if required.",
  "Wait for warranty eligibility confirmation.",
];

export const Route = createFileRoute("/warranty-and-service")({
  head: () => ({
    meta: [
      { title: "Warranty & Service | Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Warranty and service information for Arise Healthcare Solutions repair, servicing, inspection and component-level support.",
      },
      { property: "og:title", content: "Warranty & Service | Arise Healthcare Solutions" },
      {
        property: "og:description",
        content:
          "Repair warranty availability, exclusions, service process and warranty claim guidance.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Layout>
      <PageHero
        eyebrow="Policy"
        title="Warranty & Service"
        subtitle="Repair warranty, service coverage and support limitations for medical equipment."
        showBack
      />
      <article className="container-x mx-auto max-w-4xl py-14">
        <div className="space-y-8 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <PolicySection title="Service Coverage">
            <p>
              Arise Healthcare Solutions provides repair, servicing, inspection and component-level
              support for supported medical equipment. Service support is assessed according to the
              equipment type, brand, model, condition and technical feasibility.
            </p>
          </PolicySection>

          <PolicySection title="Repair Warranty">
            <p>
              Warranty availability depends on the equipment, repair type and replaced components.
              Warranty details will be stated in the final quotation, invoice or service report.
            </p>
            <p>
              Warranty covers only the repaired or replaced part. It does not automatically cover
              the entire equipment. No fixed warranty duration is shown unless confirmed by the
              business in the relevant service document.
            </p>
          </PolicySection>

          <PolicySection title="Warranty Exclusions">
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {exclusions.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-gold-border/60 bg-gold-soft p-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </PolicySection>

          <PolicySection title="Service Process">
            <ol className="mt-4 grid gap-3 md:grid-cols-2">
              {serviceProcess.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-2xl border border-border bg-surface p-4"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </PolicySection>

          <PolicySection title="Service Limitations">
            <p>Service support depends on:</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {limitations.map((item) => (
                <li key={item} className="rounded-2xl border border-border bg-surface p-3">
                  {item}
                </li>
              ))}
            </ul>
          </PolicySection>

          <PolicySection title="Warranty Claim Process">
            <ol className="mt-4 grid gap-3">
              {claimSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="font-bold text-primary">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </PolicySection>

          <PolicySection title="Contact">
            <p>
              For warranty or service questions, contact {settings.company} at{" "}
              {settings.emailPlaceholder}, {settings.phonePlaceholder} or{" "}
              {settings.secondaryPhonePlaceholder}.
            </p>
          </PolicySection>
        </div>
      </article>
    </Layout>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-foreground/80">{children}</div>
    </section>
  );
}
