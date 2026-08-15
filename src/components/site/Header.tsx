import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { TopContactBar } from "./TopContactBar";
import { equipmentCategories, services } from "@/lib/site-data";

/* ─── Static data ──────────────────────────────────────────── */
const aboutItems = [
  { to: "/about",              label: "About Us" },
  { to: "/why-us",             label: "Why Us" },
  { to: "/our-infrastructure", label: "Our Infrastructure" },
  { to: "/our-clients",        label: "Our Clients" },
  { to: "/gallery",            label: "Gallery" },
];

const serviceHierarchy = [
  {
    label: "Endoscope Repair",
    slug: "endoscopy-repair",
    subs: ["Flexible Endoscope Repair","Rigid Endoscope Repair","Diagnostic Endoscope Repair","Surgical Endoscope Repair"],
  },
  {
    label: "Nephroscope Repair",
    slug: "nephroscope-repair",
    subs: ["Nephroscope Image Guide Repair","Light Fiber Replacement","Optical System Repair","Water Leakage Repair","Lens & Objective Repair"],
  },
  {
    label: "Ureteroscope Repair",
    slug: "ureteroscope-repair",
    subs: ["Flexible Ureteroscope Repair","Rigid Ureteroscope Repair","Image Guide Replacement","Light Fiber Repair / Replacement","Optical & Mechanical Repair"],
  },
  {
    label: "Cystoscope Repair",
    slug: "cystoscope-repair",
    subs: ["Rigid Cystoscope Repair","Optical System Repair","Lens & Light Fiber Repair"],
  },
  {
    label: "Arthroscope Repair",
    slug: "arthroscope-repair",
    subs: ["Arthroscope Optical Repair","Image Guide Repair","Light Fiber Repair"],
  },
  {
    label: "Laparoscope Repair",
    slug: "laparoscope-repair",
    subs: ["Laparoscope Repair","Telescope Repair","Optical System Repair","Light Fiber Repair"],
  },
  {
    label: "Camera Head & System Repair",
    slug: "camera-head-repair",
    subs: ["Camera Head Repair","Camera Cable Repair","Processor Board Repair","PCB-Level Repair"],
  },
  {
    label: "Light Cable / Light Fiber Repair",
    slug: "light-source-repair",
    subs: ["Light Cable Repair","Light Fiber Bundle Replacement","Connector Repair","Light Transmission Testing"],
  },
  {
    label: "Optical & Image Guide Repair",
    slug: "optical-image-guide-repair",
    subs: ["Image Guide Replacement","Objective Lens Repair","Field Lens Repair","Optical Alignment","Image Quality Testing"],
  },
  {
    label: "Preventive Maintenance & Servicing",
    slug: "preventive-maintenance",
    subs: ["Complete Scope Inspection","Preventive Maintenance","Performance Testing","Leakage Testing","Final Quality Inspection"],
  },
];

const brandGroups = [
  {
    heading: "Endoscopy",
    items: ["Olympus", "KARL STORZ", "Richard Wolf", "PENTAX Medical", "Fujifilm"],
  },
  {
    heading: "Surgical / Urology",
    items: ["Stryker", "Aesculap", "B. Braun", "SCHÖLLY", "RZ Medizintechnik", "Ackermann"],
  },
  {
    heading: "Other Medical",
    items: ["GE HealthCare", "Philips", "Medtronic", "Dräger", "Mindray", "Siemens Healthineers"],
  },
];

