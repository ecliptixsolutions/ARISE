import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { settings } from "@/lib/site-data";

const sections = [
  {
    title: "Website Usage",
    body: [
      "By using this website, you agree to use it only for lawful enquiries related to medical equipment repair, servicing, quotations and customer communication.",
      "Website content is provided for general service information. It should not be treated as a final technical diagnosis, repair confirmation or legal guarantee.",
    ],
  },
  {
    title: "Service Enquiries and Repair Requests",
    body: [
      "A repair request is not an automatic repair confirmation.",
      "You are responsible for providing accurate equipment information, including equipment type, brand, model, serial number, fault condition, repair history and any relevant supporting details.",
      "Final repair feasibility depends on physical inspection, diagnosis, equipment condition, technical feasibility and spare-part availability.",
    ],
  },
  {
    title: "Inspection, Quotation and Repair Authorisation",
    body: [
      "Equipment may need to be physically inspected before a final quotation or repair decision is provided.",
      "Repair charges must be approved before work begins. Arise Healthcare Solutions will proceed with repair or servicing only after the required quotation or repair scope is approved.",
      "Estimated timelines are indicative and can vary depending on the fault, equipment model, workload, diagnosis complexity and spare-part availability.",
    ],
  },
  {
    title: "Spare Parts, Payment, Delivery and Pickup",
    body: [
      "Repair support may depend on spare-part availability, compatibility and serviceability of the equipment.",
      "Payment conditions, delivery, pickup, shipping or handover details will be communicated as part of the service process, quotation, invoice or customer communication.",
      "Customers are responsible for safely packing, cleaning and submitting equipment in a condition suitable for inspection and handling.",
    ],
  },
  {
    title: "Customer Responsibilities",
    body: [
      "The customer must remove patient or confidential medical data before submitting equipment.",
      "The customer must ensure submitted equipment is safe to handle and disclose any contamination, liquid exposure, physical damage, electrical damage or prior unauthorised repair attempts.",
      "Arise Healthcare Solutions may refuse equipment that is unsafe, contaminated, incomplete, unsuitable for repair or not technically feasible to service.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "Arise Healthcare Solutions is not responsible for pre-existing unrelated faults, data left on equipment, loss caused by inaccurate customer information, manufacturer limitations, unavailable spare parts or damage caused by handling outside the agreed service process.",
      "Any warranty or service responsibility is limited to the confirmed repair scope stated in the quotation, invoice or service report.",
    ],
  },
  {
    title: "Website Content and Changes",
    body: [
      "Website text, images, structure and service content belong to Arise Healthcare Solutions or their respective rights holders. Manufacturer names and trademarks belong to their respective owners.",
      "Arise Healthcare Solutions may update services, website content and these terms when business processes or service requirements change.",
    ],
  },
  {
    title: "Governing Conditions and Contact",
    body: [
      "These terms are intended to describe the conditions under which website enquiries and service communication are handled. Specific quotation, invoice or service-report terms may also apply.",
      `For questions, contact ${settings.company} at ${settings.emailPlaceholder}, ${settings.phonePlaceholder} or ${settings.secondaryPhonePlaceholder}.`,
    ],
  },
];

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Terms and Conditions for Arise Healthcare Solutions website usage, repair requests, quotations, equipment inspection and service communication.",
      },
      { property: "og:title", content: "Terms & Conditions | Arise Healthcare Solutions" },
      {
        property: "og:description",
        content:
          "Service terms for enquiries, repair requests, inspection, quotation approval and customer responsibilities.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Layout>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="Terms for website usage, repair enquiries, quotations and service communication."
        showBack
      />
      <article className="container-x mx-auto max-w-4xl py-14">
        <div className="space-y-8 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-bold text-navy">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-foreground/80">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </Layout>
  );
}
