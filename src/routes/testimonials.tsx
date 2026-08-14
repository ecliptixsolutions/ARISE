import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout, PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Client Testimonials — Arise Healthcare Solutions" },
      { name: "description", content: "What healthcare teams say about our medical equipment repair services." },
      { property: "og:title", content: "Testimonials" },
      { property: "og:description", content: "Verified and sample testimonials from our customers." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data = [] } = useQuery({
    queryKey: ["all-testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").eq("is_approved", true).order("sort_order")).data ?? [],
  });
  return (
    <Layout>
      <PageHero eyebrow="Testimonials" title="What Healthcare Teams Say" subtitle="Testimonials marked as sample are demo content — admins can approve verified reviews in the panel." />
      <section className="container-x py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((t: any) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-1 text-orange">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-3 text-sm text-foreground/80">"{t.feedback}"</p>
              <div className="mt-4 border-t border-border pt-4">
                <div className="font-semibold text-navy">{t.customer_name}</div>
                <div className="text-xs text-muted-foreground">{t.organisation}{t.city && t.city !== "—" ? ` · ${t.city}` : ""}</div>
                {t.is_sample && <span className="mt-2 inline-block rounded-full bg-orange/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange">Sample</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
