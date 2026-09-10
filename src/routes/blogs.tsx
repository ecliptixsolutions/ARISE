import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { blogs, type Blog } from "@/lib/site-data";
import { ArrowRight, Calendar, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

const pageSize = 9;
const levels = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

export const Route = createFileRoute("/blogs")({
  validateSearch: (s: Record<string, unknown>) =>
    z
      .object({
        q: z.string().optional(),
        category: z.string().optional(),
        level: z.string().optional(),
        page: z.coerce.number().int().positive().optional(),
      })
      .parse(s),
  head: () => ({
    meta: [
      { title: "Blog & Repair Resources - Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Search Arise Healthcare Solutions repair guides for endoscopy, PCB, camera head, processor, light source and medical equipment servicing.",
      },
      { property: "og:title", content: "Blog & Repair Resources" },
      {
        property: "og:description",
        content: "Technical guides, equipment-care insights and repair knowledge from Arise.",
      },
    ],
  }),
  component: Page,
});

function blogImage(blog: Blog) {
  return blog.image ?? blogs.find((b) => b.image)?.image ?? "";
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

function blogSearchText(blog: Blog) {
  return [
    blog.title,
    blog.excerpt,
    blog.category,
    blog.difficulty,
    ...(blog.keywords ?? []),
    ...(blog.equipment ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function Page() {
  const location = useLocation();
  const search = useSearch({ from: "/blogs" });
  const navigate = useNavigate({ from: "/blogs" });

  const q = search.q ?? "";
  const activeCategory = search.category ?? "All";
  const activeLevel = search.level ?? "All Levels";
  const page = search.page ?? 1;
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(blogs.map((b) => b.category)))],
    [],
  );

  const setSearch = (next: Partial<typeof search>) =>
    navigate({
      search: {
        q,
        category: activeCategory === "All" ? undefined : activeCategory,
        level: activeLevel === "All Levels" ? undefined : activeLevel,
        ...next,
        page: undefined,
      },
      replace: true,
    });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return blogs.filter((blog) => {
      const categoryMatch = activeCategory === "All" || blog.category === activeCategory;
      const levelMatch = activeLevel === "All Levels" || blog.difficulty === activeLevel;
      const queryMatch = !term || blogSearchText(blog).includes(term);
      return categoryMatch && levelMatch && queryMatch;
    });
  }, [activeCategory, activeLevel, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleBlogs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const avgRead = Math.round(
    blogs.reduce((sum, b) => sum + (b.readingTime ?? 4), 0) / blogs.length,
  );
  const hasFilters = q || activeCategory !== "All" || activeLevel !== "All Levels";

  if (location.pathname !== "/blogs") return <Outlet />;

  return (
    <Layout>
      <PageHero
        eyebrow="Resources"
        title="Blog & Repair Resources"
        subtitle="Technical guides, equipment-care insights and repair knowledge from Arise Healthcare Solutions."
      />
      <section className="container-x py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat value={`${blogs.length}`} label="Repair guides" />
          <Stat value={`${categories.length - 1}`} label="Technical topics" />
          <Stat value={`${avgRead} min`} label="Average read" />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                placeholder="Search articles, topics, equipment, techniques..."
                className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>
            <button
              type="button"
              onClick={() => navigate({ search: {}, replace: true })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-navy hover:bg-surface"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Categories
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <FilterButton
                key={category}
                active={activeCategory === category}
                onClick={() => setSearch({ category: category === "All" ? undefined : category })}
              >
                {category}
              </FilterButton>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["All Levels", ...levels].map((level) => (
                <FilterButton
                  key={level}
                  active={activeLevel === level}
                  onClick={() => setSearch({ level: level === "All Levels" ? undefined : level })}
                >
                  {level}
                </FilterButton>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "article" : "articles"} found
            </div>
          </div>
        </div>

        {visibleBlogs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <h2 className="font-display text-2xl font-bold text-navy">No articles found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your search, category or difficulty filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => navigate({ search: {}, replace: true })}
                className="mt-5 rounded-lg btn-primary px-5 py-3 text-sm font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleBlogs.map((blog) => (
              <ArticleCard key={blog.slug} blog={blog} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label="Blog pagination"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => navigate({ search: { ...search, page: n }, replace: true })}
                className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold ${
                  n === currentPage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-navy hover:bg-surface"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                navigate({ search: { ...search, page: currentPage + 1 }, replace: true })
              }
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-navy hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </nav>
        )}

        <div className="mt-12 rounded-2xl border border-gold-border/70 bg-gold-soft p-6 md:flex md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">Need a repair assessment?</h2>
            <p className="mt-2 text-sm text-foreground/75">
              Share the equipment details and fault symptoms with the Arise technical team.
            </p>
          </div>
          <Link
            to="/request-repair"
            className="mt-5 inline-flex rounded-lg btn-primary px-5 py-3 text-sm font-semibold md:mt-0"
          >
            Request a Repair
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-gold-border/70 bg-gold-soft p-5">
      <div className="text-3xl font-bold text-navy">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold-text">
        {label}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-navy hover:border-primary/40 hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

function ArticleCard({ blog }: { blog: Blog }) {
  return (
    <Link
      to="/blogs/$slug"
      params={{ slug: blog.slug }}
      className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="aspect-[16/10] overflow-hidden bg-surface">
        {blogImage(blog) && (
          <img
            src={blogImage(blog)}
            alt={blog.imageAlt ?? blog.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <span>{blog.category}</span>
          <span className="text-muted-foreground">.</span>
          <span>{blog.readingTime ?? 4} min read</span>
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-navy">
            {blog.difficulty ?? "Beginner"}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-navy">{blog.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/75">{blog.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(blog.keywords ?? [blog.category]).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-gold-text"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {blogDate(blog)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            Read Article <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
