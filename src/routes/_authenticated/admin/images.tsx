import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "admin-images";

export const Route = createFileRoute("/_authenticated/admin/images")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-images"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function upload(file: File) {
    const valid = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type);
    if (!valid) {
      toast.error("Upload JPG, PNG, WEBP or SVG files only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      toast.error(import.meta.env.DEV ? error.message : "Image upload failed.");
      return;
    }
    await (supabase as any).from("website_images").upsert({
      bucket: BUCKET,
      path,
      url: publicUrl(path),
      alt_text: file.name.replace(/\.[^.]+$/, ""),
    }, { onConflict: "bucket,path" });
    toast.success("Image uploaded");
    qc.invalidateQueries({ queryKey: ["admin-images"] });
  }

  async function remove(name: string) {
    if (!confirm("Delete Image?\n\nAre you sure you want to permanently delete this image?")) return;
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Image deleted");
    await (supabase as any).from("website_images").delete().eq("bucket", BUCKET).eq("path", name);
    qc.invalidateQueries({ queryKey: ["admin-images"] });
  }

  function publicUrl(name: string) {
    return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
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
          {data.map((image: any) => (
            <article key={image.id ?? image.name} className="rounded-2xl border border-border bg-card p-3">
              <img src={publicUrl(image.name)} alt="" className="aspect-video w-full rounded-lg bg-surface object-cover" />
              <div className="mt-3 min-w-0">
                <div className="truncate text-sm font-semibold text-navy">{image.name}</div>
                <div className="text-xs text-muted-foreground">
                  {image.metadata?.size ? `${Math.round(image.metadata.size / 1024)} KB` : "Size unknown"}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl(image.name));
                    toast.success("Image URL copied");
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-surface"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy URL
                </button>
                <button
                  onClick={() => remove(image.name)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-border text-red-600 hover:bg-red-50"
                  aria-label="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {data.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No images uploaded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
