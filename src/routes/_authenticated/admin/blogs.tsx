import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Plus, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deleteAdminBlog,
  getAdminBlogs,
  saveAdminBlog,
  type ManagedBlog,
} from "@/lib/blog-content";
import { hasPermission } from "@/lib/admin-access";
import { apiPost } from "@/integrations/mysql/client";

export const Route = createFileRoute("/_authenticated/admin/blogs")({ component: Page });

const blankBlog: ManagedBlog = {
  slug: "",
  title: "",
  category: "Repair Insights",
  difficulty: "Beginner",
  readingTime: 5,
  date: new Date().toISOString().slice(0, 10),
  excerpt: "",
  image: "",
  imageAlt: "",
  keywords: [],
  equipment: [],
  body: "",
  takeaways: [],
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  author: "Arise Healthcare Solutions",
  primaryKeyword: "",
  secondaryKeywords: [],
  canonicalUrl: "",
  ogImageUrl: "",
};

const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15";
const loadStep = 5;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL_LEGACY ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY_LEGACY ?? "";
const IMAGE_BUCKET = "admin-images";

function imagePublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

async function uploadBlogThumbnail(file: File) {
  const valid = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!valid) throw new Error("Upload JPG, PNG or WEBP files only.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Image upload is not configured.");

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `blog-thumbnails/${Date.now()}-${safeName}`;
  const formData = new FormData();
  formData.append("", file);

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${IMAGE_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "x-upsert": "false",
      "Cache-Control": "31536000",
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed.");

  const url = imagePublicUrl(path);
  const { error } = await apiPost("/api/website-images", {
    bucket: IMAGE_BUCKET,
    path,
    url,
    alt_text: file.name.replace(/\.[^.]+$/, ""),
    category: "blog-thumbnail",
    is_primary: 0,
  });
  if (error) throw new Error(error.message);
  return { url, alt: file.name.replace(/\.[^.]+$/, "") };
}

