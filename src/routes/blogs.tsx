import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { blogs } from "@/lib/site-data";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Blogs & Repair Resources — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Practical guides on endoscope maintenance, PCB repair, camera head care and biomedical engineering.",
      },
      { property: "og:title", content: "Blogs & Resources" },
      {
        property: "og:description",
        content: "Guides and articles on medical equipment care and repair.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const location = useLocation();
  if (location.pathname !== "/blogs") return <Outlet />;

  return (
    <Layout>
      <PageHero
        eyebrow="Resources"
        title="Blogs & Repair Guides"
        subtitle="Guides written by our team on maintenance, PCB repair and biomedical engineering."
      />
      <section className="container-x py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <Link
              key={b.slug}
              to="/blogs/$slug"
              params={{ slug: b.slug }}
              className="group rounded-3xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {b.category}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-navy">{b.title}</h3>
              <p className="mt-2 text-sm text-foreground">{b.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Read article <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
