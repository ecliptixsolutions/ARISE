import { supabase } from "@/integrations/supabase/client";
import {
  findServiceBySlug,
  normaliseService,
  serviceImageIds,
  services as staticServices,
  type Service,
  type ServiceImage,
} from "@/lib/site-data";

type ServiceRow = {
  slug: string;
  name: string;
  category: string;
  short_description: string;
  detailed_description: string;
  common_problems: string[] | null;
  carousel_images: ServiceImage[] | null;
  primary_image_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number | null;
};

function rowToService(row: ServiceRow, fallback?: Service): Service {
  return normaliseService({
    slug: row.slug,
    aliases: fallback?.aliases,
    name: row.name,
    category: row.category,
    short: row.short_description,
    description: fallback?.description ?? row.short_description,
    detailedDescription: row.detailed_description,
    commonProblems: row.common_problems?.length ? row.common_problems : (fallback?.commonProblems ?? []),
    bullets: fallback?.bullets ?? [],
    featured: row.is_featured,
    published: row.is_published,
    primaryImageId: row.primary_image_id ?? fallback?.primaryImageId,
    carouselImageIds: fallback?.carouselImageIds ?? serviceImageIds,
    heroImages: row.carousel_images?.length ? row.carousel_images : fallback?.heroImages,
  });
}

function mergeRows(rows: ServiceRow[] | null | undefined, includeUnpublished = false) {
  const rowMap = new Map((rows ?? []).map((row) => [row.slug, row]));
  const merged = staticServices.map((service, index) => {
    const row = rowMap.get(service.slug);
    rowMap.delete(service.slug);
    return {
      service: row ? rowToService(row, service) : normaliseService(service),
      order: row?.sort_order ?? index,
    };
  });

  rowMap.forEach((row, slug) => {
    merged.push({ service: rowToService(row, findServiceBySlug(staticServices, slug)), order: row.sort_order ?? merged.length });
  });

  return merged
    .sort((a, b) => a.order - b.order)
    .map(({ service }) => service)
    .filter((service) => includeUnpublished || service.published !== false);
}

export async function getPublicServices() {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("slug,name,category,short_description,detailed_description,common_problems,carousel_images,primary_image_id,is_published,is_featured,sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return mergeRows(data as ServiceRow[]);
  } catch {
    return staticServices.map(normaliseService).filter((service) => service.published !== false);
  }
}

export async function getAdminServices() {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("slug,name,category,short_description,detailed_description,common_problems,carousel_images,primary_image_id,is_published,is_featured,sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return mergeRows(data as ServiceRow[], true);
  } catch {
    return staticServices.map(normaliseService);
  }
}

export async function getPublicServiceBySlug(slug: string) {
  const loadedServices = await getPublicServices();
  return findServiceBySlug(loadedServices, slug);
}