function Page() {
  const auth = useRouteContext({ from: "/_authenticated" });
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sort, setSort] = useState("newest");
  const [editing, setEditing] = useState<ManagedBlog | null>(null);
  const [visibleCount, setVisibleCount] = useState(loadStep);
  const canManage = hasPermission(auth, "blogs");

  const blogsQuery = useQuery({
    queryKey: ["admin-blogs", q, status, category, difficulty, sort],
    enabled: canManage,
    queryFn: async () => {
      const { data, error } = await getAdminBlogs({
        q,
        status,
        category,
        difficulty,
        sort,
        pageSize: "100",
      });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set((blogsQuery.data?.items ?? []).map((b) => b.category)))],
    [blogsQuery.data?.items],
  );

  useEffect(() => setVisibleCount(loadStep), [q, status, category, difficulty, sort]);

  const saveMutation = useMutation({
    mutationFn: async (blog: ManagedBlog) => {
      const res = await saveAdminBlog(blog);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Blog saved successfully.");
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save blog"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteAdminBlog(id);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Blog deleted.");
      void qc.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });

  if (!canManage) {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">You do not have permission to manage blogs.</div>;
  }

  const blogs = blogsQuery.data?.items ?? [];
  const visibleBlogs = blogs.slice(0, visibleCount);
  const remaining = Math.max(0, blogs.length - visibleBlogs.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Blog Management</h1>
          <p className="text-sm text-muted-foreground">{blogsQuery.data?.total ?? 0} blogs in the database</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void blogsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-surface"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setEditing(blankBlog)}
            className="inline-flex items-center gap-2 rounded-lg btn-primary px-3 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Add New Blog
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_repeat(4,160px)]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, slug, tags..." className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm" />
          </label>
          <Select value={status} onChange={setStatus} options={["all", "published", "draft"]} />
          <Select value={category} onChange={setCategory} options={categories} />
          <Select value={difficulty} onChange={setDifficulty} options={["All", "Beginner", "Intermediate", "Advanced", "Expert"]} />
          <Select value={sort} onChange={setSort} options={["newest", "oldest", "updated", "title_az", "title_za"]} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Blog</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleBlogs.map((blog) => (
              <tr key={blog.id ?? blog.slug}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {blog.image ? <img src={blog.image} alt={blog.imageAlt ?? blog.title} className="h-12 w-16 rounded-md object-cover" /> : <div className="h-12 w-16 rounded-md bg-surface" />}
                    <div>
                      <div className="font-semibold text-navy">{blog.title}</div>
                      <div className="text-xs text-muted-foreground">{blog.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{blog.category}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-surface px-2 py-1 text-xs font-semibold">{blog.status}</span></td>
                <td className="px-4 py-3">{blog.date}</td>
                <td className="px-4 py-3">{blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString("en-IN") : "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link to="/blogs/$slug" params={{ slug: blog.slug }} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> Preview</Link>
                    <button onClick={() => setEditing(blog)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-semibold"><Edit className="h-3.5 w-3.5" /> Edit</button>
                    {auth.isAdmin && blog.id && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this blog?")) deleteMutation.mutate(blog.id!);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!blogsQuery.isLoading && blogs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No blogs found. Add a new one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {remaining > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + loadStep)}
            className="inline-flex items-center gap-2 rounded-lg btn-primary px-5 py-3 text-sm font-semibold"
          >
            Load More ({remaining} left)
          </button>
        </div>
      )}

      {editing && (
        <BlogEditor
          blog={editing}
          onCancel={() => setEditing(null)}
          onSave={(blog) => saveMutation.mutate(blog)}
        />
      )}
    </div>
  );
}

function BlogEditor({ blog, onCancel, onSave }: { blog: ManagedBlog; onCancel: () => void; onSave: (blog: ManagedBlog) => void }) {
  const [draft, setDraft] = useState<ManagedBlog>(blog);
  const [uploading, setUploading] = useState(false);
  const set = (patch: Partial<ManagedBlog>) => setDraft((current) => ({ ...current, ...patch }));
  const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const csv = (items?: string[]) => items?.join(", ") ?? "";
  const fromCsv = (value: string) => value.split(",").map((x) => x.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-navy">{draft.id ? "Edit Blog" : "Add Blog"}</h2>
          <button onClick={onCancel} className="rounded-lg border border-border px-3 py-2 text-sm">Cancel</button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Field label="Title"><input value={draft.title} onChange={(e) => set({ title: e.target.value, slug: draft.slug || slugify(e.target.value) })} className={fieldClass} /></Field>
          <Field label="Slug"><input value={draft.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} className={fieldClass} /></Field>
          <Field label="Category"><input value={draft.category} onChange={(e) => set({ category: e.target.value })} className={fieldClass} /></Field>
          <Field label="Difficulty"><select value={draft.difficulty} onChange={(e) => set({ difficulty: e.target.value as ManagedBlog["difficulty"] })} className={fieldClass}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></Field>
          <Field label="Reading Time"><input type="number" min="1" value={draft.readingTime ?? 4} onChange={(e) => set({ readingTime: Number(e.target.value) })} className={fieldClass} /></Field>
          <Field label="Publication Date"><input type="date" value={draft.date ?? ""} onChange={(e) => set({ date: e.target.value })} className={fieldClass} /></Field>
          <Field label="Status"><select value={draft.status ?? "draft"} onChange={(e) => set({ status: e.target.value as ManagedBlog["status"] })} className={fieldClass}><option value="draft">Draft</option><option value="published">Published</option></select></Field>
          <Field label="Author"><input value={draft.author ?? ""} onChange={(e) => set({ author: e.target.value })} className={fieldClass} /></Field>
        </div>

        <Field label="Excerpt"><textarea value={draft.excerpt} onChange={(e) => set({ excerpt: e.target.value })} rows={3} className={fieldClass} /></Field>

        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="text-sm font-semibold text-navy">Thumbnail</div>
            {draft.image ? <img src={draft.image} alt={draft.imageAlt ?? draft.title} className="mt-2 aspect-[16/10] w-full rounded-lg object-cover" /> : <div className="mt-2 aspect-[16/10] rounded-lg bg-surface" />}
          </div>
          <div className="grid gap-4">
            <label className="mt-4 block text-sm font-semibold text-navy">
              <span className="mb-1 block">Upload Thumbnail Image</span>
              <span className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-surface">
                <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : draft.image ? "Replace Thumbnail" : "Upload Thumbnail"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.currentTarget.value = "";
                    if (!file) return;
                    setUploading(true);
                    uploadBlogThumbnail(file)
                      .then(({ url, alt }) => {
                        set({ image: url, ogImageUrl: url, imageAlt: draft.imageAlt || alt });
                        toast.success("Thumbnail uploaded");
                      })
                      .catch((error) => toast.error(error instanceof Error ? error.message : "Image upload failed"))
                      .finally(() => setUploading(false));
                  }}
                />
              </span>
            </label>
            <Field label="Thumbnail Alt Text"><input value={draft.imageAlt ?? ""} onChange={(e) => set({ imageAlt: e.target.value })} className={fieldClass} /></Field>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Field label="Primary Keyword"><input value={draft.primaryKeyword ?? ""} onChange={(e) => set({ primaryKeyword: e.target.value })} className={fieldClass} /></Field>
          <Field label="Tags / Keywords"><input value={csv(draft.keywords)} onChange={(e) => set({ keywords: fromCsv(e.target.value) })} className={fieldClass} /></Field>
          <Field label="Secondary Keywords"><input value={csv(draft.secondaryKeywords)} onChange={(e) => set({ secondaryKeywords: fromCsv(e.target.value) })} className={fieldClass} /></Field>
          <Field label="Equipment"><input value={csv(draft.equipment)} onChange={(e) => set({ equipment: fromCsv(e.target.value) })} className={fieldClass} /></Field>
          <Field label="Meta Title"><input value={draft.seoTitle ?? ""} onChange={(e) => set({ seoTitle: e.target.value })} className={fieldClass} /></Field>
          <Field label="Canonical URL"><input value={draft.canonicalUrl ?? ""} onChange={(e) => set({ canonicalUrl: e.target.value })} className={fieldClass} /></Field>
        </div>
        <Field label="Meta Description"><textarea value={draft.seoDescription ?? ""} onChange={(e) => set({ seoDescription: e.target.value })} rows={2} className={fieldClass} /></Field>
        <Field label="Article Content"><textarea value={draft.body} onChange={(e) => set({ body: e.target.value })} rows={14} className={`${fieldClass} font-mono`} /></Field>
        <Field label="Key Takeaways"><textarea value={csv(draft.takeaways)} onChange={(e) => set({ takeaways: fromCsv(e.target.value) })} rows={3} className={fieldClass} /></Field>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Cancel</button>
          <button onClick={() => onSave(draft)} className="rounded-lg btn-primary px-4 py-2 text-sm font-semibold">Save Blog</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block text-sm font-semibold text-navy"><span className="mb-1 block">{label}</span>{children}</label>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
}
