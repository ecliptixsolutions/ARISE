import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { equipments, faqs } from "@/lib/site-data";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { whatsappHref, settings } from "@/lib/site-data";

export const Route = createFileRoute("/equipments/$slug")({
  loader: ({ params }) => {
    const e = equipments.find((x) => x.slug === params.slug);
    if (!e) throw notFound();
    return e;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} Repair — Arise Healthcare Solutions` },
          {
            name: "description",
            content: `${loaderData.name} repair by Arise Healthcare Solutions. ${loaderData.short}`,
          },
          { property: "og:title", content: `${loaderData.name} Repair` },
          { property: "og:description", content: loaderData.short },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <Layout>
      <PageHero title="Equipment not found" />
    </Layout>
  ),
  errorComponent: ({ error }) => (
    <Layout>
      <PageHero title="Error" subtitle={error.message} />
    </Layout>
  ),
  component: Page,
});

function Page() {
  const e = Route.useLoaderData();
  return (
    <Layout>
      <PageHero eyebrow={e.category} title={`${e.name} Repair`} subtitle={e.short} />
      <section className="container-x grid gap-10 py-14 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-primary/10">
            <img src={e.image} alt={e.name} className="h-full w-full object-contain p-8" />
          </div>

          <h2 className="mt-10 font-display text-2xl font-bold text-navy">
            Common Faults We Repair
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {e.faults.map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-orange" /> {f}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl font-bold text-navy">Repair Capabilities</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {e.capabilities.map((c: string) => (
              <li key={c} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {c}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl font-bold text-navy">
            Inspection & Testing Process
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-foreground/80">
            <li>1. Visual and structural inspection of the equipment.</li>
            <li>2. Diagnostic testing using calibrated tools.</li>
            <li>3. Fault isolation to component or module level.</li>
            <li>4. Repair carried out by trained biomedical engineers.</li>
            <li>5. Functional and safety verification before dispatch.</li>
          </ol>

          <h2 className="mt-10 font-display text-2xl font-bold text-navy">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 divide-y divide-border rounded-3xl border border-border bg-white shadow-sm">
            {faqs.slice(0, 4).map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-medium text-navy">{f.q}</summary>
                <p className="mt-2 text-sm text-foreground/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl cta-gold p-6">
            <h3 className="font-display text-lg font-semibold text-navy">Request a Repair</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Send equipment details and we will respond with next steps.
            </p>
            <Link
              to="/request-repair"
              search={{ equipment: e.slug } as any}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl btn-primary py-3 text-sm font-semibold"
            >
              Start Repair Request <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref(`Hello Arise, I would like to enquire about ${e.name} repair.`)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white py-3 text-sm font-semibold hover:bg-emerald-50"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp Us
            </a>
            <div className="mt-4 rounded-2xl border border-gold-border/60 bg-gold-soft p-4 text-xs text-gold-text">
              Repair feasibility depends on inspection, parts availability and equipment condition.
              Supported brand list is managed via the admin panel.
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-semibold text-navy">Related Equipment</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {equipments
                .filter((x) => x.slug !== e.slug)
                .slice(0, 5)
                .map((x) => (
                  <li key={x.slug}>
                    <Link
                      to="/equipments/$slug"
                      params={{ slug: x.slug }}
                      className="text-foreground/80 hover:text-primary"
                    >
                      {x.name}
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
