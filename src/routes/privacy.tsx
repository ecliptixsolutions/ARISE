import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";

const content = {
  privacy: {
    title: "Privacy Policy", eyebrow: "Legal",
    body: [
      "This Privacy Policy describes how Arise Healthcare Solutions collects and uses information submitted through this website.",
      "Information we collect: contact details you submit (name, organisation, mobile, WhatsApp, email, city), equipment details required for repair (type, brand, model, serial, problem description) and any files or images you upload for diagnostic purposes.",
      "We do not collect or process patient medical records through this website.",
      "How we use information: to respond to enquiries, generate quotations, provide repair updates and improve our services.",
      "We do not sell personal information. We share information only with team members and partners strictly involved in delivering the requested service.",
      "You may contact us to request update or deletion of your information.",
    ],
  },
  terms: {
    title: "Terms & Conditions", eyebrow: "Legal",
    body: [
      "By using this website you agree to the following terms.",
      "Repair feasibility depends on inspection, parts availability and equipment condition. Estimates provided prior to inspection are indicative only and may change after physical diagnosis.",
      "Quotations issued are valid for the duration mentioned on the quotation.",
      "Original manufacturer trademarks referenced on this site belong to their respective owners. Arise Healthcare Solutions is an independent repair service unless authorised partnerships are explicitly declared.",
      "We do not guarantee repair success without inspection. Any warranty offered will be stated in the service quotation.",
      "You are responsible for ensuring equipment shipped to us is properly cleaned and safe to handle.",
    ],
  },
  warranty: {
    title: "Warranty & Service Policy", eyebrow: "Policy",
    body: [
      "Warranty is offered on the specific repair work performed by Arise Healthcare Solutions and does not cover unrelated issues, physical damage, liquid ingress or unauthorised service performed elsewhere.",
      "Warranty duration is confirmed in the service quotation before repair begins. Any warranty period shown on the website will be added by the admin only after being confirmed by Arise.",
      "To claim warranty, contact our team with your service reference. We may request the equipment for re-inspection.",
      "Warranty is void if the equipment is opened or repaired by anyone other than Arise Healthcare Solutions during the warranty period.",
    ],
  },
};

function makeRoute(path: "privacy" | "terms" | "warranty") {
  const c = content[path];
  return createFileRoute(`/${path}` as any)({
    head: () => ({
      meta: [
        { title: `${c.title} — Arise Healthcare Solutions` },
        { name: "description", content: c.body[0] },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.body[0] },
      ],
    }),
    component: () => (
      <Layout>
        <PageHero eyebrow={c.eyebrow} title={c.title} />
        <article className="container-x mx-auto max-w-3xl py-14">
          {c.body.map((p, i) => (<p key={i} className="mt-4 leading-relaxed text-foreground/80">{p}</p>))}
        </article>
      </Layout>
    ),
  });
}
export const Route = makeRoute("privacy");
