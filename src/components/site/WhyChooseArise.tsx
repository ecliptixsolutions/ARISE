import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Clock,
  Users,
  Zap,
  ShieldCheck,
  Globe,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

/* ─── Scroll-reveal hook ─────────────────────────────────── */
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Card data ──────────────────────────────────────────── */
const reasons = [
  {
    title: "8+ Years of Experience",
    description:
      "Experienced in equipment repair, servicing and technical support with a strong focus on dependable customer outcomes.",
    Icon: Clock,
    accent: {
      text: "text-[#18b9bb]",
      border: "border-[#18b9bb]/25",
      bg: "bg-[#18b9bb]/10",
      glow: "hover:shadow-[#18b9bb]/15",
      cardBorder: "hover:border-[#18b9bb]/30",
    },
  },
  {
    title: "10+ Engineers & Experts",
    description:
      "A team of experienced technical professionals focused on diagnostics, repair and service support.",
    Icon: Users,
    accent: {
      text: "text-blue-400",
      border: "border-blue-400/25",
      bg: "bg-blue-400/10",
      glow: "hover:shadow-blue-400/15",
      cardBorder: "hover:border-blue-400/30",
    },
  },
  {
    title: "Efficient Service",
    description:
      "Streamlined diagnostics and repair processes designed to reduce equipment downtime and keep operations moving.",
    Icon: Zap,
    accent: {
      text: "text-amber-400",
      border: "border-amber-400/25",
      bg: "bg-amber-400/10",
      glow: "hover:shadow-amber-400/15",
      cardBorder: "hover:border-amber-400/30",
    },
  },
  {
    title: "3-Month Repair Warranty",
    description:
      "Applicable repairs are supported by a 3-month repair warranty, providing added confidence after service.",
    Icon: ShieldCheck,
    accent: {
      text: "text-emerald-400",
      border: "border-emerald-400/25",
      bg: "bg-emerald-400/10",
      glow: "hover:shadow-emerald-400/15",
      cardBorder: "hover:border-emerald-400/30",
    },
  },
  {
    title: "Wide Service Reach",
    description:
      "Supporting customers across multiple locations and industries through responsive equipment repair and service capabilities.",
    Icon: Globe,
    accent: {
      text: "text-violet-400",
      border: "border-violet-400/25",
      bg: "bg-violet-400/10",
      glow: "hover:shadow-violet-400/15",
      cardBorder: "hover:border-violet-400/30",
    },
  },
  {
    title: "Quality-Focused Repairs",
    description:
      "Detailed diagnostics, repair documentation and testing help ensure consistent quality before equipment is returned to service.",
    Icon: Star,
    accent: {
      text: "text-pink-400",
      border: "border-pink-400/25",
      bg: "bg-pink-400/10",
      glow: "hover:shadow-pink-400/15",
      cardBorder: "hover:border-pink-400/30",
    },
  },
] as const;

const trustPoints = [
  "Reliable repair and service support",
  "Experienced engineers and technical specialists",
  "Quality-focused diagnostics and testing",
  "3-month repair warranty on applicable repairs",
];

/* ─── Main component ─────────────────────────────────────── */
export function WhyChooseArise() {
  const { ref: leftRef, visible: leftVisible } = useVisible(0.1);
  const { ref: rightRef, visible: rightVisible } = useVisible(0.1);

  return (
    <section className="bg-[#081E2D]">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#18b9bb]/4 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/4 blur-[100px]" />
      </div>

      <div className="relative container-x py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[45fr_55fr] lg:gap-16 lg:items-start">

          {/* ── LEFT COLUMN ── */}
          <div
            ref={leftRef}
            style={{
              opacity: leftVisible ? 1 : 0,
              transform: leftVisible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 650ms ease, transform 650ms ease",
            }}
          >
            {/* Eyebrow */}
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
              Why Arise
            </div>

            {/* Heading */}
            <h2 className="font-display text-[2.4rem] font-bold leading-[1.15] text-white sm:text-[2.75rem]">
              India's Trusted{" "}
              <span className="text-[#18b9bb]">
                Healthcare Equipment Repair &amp; Service Partner
              </span>
            </h2>

            {/* Paragraph */}
            <p className="mt-5 max-w-[560px] text-[17px] leading-[1.65] text-white/52">
              With 8+ years of experience, Arise Healthcare Solutions provides dependable equipment
              repair, servicing and technical support for healthcare and industrial applications.
              Our experienced team focuses on accurate diagnostics, quality repairs and reliable
              after-sales support.
            </p>

            {/* Trust points */}
            <ul className="mt-7 space-y-3">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#18b9bb]/15 ring-1 ring-[#18b9bb]/30">
                    <CheckCircle2 className="h-3 w-3 text-[#18b9bb]" />
                  </span>
                  <span className="text-[15px] leading-snug text-white/60">{point}</span>
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#18b9bb] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-0.5 hover:brightness-110"
              >
                Why Choose Arise <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Divider */}
            <div className="mt-9 h-px w-full bg-white/8" />

            {/* Certifications area */}
            <div className="mt-7">
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
                Certifications &amp; Registrations
              </div>
              <div className="flex flex-wrap gap-3">
                {/* MSME Registration */}
                <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#18b9bb]/15 ring-1 ring-[#18b9bb]/25">
                    <ShieldCheck className="h-4 w-4 text-[#18b9bb]" />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                      MSME Registered
                    </div>
                    <div className="text-[10px] text-white/35">Govt. of India</div>
                  </div>
                </div>
                {/* Since 2018 */}
                <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/15 ring-1 ring-blue-400/25">
                    <Clock className="h-4 w-4 text-blue-400" />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                      Est. 2018
                    </div>
                    <div className="text-[10px] text-white/35">8+ Years of service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — 2×3 card grid ── */}
          <div
            ref={rightRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {reasons.map(({ title, description, Icon, accent }, i) => (
              <div
                key={title}
                className={`group rounded-[18px] border border-white/8 bg-white/4 p-6 shadow-sm transition-all duration-250 hover:-translate-y-1 hover:bg-white/7 hover:shadow-xl ${accent.glow} ${accent.cardBorder}`}
                style={{
                  opacity: rightVisible ? 1 : 0,
                  transform: rightVisible ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 600ms ease ${i * 70}ms, transform 600ms ease ${i * 70}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-[13px] border ${accent.border} ${accent.bg} transition-transform duration-250 group-hover:scale-105`}
                >
                  <Icon className={`h-5 w-5 ${accent.text}`} />
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-bold leading-snug text-white">{title}</h3>

                {/* Description */}
                <p className="mt-2 text-[14px] leading-relaxed text-white/48">{description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
