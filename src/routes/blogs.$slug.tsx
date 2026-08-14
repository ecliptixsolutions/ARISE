import { createFileRoute, notFound } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { blogs } from "@/lib/site-data";

export const Route = createFileRoute("/blogs/$slug")({
  loader: ({ params }) => { const b = blogs.find((x) => x.slug === params.slug); if (!b) throw notFound(); return b; },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} — Arise Blog` },
      { name: "description", content: loaderData.excerpt },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.excerpt },
    ] : [],
  }),
  notFoundComponent: () => <Layout><PageHero title="Article not found" /></Layout>,
  errorComponent: ({ error }) => <Layout><PageHero title="Error" subtitle={error.message} /></Layout>,
  component: () => {
    const b = Route.useLoaderData();
    return (
      <Layout>
        <PageHero eyebrow={b.category} title={b.title} />
        <article className="container-x mx-auto max-w-3xl py-14 text-foreground/80">
          {b.body.split("\n\n").map((p: string, i: number) => (<p key={i} className="mt-4 leading-relaxed">{p}</p>))}
        </article>
      </Layout>
    );
  },
});
