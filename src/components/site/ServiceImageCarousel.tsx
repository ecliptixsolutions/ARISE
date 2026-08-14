import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { serviceImages, type ServiceImage } from "@/lib/site-data";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function ServiceImageCarousel({ images }: { images: ServiceImage[] }) {
  const slides = useMemo(() => (images.length ? images : serviceImages), [images]);
  const fallback = serviceImages[0];
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setSelected(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || paused || reducedMotion) return;
    const timer = window.setInterval(() => api.scrollNext(), 5000);
    return () => window.clearInterval(timer);
  }, [api, paused, reducedMotion]);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-2xl shadow-primary/15"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="outline-none"
        aria-label="Service image carousel"
        tabIndex={0}
      >
        <CarouselContent className="-ml-0">
          {slides.map((image, index) => (
            <CarouselItem key={`${image.id}-${index}`} className="pl-0">
              <div className="aspect-[16/10] bg-surface">
                <img
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={750}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding={index === 0 ? "sync" : "async"}
                  className="h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none"
                  onError={(event) => {
                    if (event.currentTarget.src !== fallback.src) {
                      event.currentTarget.src = fallback.src;
                      event.currentTarget.alt = fallback.alt;
                    }
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <button
        type="button"
        onClick={() => api?.scrollPrev()}
        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 text-primary shadow-lg transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => api?.scrollNext()}
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 text-primary shadow-lg transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2"
        role="tablist"
        aria-label="Carousel navigation"
      >
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
              index === selected ? "w-6 bg-primary" : "w-2 bg-white/80 hover:bg-gold-soft"
            }`}
            role="tab"
            aria-selected={index === selected}
            aria-label={`Show image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
