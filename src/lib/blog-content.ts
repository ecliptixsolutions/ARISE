import { apiDelete, apiGet, apiPatch, apiPost } from "@/integrations/mysql/client";
import { blogs as staticBlogs, type Blog } from "@/lib/site-data";

export type ManagedBlog = Blog & {
  id?: string;
  status?: "draft" | "published";
  author?: string;
  primaryKeyword?: string | null;
  secondaryKeywords?: string[];
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  updatedAt?: string;
};

export type BlogListResponse = {
  items: ManagedBlog[];
  total: number;
  page: number;
  pageSize: number;
};

export function staticBlogsForSeed(): ManagedBlog[] {
  return staticBlogs.map((blog) => ({
    ...blog,
    status: "published",
    author: "Arise Healthcare Solutions",
    primaryKeyword: blog.keywords?.[0] ?? blog.category,
    secondaryKeywords: blog.keywords?.slice(1) ?? [],
    canonicalUrl: `/blogs/${blog.slug}`,
    ogImageUrl: blog.image,
  }));
}

export async function getPublicBlogs(params?: Record<string, string>) {
  return apiGet<BlogListResponse>("/api/blogs", params);
}

export async function getPublicBlog(slug: string) {
  return apiGet<ManagedBlog>(`/api/blogs/${slug}`);
}

export async function getAdminBlogs(params?: Record<string, string>) {
  return apiGet<BlogListResponse>("/api/admin/blogs", params);
}

export async function saveAdminBlog(blog: ManagedBlog) {
  return blog.id
    ? apiPatch(`/api/admin/blogs/${blog.id}`, blog)
    : apiPost<{ id: string }>("/api/admin/blogs", blog);
}

export async function deleteAdminBlog(id: string) {
  return apiDelete(`/api/admin/blogs/${id}`);
}

export async function seedStaticBlogs() {
  return apiPost<{ ok: boolean; accepted: number; inserted: number; updated: number }>(
    "/api/admin/blogs/seed",
    {
    blogs: staticBlogsForSeed(),
    },
  );
}