const resourceItems = [
  { to: "/blogs",        label: "Blog" },
  { to: "/faq",          label: "FAQ" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/gallery",      label: "Gallery" },
  { to: "/track-repair", label: "Track Repair" },
];

/* ─── Search index ─────────────────────────────────────────── */
type SearchEntry = { title: string; category: string; desc: string; to: string };

const searchIndex: SearchEntry[] = [
  // Services
  ...services.map((s) => ({
    title: s.name,
    category: "Service",
    desc: s.short,
    to: `/services/${s.slug}`,
  })),
  // Equipment categories
  ...equipmentCategories.map((c) => ({
    title: c,
    category: "Equipment",
    desc: `Medical equipment category: ${c}`,
    to: `/equipments?q=${encodeURIComponent(c)}`,
  })),
  // Brands
  ...[
    "Olympus","KARL STORZ","Richard Wolf","Fujifilm","PENTAX Medical","Stryker","Aesculap",
    "B. Braun","SCHÖLLY","RZ Medizintechnik","Ackermann","Smith+Nephew","Arthrex","Ambu",
    "HOYA","Dräger","GE HealthCare","Philips","Mindray","Siemens Healthineers",
    "Nihon Kohden","Getinge","Hillrom","Baxter","STERIS","Boston Scientific","Medtronic","CONMED",
  ].map((b) => ({
    title: b,
    category: "Brand",
    desc: "Medical equipment brand serviced by Arise Healthcare Solutions",
    to: "/brands",
  })),
  // Pages
  { title: "About Us",           category: "Page", desc: "About Arise Healthcare Solutions", to: "/about" },
  { title: "Why Us",             category: "Page", desc: "Why healthcare facilities choose Arise", to: "/why-us" },
  { title: "Our Infrastructure", category: "Page", desc: "Our repair and service facility", to: "/our-infrastructure" },
  { title: "Our Clients",        category: "Page", desc: "Healthcare facilities we support", to: "/our-clients" },
  { title: "Gallery",            category: "Page", desc: "Photos from our repair facility", to: "/gallery" },
  { title: "Brands We Service",  category: "Page", desc: "All medical brands we service", to: "/brands" },
  { title: "Contact Us",         category: "Page", desc: "Get in touch with our team", to: "/contact" },
  { title: "Request Repair",     category: "Page", desc: "Submit a repair request", to: "/request-repair" },
  { title: "Track Repair",       category: "Page", desc: "Track your repair status", to: "/track-repair" },
  { title: "FAQ",                category: "Page", desc: "Frequently asked questions", to: "/faq" },
];

function doSearch(q: string): SearchEntry[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  return searchIndex
    .filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        e.category.toLowerCase().includes(lower) ||
        e.desc.toLowerCase().includes(lower),
    )
    .slice(0, 10);
}

/* ─── Nav items (dropdown keys) ───────────────────────────── */
type DropKey = "about" | "services" | "equipments" | "resources" | "brands" | "careers";
type NavItem = { to: string; label: string; dropdown?: DropKey };

const nav: NavItem[] = [
  { to: "/",               label: "Home" },
  { to: "/about",          label: "About",     dropdown: "about" },
  { to: "/services",       label: "Services",  dropdown: "services" },
  { to: "/equipments",     label: "Equipment", dropdown: "equipments" },
  { to: "/blogs",          label: "Resources", dropdown: "resources" },
  { to: "/brands",         label: "Brands",    dropdown: "brands" },
  { to: "/warranty-and-service", label: "Warranty" },
  { to: "/careers",        label: "Careers",   dropdown: "careers" },
  { to: "/contact",        label: "Contact" },
];

