import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { services, equipments } from "@/lib/site-data";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/services", changefreq: "weekly", priority: "0.9" },
          { path: "/equipments", changefreq: "weekly", priority: "0.9" },
          { path: "/repair-process", changefreq: "monthly", priority: "0.7" },
          { path: "/quality", changefreq: "monthly", priority: "0.7" },
          { path: "/industries", changefreq: "monthly", priority: "0.7" },
          { path: "/gallery", changefreq: "monthly", priority: "0.6" },
          { path: "/testimonials", changefreq: "monthly", priority: "0.6" },
          { path: "/blogs", changefreq: "weekly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/request-repair", changefreq: "monthly", priority: "0.9" },
          { path: "/track-repair", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.8" },
          { path: "/privacy-policy", priority: "0.3" },
          { path: "/terms-and-conditions", priority: "0.3" },
          { path: "/warranty-and-service", priority: "0.3" },
          ...services.map((s) => ({
            path: `/services/${s.slug}`,
            changefreq: "monthly",
            priority: "0.7",
          })),
          ...equipments.map((e) => ({
            path: `/equipments/${e.slug}`,
            changefreq: "monthly",
            priority: "0.7",
          })),
        ];
        const urls = entries.map(
          (e) =>
            `  <url><loc>${BASE_URL}${e.path}</loc>${e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""}${e.priority ? `<priority>${e.priority}</priority>` : ""}</url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
