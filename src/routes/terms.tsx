import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";

const body = [
  "By using this website you agree to the following terms.",
  "Repair feasibility depends on inspection, parts availability and equipment condition. Estimates provided prior to inspection are indicative only and may change after physical diagnosis.",
  "Quotations issued are valid for the duration mentioned on the quotation.",
  "Original manufacturer trademarks referenced on this site belong to their respective owners. Arise Healthcare Solutions is an independent repair service unless authorised partnerships are explicitly declared.",
  "We do not guarantee repair success without inspection. Any warranty offered will be stated in the service quotation.",
  "You are responsible for ensuring equipment shipped to us is properly cleaned and safe to handle.",
];

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Arise Healthcare Solutions" },
      { name: "description", content: body[0] },
      { property: "og:title", content: "Terms & Conditions" },
      { property: "og:description", content: body[0] },
    ],
  }),
  component: () => (
    <Layout>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <article className="container-x mx-auto max-w-3xl py-14">
        {body.map((p, i) => (<p key={i} className="mt-4 leading-relaxed text-foreground/80">{p}</p>))}
      </article>
    </Layout>
  ),
});
