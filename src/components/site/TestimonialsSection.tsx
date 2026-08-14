import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
interface Testimonial {
  id: string;
  customer_name: string;
  organisation?: string;
  city?: string;
  rating: number;
  feedback: string;
  created_at?: string;
  is_sample?: boolean;
}

/* ─── Fallback placeholder data ─────────────────────────── */
const placeholderTestimonials: Testimonial[] = [
  {
    id: "p1",
    customer_name: "Dr. Anand Verma",
    organisation: "City Medical Centre",
    city: "Vadodara",
    rating: 5,
    feedback:
      "Arise Healthcare Solutions repaired our Olympus endoscope with outstanding precision. The turnaround was smooth and the image quality after repair was excellent. Highly recommended for any medical facility.",
    created_at: "2024-11-12",
    is_sample: true,
  },
  {
    id: "p2",
    customer_name: "Biomedical Dept.",
    organisation: "District Government Hospital",
    city: "Gujarat",
    rating: 5,
    feedback:
      "We have been using Arise for our laparoscope and rigid scope repairs for over a year. Their diagnostic process is thorough and the team communicates clearly at every step. Very reliable.",
    created_at: "2024-10-05",
    is_sample: true,
  },
  {
    id: "p3",
    customer_name: "Ms. Sunita Joshi",
    organisation: "Sunrise Diagnostic Centre",
    city: "Ahmedabad",
    rating: 5,
    feedback:
      "Our PENTAX video processor was repaired quickly and at a reasonable cost. The quality check before dispatch gave us full confidence. Professional service from start to finish.",
    created_at: "2024-09-20",
    is_sample: true,
  },
  {
    id: "p4",
    customer_name: "Mr. Ravi Nair",
    organisation: "Apollo Specialty Clinic",
    city: "Mumbai",
    rating: 5,
    feedback:
      "Arise handled our Karl Storz nephroscope repair professionally. The equipment came back in perfect working condition with a clear repair report. We will continue to use their services.",
    created_at: "2024-08-14",
    is_sample: true,
  },
  {
    id: "p5",
    customer_name: "Dr. Preethi Menon",
    organisation: "MediScan Imaging",
    city: "Chennai",
    rating: 5,
    feedback:
      "Exceptional repair quality. Our flexible endoscope had articulation issues and Arise fixed it completely. The 3-month warranty gave us peace of mind. We are very satisfied.",
    created_at: "2024-07-30",
    is_sample: true,
  },
  {
    id: "p6",
    customer_name: "Biomedical Team",
    organisation: "Sunshine Multispecialty Hospital",
    city: "Pune",
    rating: 5,
    feedback:
      "We sent a batch of three endoscopes for repair. All returned in excellent condition within the agreed timeline. Arise is now our go-to repair partner for all medical optical equipment.",
    created_at: "2024-06-18",
    is_sample: true,
  },
];

/* ─── Helper: get initials ───────────────────────────────── */
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── Helper: format date ────────────────────────────────── */
function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

/* ─── Avatar colours (deterministic per name) ────────────── */
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

/* ─── Single testimonial card ────────────────────────────── */
function TestimonialCard({ t }: { t: Testimonial }) {
  const date = fmtDate(t.created_at);
  return (
    <div className="group flex h-full flex-col rounded-[18px] border border-white/8 bg-[#193247] p-7 shadow-md transition-all duration-250 hover:-translate-y-1 hover:border-white/16 hover:shadow-xl">
      {/* Header: avatar + name + org */}
      <div className="mb-4 flex items-start gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${avatarColor(t.customer_name)} text-sm font-bold text-white`}
        >
          {initials(t.customer_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold leading-tight text-white">{t.customer_name}</div>
          {(t.organisation || t.city) && (
            <div className="mt-0.5 text-[13px] text-white/45 leading-snug">
              {t.organisation}
              {t.organisation && t.city && t.city !== "—" ? ` · ${t.city}` : ""}
              {!t.organisation && t.city && t.city !== "—" ? t.city : ""}
            </div>
          )}
        </div>
        {/* Google-style G badge */}
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/8 text-[11px] font-extrabold text-white/50">
          G
        </div>
      </div>

      {/* Stars */}
      <div className="mb-3 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "fill-white/10 text-white/10"}`}
          />
        ))}
      </div>

      {/* Review text */}
      <p className="flex-1 text-[15px] leading-[1.65] text-white/55">
        &ldquo;{t.feedback}&rdquo;
      </p>

      {/* Divider + date */}
      <div className="mt-5 border-t border-white/8 pt-4 flex items-center justify-between">
        <div className="text-[12px] text-white/28">{date}</div>
        {t.is_sample && (
          <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
            Sample
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Main exported component ────────────────────────────── */
export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const data = testimonials.length > 0 ? testimonials : placeholderTestimonials;

  /* Slides per view based on window width */
  const [slidesVisible, setSlidesVisible] = useState(3);
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
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /* Autoplay */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5500);
    return () => clearInterval(t);
  }, [paused, maxIndex]);

  function prev() {
    setPaused(true);
    setIndex((i) => Math.max(0, i - 1));
  }
  function next() {
    setPaused(true);
    setIndex((i) => Math.min(maxIndex, i + 1));
  }

  /* Touch swipe */
  const touchStart = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0]?.clientX ?? null;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    const end = e.changedTouches[0]?.clientX;
    if (start !== null && end !== undefined) {
      const diff = start - end;
      if (Math.abs(diff) > 40) {
        if (diff > 0) setIndex((i) => Math.min(maxIndex, i + 1));
        else setIndex((i) => Math.max(0, i - 1));
      }
    }
    touchStart.current = null;
  }

  /* Dot count = number of slides that can be "first" */
  const dotCount = maxIndex + 1;

  return (
    <section
      className="bg-[#071B2A]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x py-24 md:py-28">

        {/* ── Header ── */}
        <div className="mb-10 text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
            What Our Clients Say
          </div>
          <h2 className="font-display text-[2.4rem] font-bold leading-tight text-white md:text-[2.8rem]">
            Trusted by Healthcare Professionals
          </h2>
        </div>

        {/* ── Rating block ── */}
        <div className="mb-16 flex justify-center">
          <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
            {/* Google G */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#4285F4]">
              G
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Google Reviews
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-display text-2xl font-extrabold text-white">4.9</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="text-[12px] text-white/35">Based on verified reviews</div>
            </div>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-label="Testimonials carousel"
          role="region"
        >
          <div
            className="flex gap-5 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(calc(-${index} * (100% / ${slidesVisible} + ${20 / slidesVisible}px)))`,
            }}
          >
            {data.map((t) => (
              <div
                key={t.id}
                className="shrink-0"
                style={{ width: `calc(${100 / slidesVisible}% - ${(20 * (slidesVisible - 1)) / slidesVisible}px)` }}
              >
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="mt-8 flex items-center justify-center gap-5">
          {/* Prev */}
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous testimonials"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-white/50 transition hover:border-[#18b9bb]/50 hover:text-[#18b9bb] disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial page indicators">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to testimonial group ${i + 1}`}
                onClick={() => { setIndex(i); setPaused(true); }}
                className={`rounded-full transition-all duration-300 ${
                  i === index
                    ? "h-2.5 w-7 bg-[#18b9bb]"
                    : "h-2.5 w-2.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            disabled={index >= maxIndex}
            aria-label="Next testimonials"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-white/50 transition hover:border-[#18b9bb]/50 hover:text-[#18b9bb] disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-7 text-center">
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#18b9bb] transition hover:brightness-125"
          >
            View All Testimonials <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
