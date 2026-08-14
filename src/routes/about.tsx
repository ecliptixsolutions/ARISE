import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { CheckCircle2, ShieldCheck, Award, Users, Wrench } from "lucide-react";
import endoscopeImg from "@/assets/eq-endoscope.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Arise Healthcare Solutions — Endoscopy Repair Specialists" },
      {
        name: "description",
        content:
          "Arise Healthcare Solutions is a medical equipment repair and biomedical engineering company serving hospitals, clinics and diagnostic centres.",
      },
      { property: "og:title", content: "About Arise Healthcare Solutions" },
      {
        property: "og:description",
        content:
          "Medical equipment repair, biomedical engineering and healthcare technical solutions.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <Layout>
      <PageHero
        eyebrow="About"
        title="Building a trusted repair partner for healthcare"
        subtitle="Arise Healthcare Solutions is an independent medical equipment repair company focused on endoscopy and advanced biomedical devices."
      />
      <section className="container-x grid gap-10 py-14 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">Who We Are</h2>
            <p className="mt-3 text-foreground/75">
              We are a medical equipment repair, biomedical engineering and healthcare technical
              solutions company. We serve hospitals, clinics, diagnostic centres, medical colleges
              and healthcare organisations with reliable, quality-controlled equipment repair.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">What We Do</h2>
            <p className="mt-3 text-foreground/75">
              Our lab specialises in endoscopy repair — rigid and flexible scopes, camera heads,
              video processors, light sources, CO₂ insufflators — and extends to a broader portfolio
              of medical monitors, patient monitors, ultrasound systems, ventilators and other
              biomedical devices. We work at component and board level where it makes sense, keeping
              downtime and total cost of ownership low for our customers.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">Our Approach</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                "Transparent diagnosis and quotation",
                "Component-level repair where feasible",
                "Documented quality testing",
                "Clear communication throughout",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
            <strong className="text-navy">Important:</strong> Arise Healthcare Solutions is an
            independent repair service. Original manufacturer trademarks belong to their respective
            owners. We do not present ourselves as a patient-treatment hospital.
          </div>
        </div>
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-primary/10">
            <img
              src={endoscopeImg}
              alt="Endoscopy equipment supported by Arise Healthcare Solutions"
              loading="lazy"
              className="h-full w-full object-contain p-6"
            />
          </div>
          {[
            [ShieldCheck, "Quality-Controlled Process", "Documented QC before dispatch."],
            [Award, "Repair Specialists", "Focused endoscopy repair expertise."],
            [Wrench, "Board-Level Repair", "In-house component-level capability."],
            [Users, "Trained Team", "Experienced biomedical engineers."],
          ].map(([Icon, t, d]: any, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-3xl border border-gold-border/60 bg-gold-soft p-5 shadow-sm"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-navy">{t}</div>
                <p className="mt-1 text-sm text-foreground/70">{d}</p>
              </div>
            </div>
          ))}
          <Link
            to="/contact"
            className="mt-2 block rounded-2xl btn-primary py-3 text-center text-sm font-semibold"
          >
            Contact Us
          </Link>
        </aside>
      </section>
    </Layout>
  );
}
