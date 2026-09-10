import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { blogs, type Blog, settings } from "@/lib/site-data";
import { ArrowRight, Calendar, CheckCircle2, Clock, Tag } from "lucide-react";

export const Route = createFileRoute("/blogs/$slug")({
  loader: ({ params }) => {
    const blog = blogs.find((x) => x.slug === params.slug);
    if (!blog) throw notFound();
    return blog;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.seoTitle ?? `${loaderData.title} - Arise Blog` },
          { name: "description", content: loaderData.seoDescription ?? loaderData.excerpt },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt },
          ...(loaderData.image ? [{ property: "og:image", content: loaderData.image }] : []),
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/blogs/${loaderData.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <Layout>
      <PageHero
        title="Article not found"
        subtitle="The requested repair guide could not be found."
        showBack
      />
    </Layout>
  ),
  errorComponent: () => (
    <Layout>
      <PageHero
        title="Article unavailable"
        subtitle="Please try again or return to the blog listing."
        showBack
      />
    </Layout>
  ),
  component: Page,
});

function relatedBlogs(blog: Blog) {
  const score = (candidate: Blog) => {
    if (candidate.slug === blog.slug) return -1;
    const sameCategory = candidate.category === blog.category ? 3 : 0;
    const keywordHits = (candidate.keywords ?? []).filter((tag) =>
      blog.keywords?.includes(tag),
    ).length;
    const equipmentHits = (candidate.equipment ?? []).filter((item) =>
      blog.equipment?.includes(item),
    ).length;
    return sameCategory + keywordHits + equipmentHits;
  };

  return blogs
    .map((candidate) => ({ candidate, score: score(candidate) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.candidate);
}

function blogDate(blog: Blog) {
  return blog.date
    ? new Date(blog.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Arise Guide";
}

function Page() {
  const blog = Route.useLoaderData();
  const related = relatedBlogs(blog);

  return (
    <Layout>
      <PageHero eyebrow={blog.category} title={blog.title} subtitle={blog.excerpt} showBack />
      <article className="container-x mx-auto max-w-5xl py-12">
        {blog.image && (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <img
              src={blog.image}
              alt={blog.imageAlt ?? blog.title}
              className="h-full max-h-[420px] w-full object-cover"
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1">
            <Calendar className="h-4 w-4" />
            {blogDate(blog)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1">
            <Clock className="h-4 w-4" />
            {blog.readingTime ?? 4} min read
          </span>
          <span className="rounded-full bg-gold-soft px-3 py-1 font-semibold text-gold-text">
            {blog.difficulty ?? "Beginner"}
          </span>
          <span className="rounded-full bg-surface px-3 py-1">{settings.company}</span>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="prose prose-slate max-w-none">
            {blog.body.split("\n\n").map((paragraph) => (
              <p key={paragraph} className="mt-5 text-base leading-8 text-foreground/80">
                {paragraph}
              </p>
            ))}

            {(blog.takeaways?.length ?? 0) > 0 && (
              <section className="mt-10 rounded-2xl border border-gold-border/70 bg-gold-soft p-6">
                <h2 className="font-display text-2xl font-bold text-navy">Key Takeaways</h2>
                <ul className="mt-4 space-y-3">
                  {blog.takeaways?.map((takeaway) => (
                    <li key={takeaway} className="flex gap-3 text-sm leading-6 text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-display text-2xl font-bold text-navy">
                Need Technical Assessment?
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                Share the equipment type, brand, model and observed fault so the Arise team can
                guide the repair intake.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/request-repair"
                  className="rounded-lg btn-primary px-5 py-3 text-sm font-semibold"
                >
                  Request a Repair
                </Link>
                <Link
                  to="/contact"
                  className="rounded-lg border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary hover:bg-surface"
                >
                  Contact Arise
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-navy">Article Tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(blog.keywords ?? [blog.category]).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-primary"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-navy">
                Related Repair Guides
              </h2>
              <div className="mt-3 space-y-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    to="/blogs/$slug"
                    params={{ slug: item.slug }}
                    className="block rounded-xl border border-border p-3 hover:border-primary/40 hover:bg-surface"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {item.category}
                    </div>
                    <div className="mt-1 text-sm font-semibold leading-snug text-navy">
                      {item.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            View all repair resources <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </Layout>
  );
}