/* ─── Shared dropdown shell ────────────────────────────────── */
function DropShell({
  children,
  className = "",
  onEnter,
  onLeave,
}: {
  children: React.ReactNode;
  className?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}) {
  return (
    <div
      className={`absolute top-full z-[9999] pt-2 animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="rounded-2xl border border-white/70 bg-white/96 p-3 shadow-2xl shadow-primary/8 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

/* ─── 3-level Services dropdown component ──────────────────── */
function ServicesDropdown({
  isActive,
  isOpen,
  onOpen,
  onClose,
  onCancelClose,
  onNavigate,
  itemCls,
}: {
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCancelClose: () => void;
  onNavigate: () => void;
  itemCls: (active: boolean) => string;
}) {
  const [hoveredType, setHoveredType] = useState<number | null>(null);

  return (
    <div
      className="relative"
      onMouseEnter={() => { onOpen(); }}
      onMouseLeave={() => { onClose(); setHoveredType(null); }}
      onFocus={onOpen}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { onClose(); setHoveredType(null); } }}
    >
      <Link
        to="/services"
        className={itemCls(isActive)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        Services <ChevronDown className="h-3.5 w-3.5" />
      </Link>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-[9999] pt-2 animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseEnter={onCancelClose}
          onMouseLeave={() => { onClose(); setHoveredType(null); }}
        >
          <div className="flex rounded-2xl border border-white/70 bg-white/96 shadow-2xl shadow-primary/8 backdrop-blur-xl overflow-hidden">

            {/* ── Level 1: Repair Service ── */}
            <div className="w-44 shrink-0 border-r border-border bg-surface/60 p-2">
              <div className="mb-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Services
              </div>
              <button
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-semibold text-primary bg-primary/8 transition"
                onMouseEnter={() => setHoveredType(0)}
              >
                Repair Service
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>

            {/* ── Level 2: Service types ── */}
            <div className="w-52 shrink-0 border-r border-border p-2">
              <div className="mb-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Repair Service
              </div>
              {serviceHierarchy.map((svc, idx) => (
                <button
                  key={svc.slug}
                  onMouseEnter={() => setHoveredType(idx)}
                  onClick={() => { onNavigate(); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] transition ${
                    hoveredType === idx
                      ? "bg-primary/8 text-primary font-semibold"
                      : "text-foreground hover:bg-surface hover:text-primary"
                  }`}
                >
                  <span className="truncate text-left">{svc.label}</span>
                  <ChevronRight className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </button>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                <Link
                  to="/services"
                  onClick={onNavigate}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-primary hover:bg-surface"
                >
                  All Services <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* ── Level 3: Sub-types ── */}
            <div className="w-56 shrink-0 p-2">
              {hoveredType !== null ? (
                <>
                  <div className="mb-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {serviceHierarchy[hoveredType].label}
                  </div>
                  {serviceHierarchy[hoveredType].subs.map((sub) => (
                    <Link
                      key={sub}
                      to="/services/$slug"
                      params={{ slug: serviceHierarchy[hoveredType].slug }}
                      onClick={onNavigate}
                      className="block rounded-lg px-3 py-2 text-[13px] text-foreground transition hover:bg-surface hover:text-primary"
                    >
                      {sub}
                    </Link>
                  ))}
                  <div className="mt-2 border-t border-border pt-2">
                    <Link
                      to="/services/$slug"
                      params={{ slug: serviceHierarchy[hoveredType].slug }}
                      onClick={onNavigate}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-primary hover:bg-surface"
                    >
                      View Service <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-3 py-8 text-center text-[13px] text-muted-foreground">
                  <ChevronRight className="h-5 w-5 opacity-30" />
                  <span>Hover a service to see sub-types</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Animated rotating CTA button ────────────────────────── */
function RotatingCTA({ isOverlay }: { isOverlay: boolean }) {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [hovered, setHovered] = useState(false);

  const labels = ["Free Estimate", "Send a Job"];
  const routes = ["/request-repair", "/request-repair"] as const;

  useEffect(() => {
    if (hovered) return;
    const hold = 2800;
    const timer = setTimeout(() => {
      setAnimating(true);
      const flip = setTimeout(() => {
        setIdx((v) => (v + 1) % labels.length);
        setAnimating(false);
      }, 480);
      return () => clearTimeout(flip);
    }, hold);
    return () => clearTimeout(timer);
  }, [idx, hovered]);

  return (
    <>
      <style>{`
        @keyframes cta-out {
          from { opacity:1; transform:translateY(0); }
          to   { opacity:0; transform:translateY(-10px); }
        }
        @keyframes cta-in {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cta-exit { animation: cta-out 0.24s ease-in both; }
        .cta-enter { animation: cta-in 0.28s ease-out 0.22s both; }
      `}</style>
      <Link
        to={routes[idx]}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={labels[idx]}
        className={`hidden min-[1240px]:inline-flex h-9 min-w-[160px] items-center justify-center gap-1.5 overflow-hidden rounded-full px-5 text-[13.5px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 xl:min-w-[172px] xl:text-[14px] ${
          isOverlay
            ? "bg-[#18b9bb] shadow-[0_8px_24px_rgba(24,185,187,0.35)] hover:brightness-110"
            : "bg-[#18b9bb] shadow-[0_6px_18px_rgba(24,185,187,0.28)] hover:brightness-110"
        }`}
      >
        <span
          key={`${idx}-${animating}`}
          className={animating ? "cta-exit" : "cta-enter"}
          style={{ display: "inline-flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}
        >
          {labels[idx]}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </Link>
    </>
  );
}

/* ─── Main Header ──────────────────────────────────────────── */
export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dd, setDd]   = useState<DropKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchFilter, setSearchFilter] = useState<string>("All");
  const closeTimer = useRef<number | null>(null);
  const headerRef  = useRef<HTMLElement | null>(null);
  const searchRef  = useRef<HTMLInputElement | null>(null);

  const isHome    = location.pathname === "/";
  const isOverlay = isHome && !scrolled;

  /* Active parent detection */
  const activePath = location.pathname;
  const isAboutActive   = activePath.startsWith("/about") || ["/why-us","/our-infrastructure","/our-clients","/gallery"].some(p => activePath === p);
  const isServiceActive = activePath.startsWith("/services");
  const isEquipActive   = activePath.startsWith("/equipments");
  const isResourceActive= activePath.startsWith("/blogs") || activePath.startsWith("/faq") || activePath.startsWith("/testimonials") || activePath.startsWith("/track-repair");
  const isBrandActive   = activePath === "/brands";

  /* Hover helpers (only for hover-based dropdowns) */
  const cancelClose = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const hoverOpen  = (key: DropKey) => { cancelClose(); setDd(key); };
  const hoverClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => { setDd(null); closeTimer.current = null; }, 280);
  };
  const clickToggle = (key: DropKey) => { cancelClose(); setDd((prev) => prev === key ? null : key); };

  /* Close on outside click / ESC */
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) { setDd(null); setSearchOpen(false); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setDd(null); setSearchOpen(false); setMobileOpen(false); }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      cancelClose();
    };
  }, []);

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close all on route change */
  useEffect(() => {
    setDd(null); setMobileOpen(false); setSearchOpen(false);
  }, [location.pathname]);

  /* Focus search input when opened */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [searchOpen]);

  /* Search results */
  const rawResults  = doSearch(searchQ);
  const searchResults = searchFilter === "All"
    ? rawResults
    : rawResults.filter((r) => r.category === searchFilter);

  /* Nav item style helper */
  function itemCls(isActive: boolean) {
    const base = "inline-flex items-center gap-1 px-3 py-2 text-[13.5px] font-semibold transition-all duration-200 rounded-lg xl:text-[14.5px]";
    if (isActive) return `${base} ${isOverlay ? "text-white bg-white/18" : "text-primary bg-primary/8"}`;
    return `${base} ${isOverlay ? "text-white/88 hover:text-white hover:bg-white/12" : "text-navy/75 hover:text-primary hover:bg-primary/6"}`;
  }

  return (
    <>
      <TopContactBar />
      <header
        ref={headerRef}
        className={`z-50 w-full ${isHome ? "absolute left-0 top-[var(--topbar-h)]" : "sticky top-0"}`}
      >
        {/* ── Single full-width glass bar ── */}
        <div
          className={`w-full border-b px-4 backdrop-blur-2xl transition-all duration-300 md:px-8 lg:px-12 ${
            isOverlay
              ? "border-white/14 bg-[rgba(5,18,30,0.52)] shadow-[0_8px_40px_rgba(0,0,0,0.28)]"
              : "border-white/40 bg-white/80 shadow-[0_4px_24px_rgba(31,49,72,0.12)]"
          }`}
        >
          <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-3 sm:h-[76px] sm:gap-4 md:h-[84px]">

            {/* Logo + brand name */}
            <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 min-[1240px]:flex-none min-[1240px]:shrink-0 md:gap-3">
              <Logo size={78} className="header-logo transition-all duration-300" />
              <div className="block min-w-0 max-w-[min(52vw,13rem)] text-[clamp(0.72rem,3.1vw,1.05rem)] font-bold leading-tight sm:max-w-none sm:text-[1.05rem] md:text-[1.2rem] xl:text-[1.3rem]">
                <span className="text-[#138bd2]">Arise</span>{" "}
                <span className="text-[#d6492f]">Healthcare Solutions</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-0.5 min-[1240px]:flex xl:gap-1" aria-label="Main navigation">

              {/* Home */}
              <Link to="/" className={itemCls(activePath === "/")} activeOptions={{ exact: true }}
                activeProps={{ className: itemCls(true) }}>
                Home
              </Link>

              {/* About — click toggle */}
              {(() => {
                const isActive = isAboutActive;
                return (
                  <div className="relative"
                    onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDd(null); }}>
                    <button
                      onClick={() => clickToggle("about")}
                      aria-expanded={dd === "about"} aria-haspopup="menu"
                      className={itemCls(isActive)}
                    >
                      About
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dd === "about" ? "rotate-180" : ""}`} />
                    </button>
                    {dd === "about" && (
                      <DropShell className="left-0 w-52">
                        {aboutItems.map((a) => (
                          <Link key={a.to} to={a.to} onClick={() => setDd(null)}
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface hover:text-primary">
                            {a.label}
                          </Link>
                        ))}
                      </DropShell>
                    )}
                  </div>
                );
              })()}

              {/* Services — 3-level hierarchical dropdown */}
              <ServicesDropdown
                isActive={isServiceActive}
                isOpen={dd === "services"}
                onOpen={() => hoverOpen("services")}
                onClose={hoverClose}
                onCancelClose={cancelClose}
                onNavigate={() => setDd(null)}
                itemCls={itemCls}
              />

              {/* Equipment — hover */}
              <div className="relative"
                onMouseEnter={() => hoverOpen("equipments")}
                onMouseLeave={hoverClose}
                onFocus={() => hoverOpen("equipments")}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) hoverClose(); }}>
                <Link to="/equipments"
                  className={itemCls(isEquipActive)}
                  aria-expanded={dd === "equipments"} aria-haspopup="menu">
                  Equipment <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                {dd === "equipments" && (
                  <DropShell className="left-0 w-[480px]" onEnter={cancelClose} onLeave={hoverClose}>
                    <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Equipment Categories
                    </div>
                    <div className="grid grid-cols-3 gap-0.5">
                      {equipmentCategories.map((c) => (
                        <Link key={c} to="/equipments" search={{ q: c }} onClick={() => setDd(null)}
                          className="truncate rounded-lg px-2 py-1.5 text-[13px] text-foreground transition hover:bg-surface hover:text-primary">
                          {c}
                        </Link>
                      ))}
                    </div>
                  </DropShell>
                )}
              </div>

              {/* Resources — hover */}
              <div className="relative"
                onMouseEnter={() => hoverOpen("resources")}
                onMouseLeave={hoverClose}
                onFocus={() => hoverOpen("resources")}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) hoverClose(); }}>
                <Link to="/blogs" className={itemCls(isResourceActive)}
                  aria-expanded={dd === "resources"} aria-haspopup="menu">
                  Resources <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                {dd === "resources" && (
                  <DropShell className="right-0 w-48" onEnter={cancelClose} onLeave={hoverClose}>
                    {resourceItems.map((r) => (
                      <Link key={r.to} to={r.to} onClick={() => setDd(null)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface hover:text-primary">
                        {r.label}
                      </Link>
                    ))}
                  </DropShell>
                )}
              </div>

              {/* Brands — hover */}
              <div className="relative"
                onMouseEnter={() => hoverOpen("brands")}
                onMouseLeave={hoverClose}
                onFocus={() => hoverOpen("brands")}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) hoverClose(); }}>
                <Link to="/brands" className={itemCls(isBrandActive)}
                  aria-expanded={dd === "brands"} aria-haspopup="menu">
                  Brands <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                {dd === "brands" && (
                  <DropShell className="right-0 w-[520px]" onEnter={cancelClose} onLeave={hoverClose}>
                    <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Brands We Service
                    </div>
                    <div className="grid grid-cols-3 gap-x-4">
                      {brandGroups.map((grp) => (
                        <div key={grp.heading}>
                          <div className="mt-2 mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                            {grp.heading}
                          </div>
                          {grp.items.map((b) => (
                            <Link key={b} to="/brands" onClick={() => setDd(null)}
                              className="block rounded-lg px-2 py-1 text-[13px] text-foreground transition hover:bg-surface hover:text-primary">
                              {b}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-border pt-2">
                      <Link to="/brands" onClick={() => setDd(null)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-primary hover:bg-surface">
                        View All Brands <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </DropShell>
                )}
              </div>

              {/* Warranty */}
              <Link to="/warranty-and-service" className={itemCls(activePath === "/warranty-and-service")}
                activeProps={{ className: itemCls(true) }}>
                Warranty
              </Link>

              {/* Careers — hover dropdown */}
              <div className="relative"
                onMouseEnter={() => hoverOpen("careers")}
                onMouseLeave={hoverClose}
                onFocus={() => hoverOpen("careers")}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) hoverClose(); }}>
                <Link to="/careers" className={itemCls(activePath.startsWith("/careers"))}
                  aria-expanded={dd === "careers"} aria-haspopup="menu">
                  Careers <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                {dd === "careers" && (
                  <DropShell className="left-0 w-44" onEnter={cancelClose} onLeave={hoverClose}>
                    <Link to="/careers" onClick={() => setDd(null)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface hover:text-primary">
                      Job Openings
                    </Link>
                  </DropShell>
                )}
              </div>

              {/* Contact */}
              <Link to="/contact" className={itemCls(activePath === "/contact")}
                activeProps={{ className: itemCls(true) }}>
                Contact
              </Link>

            </nav>

            {/* Right: Animated CTA + Search + hamburger */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Animated rotating CTA — desktop only */}
              <RotatingCTA isOverlay={isOverlay} />

              {/* Search button */}
              <button
                onClick={() => { setSearchOpen((v) => !v); setSearchQ(""); setSearchFilter("All"); }}
                aria-label="Search"
                className={`grid h-9 w-9 place-items-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${
                  isOverlay
                    ? "border-white/25 bg-white/12 text-white hover:bg-white/20"
                    : "border-white/60 bg-white/70 text-navy hover:bg-white"
                }`}
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Hamburger (mobile) */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                className={`grid h-9 w-9 place-items-center rounded-full border transition hover:bg-white hover:text-navy min-[1240px]:hidden ${
                  isOverlay
                    ? "border-white/25 bg-white/12 text-white"
                    : "border-white/60 bg-white/70 text-navy"
                }`}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search overlay ── */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-full z-[9998] border-b border-white/30 bg-white/96 px-4 shadow-2xl backdrop-blur-2xl md:px-8 lg:px-12 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="mx-auto max-w-[900px] py-4">
              {/* Input */}
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search services, equipment, brands…"
                  className="flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
                  aria-label="Search the website"
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} aria-label="Clear search"
                    className="text-muted-foreground hover:text-navy">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              {searchQ && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {["All", "Service", "Equipment", "Brand", "Page"].map((f) => (
                    <button key={f} onClick={() => setSearchFilter(f)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        searchFilter === f
                          ? "bg-primary text-white"
                          : "border border-border bg-white text-foreground hover:bg-surface hover:text-primary"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              {searchQ && (
                <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-border bg-white shadow-sm">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No results for &ldquo;{searchQ}&rdquo;
                    </div>
                  ) : (
                    searchResults.map((r, i) => (
                      <Link
                        key={`${r.to}-${i}`}
                        to={r.to}
                        onClick={() => { setSearchOpen(false); setSearchQ(""); }}
                        className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-surface"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                            {r.category}
                          </div>
                          <div className="text-sm font-semibold text-navy">{r.title}</div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">{r.desc}</div>
                        </div>
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-white/40 bg-white/96 px-4 pb-4 shadow-2xl backdrop-blur-xl min-[1240px]:hidden">
            <div className="mx-auto max-w-lg pt-2">
              {nav.map((n) => (
                <MobileItem key={n.to} n={n} onClose={() => setMobileOpen(false)} />
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/* ─── Mobile accordion item ────────────────────────────────── */
function MobileItem({ n, onClose }: { n: NavItem; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const children: { to: string; label: string }[] | null = (() => {
    if (n.dropdown === "about")
      return aboutItems.map((a) => ({ to: a.to, label: a.label }));
    if (n.dropdown === "services")
      return serviceHierarchy.map((s) => ({ to: `/services/${s.slug}`, label: s.label }));
    if (n.dropdown === "equipments")
      return equipmentCategories.map((c) => ({
        to: `/equipments?q=${encodeURIComponent(c)}`,
        label: c,
      }));
    if (n.dropdown === "resources")
      return resourceItems.map((r) => ({ to: r.to, label: r.label }));
    if (n.dropdown === "brands")
      return brandGroups.flatMap((g) =>
        g.items.map((b) => ({ to: "/brands", label: b }))
      );
    if (n.dropdown === "careers")
      return [{ to: "/careers", label: "Job Openings" }];
    return null;
  })();

  return (
    <div className="border-b border-border last:border-0">
      <div className="flex items-center">
        <Link
          to={n.to}
          onClick={onClose}
          className="flex-1 py-3 text-sm font-semibold text-foreground/90 transition hover:text-primary"
        >
          {n.label}
        </Link>
        {children && (
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="p-3 text-muted-foreground"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {expanded && children && (
        <div className="mb-2 ml-3 space-y-0.5 border-l-2 border-primary/20 pl-3">
          {children.map((c) => (
            <a
              key={`${c.to}-${c.label}`}
              href={c.to}
              onClick={onClose}
              className="block rounded-lg py-2 text-sm text-foreground/75 transition hover:text-primary"
            >
              {c.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
