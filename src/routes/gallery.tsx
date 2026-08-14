import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, PageHero } from "@/components/site/Layout";
import { X, ZoomIn } from "lucide-react";
import { galleryImages } from "@/lib/site-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "A visual look at our medical equipment repair, technical diagnostics, repair and quality-control capabilities.",
      },
      { property: "og:title", content: "Gallery — Arise Healthcare Solutions" },
    ],
  }),
  component: Page,
});

const categories = ["All", ...Array.from(new Set(galleryImages.map((g) => g.cat)))];

function Page() {
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<null | { src: string; title: string; cat: string }>(
    null,
  );

  const filtered =
    active === "All" ? galleryImages : galleryImages.filter((g) => g.cat === active);

  return (
    <Layout>
      <PageHero
        eyebrow="Our Work"
        title="Medical Equipment Repair & Service Gallery"
        subtitle="A visual look at our equipment servicing, technical diagnostics, repair and quality-control capabilities."
      />

      {/* Filter tabs */}
      <section className="container-x pt-12 pb-2">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active === cat
                  ? "bg-primary text-white shadow-sm"
                  : "border border-border bg-white text-foreground hover:bg-surface hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery grid */}
      <section className="container-x py-8 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <figure
              key={g.title}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              onClick={() => setLightbox(g)}
              role="button"
              tabIndex={0}
              aria-label={`View ${g.title}`}
              onKeyDown={(e) => e.key === "Enter" && setLightbox(g)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={g.src}
                  alt={g.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-350 group-hover:scale-105"
                />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-primary/0 transition-all duration-250 group-hover:bg-primary/20">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-250 group-hover:opacity-100">
                  <ZoomIn className="h-5 w-5 text-primary" />
                </div>
              </div>
              <figcaption className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {g.cat}
                </div>
                <div className="mt-1 font-semibold text-navy">{g.title}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No images in this category yet.
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl w-full overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-md hover:bg-white"
              aria-label="Close lightbox"
            >
              <X className="h-4 w-4 text-navy" />
            </button>
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="h-full max-h-[75vh] w-full object-contain"
            />
            <div className="border-t border-border px-6 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {lightbox.cat}
              </div>
              <div className="mt-1 font-semibold text-navy">{lightbox.title}</div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
