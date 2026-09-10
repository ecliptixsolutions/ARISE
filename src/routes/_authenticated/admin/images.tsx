/* eslint-disable @typescript-eslint/no-explicit-any */
// NOTE: Image upload still uses Supabase Storage for the transition period.
// Supabase Storage remains active. Files and URLs are still valid.
// The website_images metadata table is now in MySQL via the Hostinger API.
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiDelete } from "@/integrations/mysql/client";

// ── Supabase Storage is kept active during transition ─────────
// Only the metadata (website_images table) moves to MySQL.
// Image uploads still go to Supabase Storage; URLs are stable.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL_LEGACY ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY_LEGACY ?? "";
const BUCKET = "admin-images";

function publicUrl(path: string) {
  if (!SUPABASE_URL) return path; // fallback if env not set
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export const Route = createFileRoute("/_authenticated/admin/images")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();

  // Load image metadata from MySQL (website_images table)
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-images"],
    queryFn: async () => {
      const { data, error } = await apiGet<any[]>(`/api/website-images?bucket=${BUCKET}`);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  async function upload(file: File) {
    const valid = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type);
    if (!valid) { toast.error("Upload JPG, PNG, WEBP or SVG files only."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be 5 MB or smaller."); return; }

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${Date.now()}-${safeName}`;
    const url = publicUrl(path);

    // Upload to Supabase Storage (keeping active during transition)
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const formData = new FormData();
      formData.append("", file);
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
        { method: "POST", headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "x-upsert": "false", "Cache-Control": "31536000" }, body: formData },
      );
      if (!res.ok) { toast.error("Image upload failed."); return; }
    }

    // Save metadata to MySQL
    const { error } = await apiPost("/api/website-images", {
      bucket: BUCKET, path, url, alt_text: file.name.replace(/\.[^.]+$/, ""), is_primary: 0,
    });
    if (error) { toast.error("Failed to save image metadata."); return; }
    toast.success("Image uploaded");
    qc.invalidateQueries({ queryKey: ["admin-images"] });
  }

  async function remove(id: string, path: string) {
    if (!confirm("Delete Image?\n\nAre you sure you want to permanently delete this image?")) return;

    // Remove from Supabase Storage
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });
    }

    // Remove from MySQL
    const { error } = await apiDelete(`/api/website-images/${id}`);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Image deleted");
    qc.invalidateQueries({ queryKey: ["admin-images"] });
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Images</h1>
          <p className="text-sm text-muted-foreground">Upload, preview and manage website image assets.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          <Upload className="h-4 w-4" /> Upload Image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="mt-6 text-sm text-muted-foreground">Loading images...</div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data as any[]).map((image: any) => (
            <article key={image.id} className="rounded-2xl border border-border bg-card p-3">
              <img src={image.url ?? publicUrl(image.path)} alt={image.alt_text ?? ""} className="aspect-video w-full rounded-lg bg-surface object-cover" loading="lazy" />
              <div className="mt-3 min-w-0">
                <div className="truncate text-sm font-semibold text-navy">{image.path}</div>
                {image.alt_text && <div className="text-xs text-muted-foreground">{image.alt_text}</div>}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(image.url ?? publicUrl(image.path)); toast.success("Image URL copied"); }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-surface"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy URL
                </button>
                <button
                  onClick={() => remove(image.id, image.path)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border text-red-600 hover:bg-red-50"
                  aria-label="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {!(data as any[]).length && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No images uploaded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
