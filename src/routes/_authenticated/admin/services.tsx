import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAdminServices } from "@/lib/service-content";
import { getServiceCarouselImages, type Service, type ServiceImage } from "@/lib/site-data";
import { CheckCircle2, ChevronDown, ChevronUp, ExternalLink, GripVertical, Plus, Save, Trash2, Upload, XCircle } from "lucide-react";

type EditableService = Service & {
  problemsText: string;
  images: ServiceImage[];
};

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: Page,
});

function toEditable(service: Service): EditableService {
  return {
    ...service,
    published: service.published !== false,
    problemsText: service.commonProblems.join("\n"),
    images: getServiceCarouselImages(service).map((image, index) => ({ ...image, order: image.order ?? index })),
  };
}

function Page() {
  const [items, setItems] = useState<EditableService[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadAlt, setUploadAlt] = useState<Record<string, string>>({});

  useEffect(() => {
    getAdminServices()
      .then((loaded) => setItems(loaded.map(toEditable)))
      .finally(() => setLoading(false));
  }, []);

  function update(slug: string, patch: Partial<EditableService>) {
    setItems((current) => current.map((item) => (item.slug === slug ? { ...item, ...patch } : item)));
  }

  function updateImage(slug: string, imageId: string, patch: Partial<ServiceImage>) {
    setItems((current) => current.map((item) => {
      if (item.slug !== slug) return item;
      return {
        ...item,
        images: item.images.map((image) => (image.id === imageId ? { ...image, ...patch } : image)),
      };
    }));
  }

  function moveImage(slug: string, imageId: string, direction: -1 | 1) {
    setItems((current) => current.map((item) => {
      if (item.slug !== slug) return item;
      const images = [...item.images];
      const index = images.findIndex((image) => image.id === imageId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= images.length) return item;
      [images[index], images[nextIndex]] = [images[nextIndex], images[index]];
      return { ...item, images: images.map((image, order) => ({ ...image, order })) };
    }));
  }

  function removeImage(slug: string, imageId: string) {
    setItems((current) => current.map((item) => {
      if (item.slug !== slug) return item;
      const images = item.images.filter((image) => image.id !== imageId).map((image, order) => ({ ...image, order }));
      return {
        ...item,
        images,
        primaryImageId: item.primaryImageId === imageId ? images[0]?.id : item.primaryImageId,
      };
    }));
  }

  async function uploadImage(service: EditableService, file: File) {
    const alt = uploadAlt[service.slug]?.trim() || file.name.replace(/\.[^.]+$/, "");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const id = crypto.randomUUID();
    const path = `${service.slug}/${id}.${ext}`;
    const { error } = await supabase.storage.from("service-images").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      toast.error("Image upload failed. Check the service-images storage bucket.");
      return;
    }
    const { data } = supabase.storage.from("service-images").getPublicUrl(path);
    const image = { id, src: data.publicUrl, alt, order: service.images.length };
    update(service.slug, {
      images: [...service.images, image],
      primaryImageId: service.primaryImageId ?? id,
    });
    setUploadAlt((current) => ({ ...current, [service.slug]: "" }));
    toast.success("Image added");
  }

  async function save(service: EditableService, index: number) {
    setSaving(service.slug);
    const problems = service.problemsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const images = service.images.map((image, order) => ({ ...image, order }));

    const { error } = await supabase.from("services").upsert({
      slug: service.slug,
      name: service.name,
      category: service.category,
      short_description: service.short,
      detailed_description: service.detailedDescription,
      common_problems: problems,
      carousel_images: images,
      primary_image_id: service.primaryImageId ?? images[0]?.id ?? null,
      is_published: service.published !== false,
      is_featured: service.featured,
      sort_order: index,
    } as any, { onConflict: "slug" });

    setSaving(null);
    if (error) {
      toast.error("Could not save service. Apply the latest Supabase migration first.");
      return;
    }
    update(service.slug, { commonProblems: problems, images });
    toast.success("Service saved");
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading services...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Services</h1>
          <p className="text-sm text-muted-foreground">Edit service content, visibility and carousel images.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {items.map((service, index) => {
          const open = expanded === service.slug;
          return (
            <div key={service.slug} className="rounded-2xl border border-border bg-card">
              <button onClick={() => setExpanded(open ? null : service.slug)} className="flex w-full items-center justify-between p-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`shrink-0 ${service.published !== false ? "text-primary" : "text-muted-foreground"}`}>
                    {service.published !== false ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-navy">{service.name}</div>
                    <div className="text-xs text-muted-foreground">{service.category} / {service.slug}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link to="/services/$slug" params={{ slug: service.slug }} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    Preview <ExternalLink className="h-3 w-3" />
                  </Link>
                  {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {open && (
                <div className="space-y-5 border-t border-border px-5 pb-5 pt-4 text-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Service name" value={service.name} onChange={(value) => update(service.slug, { name: value })} />
                    <Field label="Category" value={service.category} onChange={(value) => update(service.slug, { category: value })} />
                  </div>
                  <Field label="Short description" value={service.short} onChange={(value) => update(service.slug, { short: value })} />
                  <TextArea label="Detailed description" rows={5} value={service.detailedDescription} onChange={(value) => update(service.slug, { detailedDescription: value })} />
                  <TextArea label="Common repair problems, one per line" rows={6} value={service.problemsText} onChange={(value) => update(service.slug, { problemsText: value })} />

                  <div className="flex flex-wrap gap-5">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={service.published !== false} onChange={(event) => update(service.slug, { published: event.target.checked })} />
                      Published
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={service.featured} onChange={(event) => update(service.slug, { featured: event.target.checked })} />
                      Featured
                    </label>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hero carousel images</div>
                    <div className="grid gap-3">
                      {service.images.map((image, imageIndex) => (
                        <div key={image.id} className="grid gap-3 rounded-xl border border-border bg-surface p-3 md:grid-cols-[88px_1fr_auto] md:items-center">
                          <img src={image.src} alt={image.alt} className="h-16 w-24 rounded-lg object-cover" />
                          <div className="grid gap-2">
                            <label className="inline-flex items-center gap-2 text-xs font-medium text-navy">
                              <input type="radio" name={`primary-${service.slug}`} checked={service.primaryImageId === image.id} onChange={() => update(service.slug, { primaryImageId: image.id })} />
                              Primary image
                            </label>
                            <input value={image.alt} onChange={(event) => updateImage(service.slug, image.id, { alt: event.target.value })} className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" aria-label="Image alt text" />
                          </div>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => moveImage(service.slug, image.id, -1)} disabled={imageIndex === 0} className="grid h-9 w-9 place-items-center rounded-md border border-border disabled:opacity-40" aria-label="Move image up"><GripVertical className="h-4 w-4 rotate-90" /></button>
                            <button type="button" onClick={() => moveImage(service.slug, image.id, 1)} disabled={imageIndex === service.images.length - 1} className="grid h-9 w-9 place-items-center rounded-md border border-border disabled:opacity-40" aria-label="Move image down"><GripVertical className="h-4 w-4 -rotate-90" /></button>
                            <button type="button" onClick={() => removeImage(service.slug, image.id)} className="grid h-9 w-9 place-items-center rounded-md border border-border text-red-600" aria-label="Remove image"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-3 rounded-xl border border-dashed border-border p-3 md:grid-cols-[1fr_auto] md:items-end">
                      <Field label="New image alt text" value={uploadAlt[service.slug] ?? ""} onChange={(value) => setUploadAlt((current) => ({ ...current, [service.slug]: value }))} />
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-surface">
                        <Upload className="h-4 w-4" /> Upload image
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadImage(service, file);
                          event.currentTarget.value = "";
                        }} />
                      </label>
                    </div>
                  </div>

                  <button onClick={() => save(service, index)} disabled={saving === service.slug} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70">
                    {saving === service.slug ? <Plus className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Service
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
    </label>
  );
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
    </label>
  );
}
