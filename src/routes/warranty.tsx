import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";

const body = [
  "Warranty is offered on the specific repair work performed by Arise Healthcare Solutions and does not cover unrelated issues, physical damage, liquid ingress or unauthorised service performed elsewhere.",
  "Warranty duration is confirmed in the service quotation before repair begins. Any warranty period shown on the website is added by the admin only after being confirmed by Arise.",
  "To claim warranty, contact our team with your service reference. We may request the equipment for re-inspection.",
  "Warranty is void if the equipment is opened or repaired by anyone other than Arise Healthcare Solutions during the warranty period.",
];

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Warranty & Service Policy — Arise Healthcare Solutions" },
      { name: "description", content: body[0] },
      { property: "og:title", content: "Warranty & Service Policy" },
      { property: "og:description", content: body[0] },
    ],
  }),
  component: () => (
    <Layout>
      <PageHero eyebrow="Policy" title="Warranty & Service Policy" />
      <article className="container-x mx-auto max-w-3xl py-14">
        {body.map((p, i) => (<p key={i} className="mt-4 leading-relaxed text-foreground/80">{p}</p>))}
      </article>
    </Layout>
  ),
});
