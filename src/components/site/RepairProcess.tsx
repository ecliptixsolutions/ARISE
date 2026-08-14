import { useEffect, useRef, useState } from "react";
import {
  Truck,
  Search,
  FileText,
  Wrench,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

/* ─── Step data ─────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    badge: "STEP 01",
    title: "Send Your Equipment",
    description:
      "Ship your faulty equipment to our facility through a trusted courier or arrange delivery according to our service process. We provide secure packing guidance to help protect your equipment during transit.",
    tags: ["Secure packaging guidance", "Trusted courier support", "Pan-India service"],
    Icon: Truck,
    accent: {
      text: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
      glow: "shadow-blue-500/20",
      badgeBorder: "border-blue-500/40",
      badgeBg: "bg-blue-500/10",
      badgeText: "text-blue-300",
      tagBorder: "border-blue-500/30",
      tagBg: "bg-blue-500/8",
      tagText: "text-blue-300",
      line: "from-blue-500/40",
    },
  },
  {
    num: "02",
    badge: "STEP 02",
    title: "Free Diagnostic Evaluation",
    description:
      "Our experienced engineers perform a detailed fault analysis to identify the root cause of the equipment issue before recommending the appropriate repair solution.",
    tags: ["Fault report", "Root-cause analysis", "Component-level diagnosis"],
    Icon: Search,
    accent: {
      text: "text-violet-400",
      border: "border-violet-500/30",
      bg: "bg-violet-500/10",
      glow: "shadow-violet-500/20",
      badgeBorder: "border-violet-500/40",
      badgeBg: "bg-violet-500/10",
      badgeText: "text-violet-300",
      tagBorder: "border-violet-500/30",
      tagBg: "bg-violet-500/8",
      tagText: "text-violet-300",
      line: "from-violet-500/40",
    },
  },
  {
    num: "03",
    badge: "STEP 03",
    title: "Transparent Quote",
    description:
      "Receive a clear repair quotation covering the required work and applicable components, with transparent pricing and no unexpected charges.",
    tags: ["Clear quotation", "Parts details", "Transparent pricing"],
    Icon: FileText,
    accent: {
      text: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      glow: "shadow-amber-500/20",
      badgeBorder: "border-amber-500/40",
      badgeBg: "bg-amber-500/10",
      badgeText: "text-amber-300",
      tagBorder: "border-amber-500/30",
      tagBg: "bg-amber-500/8",
      tagText: "text-amber-300",
      line: "from-amber-500/40",
    },
  },
  {
    num: "04",
    badge: "STEP 04",
    title: "Expert Component-Level Repair",
    description:
      "Our engineers perform precision component-level repair using appropriate testing equipment, genuine quality components and established repair procedures.",
    tags: ["Quality components", "Experienced engineers", "Component-level precision"],
    Icon: Wrench,
    accent: {
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
      glow: "shadow-cyan-500/20",
      badgeBorder: "border-cyan-500/40",
      badgeBg: "bg-cyan-500/10",
      badgeText: "text-cyan-300",
      tagBorder: "border-cyan-500/30",
      tagBg: "bg-cyan-500/8",
      tagText: "text-cyan-300",
      line: "from-cyan-500/40",
    },
  },
  {
    num: "05",
    badge: "STEP 05",
    title: "Full-Load Testing & QA",
    description:
      "Every repaired unit undergoes rigorous testing and quality checks before dispatch to ensure reliable performance under the required operating conditions.",
    tags: ["Functional testing", "Quality inspection", "QA sign-off"],
    Icon: BadgeCheck,
    accent: {
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      glow: "shadow-emerald-500/20",
      badgeBorder: "border-emerald-500/40",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-300",
      tagBorder: "border-emerald-500/30",
      tagBg: "bg-emerald-500/8",
      tagText: "text-emerald-300",
      line: "from-emerald-500/40",
    },
  },
  {
    num: "06",
    badge: "STEP 06",
    title: "Dispatch with Warranty",
    description:
      "Once the repair has successfully passed testing and quality checks, the equipment is securely packed and dispatched with the applicable repair documentation and warranty.",
    tags: ["3-month warranty", "Test report", "Secure dispatch"],
    Icon: ShieldCheck,
    accent: {
      text: "text-pink-400",
      border: "border-pink-500/30",
      bg: "bg-pink-500/10",
      glow: "shadow-pink-500/20",
      badgeBorder: "border-pink-500/40",
      badgeBg: "bg-pink-500/10",
      badgeText: "text-pink-300",
      tagBorder: "border-pink-500/30",
      tagBg: "bg-pink-500/8",
      tagText: "text-pink-300",
      line: "from-pink-500/40",
    },
  },
] as const;

/* ─── Intersection-observer hook ────────────────────────── */
function useVisible(threshold = 0.2) {
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

/* ─── Individual step row ────────────────────────────────── */
function StepRow({
  step,
  isLast,
  index,
}: {
  step: (typeof steps)[number];
  isLast: boolean;
  index: number;
}) {
  const { ref, visible } = useVisible(0.15);
  const { Icon, accent } = step;

  return (
    <div ref={ref}>
      <div
        className="flex gap-0"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(28px)",
          transition: `opacity 600ms ease ${index * 80}ms, transform 600ms ease ${index * 80}ms`,
        }}
      >
        {/* ── Timeline column ── */}
        <div className="relative flex shrink-0 flex-col items-center"
          style={{ width: "96px" }}>
          {/* Line above icon (hidden for first step) */}
          {index > 0 && (
            <div className="w-px flex-1 bg-gradient-to-b from-white/6 to-white/6"
              style={{ minHeight: "0px", height: "24px" }} />
          )}

          {/* Icon container */}
          <div
            className={`
              group relative z-10 grid shrink-0 place-items-center rounded-[18px]
              border ${accent.border} ${accent.bg}
              shadow-lg ${accent.glow}
              transition-all duration-250
              hover:scale-105 hover:shadow-xl
              w-[88px] h-[88px]
              sm:w-[92px] sm:h-[92px]
            `}
          >
            <Icon
              className={`h-8 w-8 sm:h-9 sm:w-9 ${accent.text} transition-transform duration-250 group-hover:scale-105`}
            />
            {/* Subtle inner glow ring */}
            <div
              className={`pointer-events-none absolute inset-0 rounded-[18px] opacity-0 ring-1 ring-inset transition-opacity duration-250 group-hover:opacity-100 ${accent.border}`}
            />
          </div>

          {/* Line below icon (hidden for last step) */}
          {!isLast && (
            <div
              className="mt-1 w-px grow bg-gradient-to-b from-white/10 to-white/4"
              style={{ minHeight: "80px" }}
            />
          )}
        </div>

        {/* ── Content column ── */}
        <div
          className="relative ml-6 flex-1 pb-0 sm:ml-8"
          style={{ paddingTop: "14px" }}
        >
          {/* Large faded step number */}
          <span
            aria-hidden
            className={`pointer-events-none absolute right-0 top-0 select-none font-extrabold leading-none text-white/[0.05]`}
            style={{ fontSize: "clamp(72px, 9vw, 110px)", lineHeight: 1 }}
          >
            {step.num}
          </span>

          {/* Step badge */}
          <div
            className={`mb-3 inline-flex items-center rounded-full border ${accent.badgeBorder} ${accent.badgeBg} px-3 py-1`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accent.badgeText}`}
            >
              {step.badge}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[20px] font-bold leading-snug text-white sm:text-[22px]">
            {step.title}
          </h3>

          {/* Description */}
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-white/50 sm:text-[16px]">
            {step.description}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {step.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border ${accent.tagBorder} ${accent.tagBg} px-3 py-1 text-[11px] font-semibold ${accent.tagText}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Horizontal separator (hidden for last step) */}
          {!isLast && (
            <div className="mt-10 h-px w-full bg-gradient-to-r from-white/8 via-white/4 to-transparent" />
          )}

          {/* Bottom spacing */}
          <div className={isLast ? "pb-2" : "pb-10"} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main exported component ────────────────────────────── */
export function RepairProcess() {
  return (
    <section className="bg-[#071D2B]">
      <div
        className="mx-auto px-4 py-20 sm:px-6 md:py-24 lg:px-8"
        style={{ maxWidth: "1100px" }}
      >
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
            How It Works
          </div>
          <h2 className="font-display text-[2.4rem] font-bold leading-tight text-white sm:text-[2.75rem]">
            Our 6-Step Repair Process
          </h2>
          <p className="mx-auto mt-4 max-w-[660px] text-[17px] leading-relaxed text-white/50 sm:text-[19px]">
            Engineered for speed, precision, and complete transparency — from the moment your
            equipment arrives to the day it ships back, repaired and warrantied.
          </p>
        </div>

        {/* Timeline */}
        <div>
          {steps.map((step, i) => (
            <StepRow
              key={step.num}
              step={step}
              isLast={i === steps.length - 1}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
