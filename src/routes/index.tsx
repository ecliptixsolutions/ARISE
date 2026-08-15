import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Wrench,
  Cpu,
  Microscope,
  Zap,
  CheckCircle2,
  Phone,
  Star,
  Award,
  Timer,
  Layers,
  Building2,
  Beaker,
  Activity,
  Play,
  RotateCw,
  Power,
  Monitor,
  Battery,
  Settings,
  Clock3,
  Layers3,
  Globe2,
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import {
  services,
  equipments,
  industries,
  process,
  whyChoose,
  trustBar,
  qualityChecks,
  settings,
  phoneHref,
  whatsappHref,
  blogs,
} from "@/lib/site-data";
import { WhatWeRepair } from "@/components/site/WhatWeRepair";
import { RepairProcess } from "@/components/site/RepairProcess";
import { WhyChooseArise } from "@/components/site/WhyChooseArise";
import { BrandsMarquee } from "@/components/site/BrandsMarquee";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { HealthcareNewsletter } from "@/components/site/HealthcareNewsletter";
import { HealthcareCTA } from "@/components/site/HealthcareCTA";
import { ServicesSection } from "@/components/site/ServicesSection";
import labImg from "@/assets/lab-solder.jpg";
import heroRepairImg from "@/assets/hero-repair.jpg";
import servicePcbImg from "@/assets/service-pcb-diagnosis.jpg";
import serviceMicroscopeImg from "@/assets/service-microscope-repair.jpg";
import serviceMedicalImg from "@/assets/service-medical-equipment.jpg";
import serviceLabTestingImg from "@/assets/service-lab-testing.jpg";
import serviceOpticalImg from "@/assets/service-optical-inspection.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arise Healthcare Solutions | Endoscopy Repair & Medical Equipment Servicing" },
      {
        name: "description",
        content:
          "Component & board-level repair for endoscopes, camera heads, processors, light sources and medical equipment. Trusted by hospitals, clinics and diagnostic centres.",
      },
      {
        property: "og:title",
        content: "Arise Healthcare Solutions | Endoscopy Repair & Medical Equipment Servicing",
      },
      {
        property: "og:description",
        content:
          "Component & board-level repair for endoscopes, camera heads, processors, light sources and medical equipment. Trusted by hospitals, clinics and diagnostic centres.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("sort_order")
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <Layout>
      {/* HERO */}
      <PremiumHeroCarousel />

      {/* SYNCHRONICS GUARANTEE */}
      <SynchronicsGuarantee />

      {/* BRANDS MARQUEE */}
      <BrandsMarquee />

      <NumbersSection />

      {/* SERVICES */}
      <ServicesSection />

      {/* WHAT WE REPAIR */}
      <WhatWeRepair />



      {/* WHY CHOOSE ARISE */}
      <WhyChooseArise />

      {/* REPAIR PROCESS */}
      <RepairProcess />

      {/* INDUSTRIES */}
      <section className="relative overflow-hidden bg-[#081E2D]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/4 top-1/4 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-[#18b9bb]/5 blur-[110px]" />
          <div className="absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-[#c19e63]/5 blur-[100px]" />
        </div>
        <div className="relative container-x py-20 md:py-24">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
              Industries
            </div>
            <h2 className="font-display text-[2.4rem] font-bold leading-[1.15] text-white sm:text-[2.75rem]">
              Who We Serve
            </h2>
            <p className="mt-4 text-[17px] leading-[1.65] text-white/52">
              Trusted by healthcare organisations of every size.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {industries.slice(0, 9).map((i) => (
              <div
                key={i.name}
                className="group flex min-h-[132px] gap-4 rounded-[18px] border border-white/8 bg-white/4 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#18b9bb]/25 hover:bg-white/7 hover:shadow-xl hover:shadow-[#18b9bb]/10"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border border-[#18b9bb]/25 bg-[#18b9bb]/10 text-[#18b9bb] transition-all duration-300 group-hover:bg-[#18b9bb]/16 group-hover:brightness-125">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-bold leading-snug text-white">{i.name}</h3>
                  <p className="mt-2 text-[15px] leading-[1.65] text-white/48">{i.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection testimonials={testimonials} />

      {/* HEALTHCARE INSIGHTS NEWSLETTER */}
      <HealthcareNewsletter />

      {/* HEALTHCARE CTA */}
      <HealthcareCTA />
    </Layout>
  );
}

const heroSlides = [
  {
    brand: "Olympus",
    eyebrow: "Advanced Medical Equipment Support",
    eyebrow2: "Endoscopy Repair  •  Technical Support",
    description:
      "Arise Healthcare Solutions provides professional repair, servicing and technical support for Olympus endoscopy systems and medical equipment — helping healthcare facilities maintain reliable clinical performance.",
    image: heroRepairImg,
    primary: { label: "Request Repair", to: "/request-repair" },
    secondary: { label: "Explore Services", to: "/services" },
    features: ["Endoscopy Repair", "Advanced Diagnostics", "Multi-Brand Support", "Quality-Controlled Testing"],
  },
  {
    brand: "KARL STORZ",
    eyebrow: "Specialist Endoscopy Repair",
    eyebrow2: "Rigid Scope Repair  •  Camera Systems",
    description:
      "Expert repair and servicing for KARL STORZ rigid endoscopes, camera heads, light sources and surgical systems — precision repair by experienced biomedical engineers.",
    image: serviceMicroscopeImg,
    primary: { label: "Request Repair", to: "/request-repair" },
    secondary: { label: "Explore Services", to: "/services" },
    features: ["Rigid Scope Repair", "Camera Head Repair", "Light Source Repair", "3-Month Warranty"],
  },
  {
    brand: "Richard Wolf",
    eyebrow: "Urology & Endoscopy Equipment",
    eyebrow2: "Nephroscope Repair  •  Ureteroscope Repair",
    description:
      "Dependable repair and servicing for Richard Wolf nephroscopes, ureteroscopes, laparoscopes and endoscopy systems — component-level repair with documented quality control.",
    image: servicePcbImg,
    primary: { label: "Request Repair", to: "/request-repair" },
    secondary: { label: "View Services", to: "/services" },
    features: ["Nephroscope Repair", "Ureteroscope Repair", "Optical Repair", "Pan-India Service"],
  },
  {
    brand: "Fujifilm",
    eyebrow: "Flexible Endoscopy Specialists",
    eyebrow2: "Video Endoscope Repair  •  Processor Repair",
    description:
      "Professional repair for Fujifilm flexible video endoscopes, video processors and endoscopy system components — restoring performance with reliable technical support.",
    image: serviceMedicalImg,
    primary: { label: "Request Repair", to: "/request-repair" },
    secondary: { label: "Our Services", to: "/services" },
    features: ["Flexible Scope Repair", "Processor Repair", "Image Quality Restore", "98.8% Success Rate"],
  },
  {
    brand: "PENTAX Medical",
    eyebrow: "Medical Equipment Repair Partners",
    eyebrow2: "Endoscope Servicing  •  Technical Support",
    description:
      "Trusted repair and servicing for PENTAX Medical endoscopy systems — accurate diagnosis, component-level repair and thorough quality testing before every dispatch.",
    image: serviceOpticalImg,
    primary: { label: "Request Repair", to: "/request-repair" },
    secondary: { label: "Learn More", to: "/about" },
    features: ["Endoscope Repair", "Preventive Maintenance", "Free Diagnosis Report", "Quality Assured"],
  },
];

const numberStats = [
  {
    value: "8+",
    label: "Years of Experience",
    detail: "Since 2018",
    Icon: Timer,
  },
  {
    value: "10+",
    label: "Engineers & Experts",
    detail: "Certified specialists",
    Icon: Wrench,
  },
  {
    value: "2,000+",
    label: "Products & Services",
    detail: "Successfully serviced",
    Icon: Layers,
  },
  {
    value: "500+",
    label: "Industries Served",
    detail: "Across India & abroad",
    Icon: Building2,
  },
  {
    value: "98.8%",
    label: "First-Fix Success Rate",
    detail: "Quality guaranteed",
    Icon: CheckCircle2,
  },
  {
    value: "20+",
    label: "Brands Supported",
    detail: "Trusted brands",
    Icon: ShieldCheck,
  },
];

const numberPolicies = [
  "No Fix, No Charge Policy",
  "OEM-Grade Parts Only",
  "3-Month Repair Warranty",
  "Free Diagnosis Report",
  "Pan-India Logistics",
];

const guaranteeItems = [
  {
    title: "3-Month Warranty",
    subtitle: "On every repair",
    Icon: ShieldCheck,
    accent: "text-[#18b9bb]",
  },
  {
    title: "48–72 Hr Turnaround",
    subtitle: "Fastest in India",
    Icon: Clock3,
    accent: "text-amber-400",
  },
  {
    title: "No Fix, No Charge",
    subtitle: "Zero risk to you",
    Icon: Layers3,
    accent: "text-emerald-400",
  },
  {
    title: "OEM-Grade Parts Only",
    subtitle: "No cheap substitutes",
    Icon: Wrench,
    accent: "text-blue-400",
  },
  {
    title: "Free Diagnosis Report",
    subtitle: "Always transparent",
    Icon: Phone,
    accent: "text-violet-400",
  },
  {
    title: "Pan-India Service",
    subtitle: "Ship from anywhere",
    Icon: Globe2,
    accent: "text-orange-400",
  },
] as const;

function SynchronicsGuarantee() {
  return (
    <section className="bg-[#0D2B3D]">
      <div className="container-x py-10 md:py-12">
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-white/58">
          THE SYNCHRONICS GUARANTEE
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
          {guaranteeItems.map(({ title, subtitle, Icon, accent }) => (
            <div key={title} className="flex min-w-0 flex-col items-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] border border-white/10 bg-white/7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Icon className={`h-5 w-5 ${accent}`} strokeWidth={2.4} />
              </div>
              <div className="mt-4 text-[14px] font-semibold leading-snug text-white">
                {title}
              </div>
              <p className="mt-1 text-[12px] leading-snug text-white/54">{subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NumbersSection() {
  return (
    <section className="bg-[#0b2233]">
      <div className="container-x py-12 md:py-20">
        <div className="text-center text-xs font-bold uppercase tracking-[0.28em] text-white/55 md:text-sm">
          By the numbers - 8+ years of healthcare excellence
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-14 md:gap-y-10 lg:grid-cols-3 xl:grid-cols-6">
          {numberStats.map(({ value, label, detail, Icon }) => (
            <div
              key={label}
              className="relative flex flex-col items-center px-4 text-center xl:px-8 xl:[&:not(:last-child)]:border-r xl:[&:not(:last-child)]:border-white/10"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/7 text-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Icon className="h-7 w-7" />
              </div>
              <div className="mt-6 text-5xl font-extrabold leading-none tracking-[0.02em] text-[#18b9bb] md:text-[3.4rem]">
                {value}
              </div>
              <div className="mt-2 text-base font-bold text-white/88">{label}</div>
              <div className="text-sm text-white/55">{detail}</div>
            </div>
          ))}
        </div>
        <div className="mt-16 border-t border-white/10 pt-10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold text-white/62 md:text-base">
            {numberPolicies.map((policy, index) => (
              <div key={policy} className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    ["text-emerald-400", "text-sky-400", "text-cyan", "text-violet-300", "text-gold-accent"][
                      index
                    ]
                  }`}
                />
                {policy}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumHeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const slideDuration = 5500;

  const goTo = (index: number) => {
    setActive((index + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => goTo(active + 1), slideDuration);
    return () => window.clearInterval(timer);
  }, [active, paused]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") goTo(active + 1);
    if (event.key === "ArrowLeft") goTo(active - 1);
  };

  /* Single source of truth — active controls everything */
  const slide = heroSlides[active];

  return (
    <section
      className="home-hero relative isolate overflow-hidden bg-[#04111f] outline-none"
      tabIndex={0}
      aria-label="ARISE Healthcare Solutions highlights"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStart.current = e.touches[0]?.clientX ?? null; setPaused(true); }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        const end = e.changedTouches[0]?.clientX;
        if (start !== null && end !== undefined && Math.abs(start - end) > 42)
          goTo(start > end ? active + 1 : active - 1);
        touchStart.current = null;
        setPaused(false);
      }}
    >
      <style>{`
        @keyframes hero-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .hi  { animation: hero-up 0.55s cubic-bezier(.22,.68,0,1.2) both; }
        .hi1 { animation-delay:0.04s; }
        .hi2 { animation-delay:0.14s; }
        .hi3 { animation-delay:0.24s; }
        .hi4 { animation-delay:0.36s; }
        .hi5 { animation-delay:0.46s; }
        .hi6 { animation-delay:0.54s; }
      `}</style>

      {/* ── Background images (all mounted, crossfade) ── */}
      {heroSlides.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          aria-hidden
          className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-700 ease-out ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {/* ── Dark gradient overlays ── */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(4,17,31,0.97)_0%,rgba(7,30,48,0.88)_40%,rgba(10,55,70,0.52)_66%,rgba(4,17,31,0.14)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,17,31,0.22)_0%,transparent_45%,rgba(4,17,31,0.60)_100%)]" />
      <div aria-hidden className="absolute left-[5%] top-10 -z-10 h-64 w-64 rounded-full bg-cyan/10 blur-[80px]" />

      {/* ── Slide content — keyed on active so React fully remounts ── */}
      <div
        key={active}
        aria-live="polite"
        className="relative flex min-h-[700px] w-full items-center px-5 pb-24 pt-[9rem] sm:min-h-[680px] sm:px-10 sm:pt-[11rem] md:min-h-[720px] md:px-16 md:pt-[11rem] lg:px-[8vw]"
      >
        <div className="flex w-full max-w-[56rem] flex-col">

          {/* Eyebrow badge 1 */}
          <div className="hi hi1 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm sm:text-xs">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#18b9bb]/20 ring-1 ring-[#18b9bb]/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18b9bb]" />
            </span>
            India's Trusted&nbsp;
            <span className="text-[#18b9bb]">•</span>
            &nbsp;Medical Equipment Repair Specialists
            <span className="ml-0.5 text-[#c19e63]">★</span>
          </div>

          {/* Eyebrow badge 2 */}
          <div className="hi hi2 mt-3 inline-flex w-fit items-center gap-2.5 rounded-full border border-[#18b9bb]/28 bg-[#18b9bb]/14 px-4 py-2 text-[11px] font-semibold text-white/88 backdrop-blur-sm sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-[#18b9bb]" />
            <span>Trusted by Healthcare Facilities Since 2018</span>
            <span className="text-white/35">•</span>
            <span className="text-[#18b9bb]">MSME Registered</span>
          </div>

          {/* Main headline — "Complete Repair Solutions For" + dynamic brand */}
          <div className="hi hi3 mt-8 md:mt-9">
            <h1 className="text-[clamp(2.6rem,5.8vw,5.6rem)] font-extrabold leading-[1.0] tracking-[-0.03em] text-white">
              Complete Repair
              <br />
              Solutions For
            </h1>
            <p className="mt-1 text-[clamp(2.6rem,5.8vw,5.6rem)] font-extrabold leading-[1.0] tracking-[-0.03em] text-[#18b9bb]">
              {slide.brand}
            </p>
          </div>

          {/* Description */}
          <p className="hi hi4 mt-5 max-w-[42rem] text-[clamp(0.95rem,1.4vw,1.1rem)] leading-[1.7] text-white/68">
            {slide.description}
          </p>

          {/* CTA buttons */}
          <div className="hi hi5 mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to={slide.primary.to}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-xl bg-[#18b9bb] px-6 text-[15px] font-bold text-white shadow-[0_16px_40px_rgba(24,185,187,0.35)] transition duration-250 hover:-translate-y-0.5 hover:brightness-110 sm:h-[56px] sm:px-7"
            >
              {slide.primary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={slide.secondary.to}
              className="inline-flex h-[52px] items-center rounded-xl border border-white/22 bg-white/8 px-6 text-[15px] font-bold text-white backdrop-blur transition duration-250 hover:-translate-y-0.5 hover:bg-white/14 sm:h-[56px] sm:px-7"
            >
              {slide.secondary.label}
            </Link>
            <Link
              to="/repair-process"
              className="inline-flex items-center gap-3 text-[14px] font-bold text-white transition duration-250 hover:text-[#18b9bb]"
            >
              <span className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full border border-white/28 bg-white/14 backdrop-blur">
                <Play className="h-4 w-4 fill-current" />
              </span>
              <span className="leading-snug">
                Watch How<br />We Work
              </span>
            </Link>
          </div>

          {/* Supporting feature indicators */}
          <div className="hi hi6 mt-9 flex flex-wrap gap-x-6 gap-y-2.5">
            {slide.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-[13px] font-semibold text-white/65">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#18b9bb]" />
                {f}
              </div>
            ))}
          </div>

        </div>

        {/* ── Slide dot indicators ── */}
        <div className="absolute bottom-8 left-5 flex items-center gap-2 sm:left-10 md:left-16 lg:left-[8vw]">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); setPaused(true); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "h-2 w-8 bg-[#18b9bb]"
                  : "h-2 w-2 bg-white/30 hover:bg-white/55"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

function Marquee({ items }: { items: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || prefersReduced.current) return;
    const step = 0.4;
    const scroll = () => {
      if (!el) return;
      if (!paused) el.scrollLeft += step;
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      rafRef.current = requestAnimationFrame(scroll);
    };
    rafRef.current = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="list"
      aria-label="Services highlight carousel"
    >
      <div
        ref={scrollRef}
        className="flex gap-6 md:gap-8 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-2 text-sm font-medium text-foreground/75"
            role="listitem"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            <span className="whitespace-nowrap">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
