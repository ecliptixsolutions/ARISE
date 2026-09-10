import { apiGet } from "@/integrations/mysql/client";
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
  is_published: boolean | number;
  is_featured: boolean | number;
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
    featured: Boolean(row.is_featured),
    published: Boolean(row.is_published),
    primaryImageId: row.primary_image_id ?? fallback?.primaryImageId,
    carouselImageIds: fallback?.carouselImageIds ?? serviceImageIds,
    heroImages: row.carousel_images?.length ? row.carousel_images : fallback?.heroImages,
  });
}

function mergeRows(rows: ServiceRow[] | null | undefined, includeUnpublished = false) {
  const rowMap = new Map((rows ?? []).map(row => [row.slug, row]));
  const merged = staticServices.map((service, index) => {
    const row = rowMap.get(service.slug);
    rowMap.delete(service.slug);
    return {
      service: row ? rowToService(row, service) : normaliseService(service),
      order: row?.sort_order ?? index,
    };
  });

  rowMap.forEach((row, slug) => {
    merged.push({
      service: rowToService(row, findServiceBySlug(staticServices, slug)),
      order: row.sort_order ?? merged.length,
    });
  });

  return merged
    .sort((a, b) => a.order - b.order)
    .map(({ service }) => service)
    .filter(service => includeUnpublished || service.published !== false);
}

export async function getPublicServices() {
  try {
    const { data, error } = await apiGet<ServiceRow[]>("/api/services");
    if (error) throw new Error(error.message);
    return mergeRows(data);
  } catch {
    return staticServices.map(normaliseService).filter(s => s.published !== false);
  }
}

export async function getAdminServices() {
  try {
    const { data, error } = await apiGet<ServiceRow[]>("/api/services");
    if (error) throw new Error(error.message);
    return mergeRows(data, true);
  } catch {
    return staticServices.map(normaliseService);
  }
}

export async function getPublicServiceBySlug(slug: string) {
  const services = await getPublicServices();
  return findServiceBySlug(services, slug);
}
