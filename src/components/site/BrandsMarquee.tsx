import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

/* ─── Brand lists ─────────────────────────────────────────── */
const row1 = [
  "Olympus",
  "KARL STORZ",
  "Richard Wolf",
  "Fujifilm",
  "PENTAX Medical",
  "Stryker",
  "Aesculap",
  "B. Braun",
  "SCHÖLLY",
  "RZ Medizintechnik",
  "Ackermann",
  "Smith & Nephew",
  "Arthrex",
  "Ambu",
];

const row2 = [
  "HOYA",
  "Dräger",
  "GE HealthCare",
  "Philips",
  "Mindray",
  "Siemens Healthineers",
  "Nihon Kohden",
  "Getinge",
  "Hillrom",
  "Baxter",
  "STERIS",
  "Boston Scientific",
  "Medtronic",
  "CONMED",
  "Olympus",
  "KARL STORZ",
  "Richard Wolf",
  "PENTAX Medical",
];

/* ─── Single pill ─────────────────────────────────────────── */
function BrandPill({ name }: { name: string }) {
  return (
    <span className="group mx-2 inline-flex shrink-0 cursor-default items-center whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[14px] font-semibold text-white/60 transition-all duration-250 hover:-translate-y-0.5 hover:border-[#18b9bb]/50 hover:text-white hover:shadow-[0_0_14px_rgba(24,185,187,0.15)]">
      {name}
    </span>
  );
}

/* ─── Marquee row (CSS animation, pause on hover) ─────────── */
function MarqueeRow({
  brands,
  reverse = false,
  paused,
  onEnter,
  onLeave,
}: {
  brands: string[];
  reverse?: boolean;
  paused: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  /* Duplicate for seamless loop */
  const doubled = [...brands, ...brands, ...brands];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-hidden="true"
    >
      <div
        className="flex"
        style={{
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${brands.length * 1.8}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {doubled.map((brand, i) => (
          <BrandPill key={`${brand}-${i}`} name={brand} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main exported component ─────────────────────────────── */
export function BrandsMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="bg-[#071C2C] py-14 md:py-16">
      {/* Keyframe styles injected inline — no global CSS change */}
      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-33.3333%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div className="container-x mb-10 text-center">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
          Trusted Brands
        </div>
        <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
          20+ Brands We Service
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/45">
          Professional repair and servicing solutions for leading medical and endoscopy equipment
          brands.
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="mb-4">
        <MarqueeRow
          brands={row1}
          reverse={false}
          paused={paused}
          onEnter={() => setPaused(true)}
          onLeave={() => setPaused(false)}
        />
      </div>

      {/* Row 2 — scrolls right */}
      <div>
        <MarqueeRow
          brands={row2}
          reverse={true}
          paused={paused}
          onEnter={() => setPaused(true)}
          onLeave={() => setPaused(false)}
        />
      </div>

      {/* CTA */}
      <div className="container-x mt-10 text-center">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#18b9bb]/40 bg-transparent px-6 py-3 text-sm font-semibold text-[#18b9bb] transition-all duration-250 hover:bg-[#18b9bb] hover:text-white"
        >
          View All Services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
