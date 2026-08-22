import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  id: string;
  customer_name: string;
  organisation?: string | null;
  city?: string | null;
  rating: number;
  feedback: string;
  created_at?: string;
  is_sample?: boolean;
  profile_photo_url?: string | null;
}

const googleReviewsUrl =
  "https://www.google.com/maps/search/?api=1&query=ARISE%20HEALTHCARE%20SOLUTIONS%20334%20Lotus%20Enora%20New%20Alkapuri%20Vadodara%20Gujarat";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

const avatarPalette = [
  "bg-[#1a7f8e]",
  "bg-[#2563a8]",
  "bg-[#6d5abf]",
  "bg-[#14856b]",
  "bg-[#b45309]",
  "bg-[#9f2020]",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffff;
  return avatarPalette[Math.abs(hash) % avatarPalette.length];
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/7 px-3 py-1.5 text-[11px] font-semibold text-white/62">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-extrabold text-[#4285F4]">
        G
      </span>
      Google Review
    </span>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const date = fmtDate(testimonial.created_at);

  return (
    <div className="group flex h-full flex-col rounded-[18px] border border-white/8 bg-[#193247] p-7 shadow-md transition-all duration-250 hover:-translate-y-1 hover:border-white/16 hover:shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <GoogleBadge />
        {date && <div className="shrink-0 text-[12px] text-white/35">{date}</div>}
      </div>

      <div className="mb-3 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-white/10 text-white/10"
            }`}
          />
        ))}
      </div>

      <p className="flex-1 break-words text-[15px] leading-[1.65] text-white/55">
        &ldquo;{testimonial.feedback}&rdquo;
      </p>

      <div className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
        {testimonial.profile_photo_url ? (
          <img
            src={testimonial.profile_photo_url}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${avatarColor(
              testimonial.customer_name,
            )} text-sm font-bold text-white`}
          >
            {initials(testimonial.customer_name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="break-words text-[15px] font-bold leading-tight text-white">
            {testimonial.customer_name}
          </div>
          <div className="mt-0.5 text-[13px] leading-snug text-white/45">Google Review</div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const data = testimonials.filter((testimonial) => !testimonial.is_sample && testimonial.feedback && testimonial.customer_name);
  const [slidesVisible, setSlidesVisible] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setSlidesVisible(1);
      else if (window.innerWidth < 1024) setSlidesVisible(2);
      else setSlidesVisible(3);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, data.length - slidesVisible);
  const dotCount = maxIndex + 1;

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (paused || data.length <= slidesVisible) return;
    const timer = setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 5500);
    return () => clearInterval(timer);
  }, [data.length, maxIndex, paused, slidesVisible]);

  function prev() {
    setPaused(true);
    setIndex((current) => Math.max(0, current - 1));
  }

  function next() {
    setPaused(true);
    setIndex((current) => Math.min(maxIndex, current + 1));
  }

  function onTouchStart(event: React.TouchEvent) {
    touchStart.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current;
    const end = event.changedTouches[0]?.clientX;
    if (start !== null && end !== undefined) {
      const diff = start - end;
      if (Math.abs(diff) > 40) {
        if (diff > 0) setIndex((current) => Math.min(maxIndex, current + 1));
        else setIndex((current) => Math.max(0, current - 1));
      }
    }
    touchStart.current = null;
  }

  return (
    <section
      className="bg-[#071B2A]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x py-24 md:py-28">
        <div className="mb-10 text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
            What Our Clients Say
          </div>
          <h2 className="font-display text-[2.4rem] font-bold leading-tight text-white md:text-[2.8rem]">
            Trusted by Healthcare Professionals
          </h2>
        </div>

        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#4285F4]">
              G
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Google Reviews
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-display text-2xl font-extrabold text-white">Google</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="text-[12px] text-white/35">Real reviews only</div>
            </div>
          </div>
        </div>

        {data.length > 0 ? (
          <>
            <div
              className="overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              aria-label="Google reviews carousel"
              role="region"
            >
              <div
                className="flex gap-5 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(calc(-${index} * (100% / ${slidesVisible} + ${20 / slidesVisible}px)))`,
                }}
              >
                {data.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="shrink-0"
                    style={{ width: `calc(${100 / slidesVisible}% - ${(20 * (slidesVisible - 1)) / slidesVisible}px)` }}
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>

            {data.length > slidesVisible && (
              <div className="mt-8 flex items-center justify-center gap-5">
                <button
                  onClick={prev}
                  disabled={index === 0}
                  aria-label="Previous reviews"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-white/50 transition hover:border-[#18b9bb]/50 hover:text-[#18b9bb] disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2" role="tablist" aria-label="Review page indicators">
                  {Array.from({ length: dotCount }).map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      role="tab"
                      aria-selected={dotIndex === index}
                      aria-label={`Go to review group ${dotIndex + 1}`}
                      onClick={() => {
                        setIndex(dotIndex);
                        setPaused(true);
                      }}
                      className={`rounded-full transition-all duration-300 ${
                        dotIndex === index ? "h-2.5 w-7 bg-[#18b9bb]" : "h-2.5 w-2.5 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  disabled={index >= maxIndex}
                  aria-label="Next reviews"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-white/50 transition hover:border-[#18b9bb]/50 hover:text-[#18b9bb] disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            className="mx-auto max-w-2xl rounded-[18px] border border-white/10 bg-white/5 p-7 text-center shadow-md"
            role="status"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-base font-extrabold text-[#4285F4]">
              G
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Google reviews will appear here</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/55">
              Real Google review data has not been connected yet. No sample or fabricated testimonials are shown.
            </p>
          </div>
        )}

        <div className="mt-7 text-center">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#18b9bb] transition hover:brightness-125"
          >
            View all reviews on Google <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
