import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Layout, PageHero } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Client Testimonials - Arise Healthcare Solutions" },
      { name: "description", content: "Real Google reviews from Arise Healthcare Solutions customers." },
      { property: "og:title", content: "Testimonials" },
      { property: "og:description", content: "Real Google reviews from Arise Healthcare Solutions customers." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data = [] } = useQuery({
    queryKey: ["all-testimonials"],
    queryFn: async () =>
      (
        await supabase
          .from("testimonials")
          .select("*")
          .eq("is_approved", true)
          .eq("is_sample", false)
          .order("sort_order")
      ).data ?? [],
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Testimonials"
        title="What Healthcare Teams Say"
        subtitle="Real Google reviews from Arise Healthcare Solutions customers."
      />
      <section className="container-x py-14">
        {data.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((testimonial: any) => (
              <div key={testimonial.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-extrabold text-[#4285F4]">
                    G
                  </span>
                  Google Review
                </div>
                <div className="flex items-center gap-1 text-orange">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 break-words text-sm text-foreground/80">"{testimonial.feedback}"</p>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="break-words font-semibold text-navy">{testimonial.customer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(testimonial.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-base font-extrabold text-[#4285F4] shadow-sm">
              G
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-navy">Google reviews will appear here</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Real Google review data has not been connected yet. No sample or fabricated testimonials are shown.
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
}
