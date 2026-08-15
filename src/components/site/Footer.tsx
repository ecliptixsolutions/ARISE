import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./Logo";
import { settings, phoneHref, whatsappHref } from "@/lib/site-data";
import { WhatsAppIcon } from "./WhatsAppIcon";

/* ─── Column data ───────────────────────────────────────── */
const footerServices = [
  { label: "Endoscopy Repair", slug: "endoscopy-repair" },
  { label: "Rigid Scope Repair", slug: "rigid-scope-repair" },
  { label: "Flexible Scope Repair", slug: "flexible-scope-repair" },
  { label: "Nephroscope Repair", slug: "nephroscope-repair" },
  { label: "Ureteroscope Repair", slug: "ureteroscope-repair" },
  { label: "Laparoscope Repair", slug: "laparoscope-repair" },
  { label: "Camera Head Repair", slug: "camera-head-repair" },
  { label: "PCB & Board Repair", slug: "pcb-board-level-repair" },
];

const footerEquipment = [
  { label: "Endoscopes", q: "Endoscopes" },
  { label: "Rigid Scopes", q: "Rigid Scopes" },
  { label: "Flexible Scopes", q: "Flexible Scopes" },
  { label: "Nephroscopes", q: "Nephroscopes" },
  { label: "Ureteroscopes", q: "Ureteroscopes" },
  { label: "Laparoscopes", q: "Laparoscopes" },
  { label: "Camera Heads", q: "Camera Heads" },
  { label: "Video Processors", q: "Video Processors" },
];

const footerCompany = [
  { label: "About Us", to: "/about" as const },
  { label: "Our Services", to: "/services" as const },
  { label: "Repair Process", to: "/repair-process" as const },
  { label: "Quality", to: "/quality" as const },
  { label: "Industries", to: "/industries" as const },
  { label: "Gallery", to: "/gallery" as const },
  { label: "Contact Us", to: "/contact" as const },
];

const footerResources = [
  { label: "FAQs", to: "/faq" as const },
  { label: "Blog", to: "/blogs" as const },
  { label: "Track Repair", to: "/track-repair" as const },
  { label: "Request a Repair", to: "/request-repair" as const },
  { label: "Testimonials", to: "/testimonials" as const },
  { label: "Warranty & Service", to: "/warranty-and-service" as const },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" as const },
  { label: "Terms & Conditions", to: "/terms-and-conditions" as const },
  { label: "Warranty & Service", to: "/warranty-and-service" as const },
];

/* ─── Shared subcomponents ──────────────────────────────── */
function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="h-0.5 w-5 rounded-full bg-[#18b9bb]" aria-hidden />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
        {children}
      </h3>
    </div>
  );
}

function FooterLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`group flex items-center gap-1.5 text-[13px] text-white/45 transition-colors duration-200 hover:text-[#18b9bb] ${className}`}
    >
      <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      {children}
    </span>
  );
}

/* ─── Main Footer ───────────────────────────────────────── */
export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const socialLinks = [
    { href: settings.social.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { href: settings.social.facebook, Icon: Facebook, label: "Facebook" },
    { href: settings.social.instagram, Icon: Instagram, label: "Instagram" },
    { href: settings.social.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((s) => Boolean(s.href));

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <footer className="bg-[#071C2C]" aria-label="Site footer">

      {/* ══ MAIN FOOTER GRID ═══════════════════════════════ */}
      <div className="container-x pt-16 pb-10 md:pt-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr]">

          {/* ── Brand column ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo + name */}
            <div className="mb-5 flex items-center gap-3">
              <Logo size={56} />
              <div>
                <div className="font-display text-base font-bold text-white leading-tight">
                  Arise Healthcare
                </div>
                <div className="font-display text-base font-bold text-white leading-tight">
                  Solutions
                </div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#18b9bb]">
                  Endoscopy Repair Specialists
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="mb-5 text-[13px] leading-relaxed text-white/40 max-w-[260px]">
              Independent medical equipment repair, servicing and technical support for hospitals,
              clinics and diagnostic centres.
            </p>

            {/* Contact rows */}
            <ul className="space-y-2.5 mb-6">
              <li>
                <a
                  href={phoneHref(settings.phonePlaceholder)}
                  className="flex items-center gap-2 text-[13px] text-white/50 transition hover:text-[#18b9bb]"
                  aria-label={`Call ${settings.phonePlaceholder}`}
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#18b9bb]" />
                  {settings.phonePlaceholder}
                </a>
              </li>
              <li>
                <a
                  href={phoneHref(settings.secondaryPhonePlaceholder)}
                  className="flex items-center gap-2 text-[13px] text-white/50 transition hover:text-[#18b9bb]"
                  aria-label={`Call ${settings.secondaryPhonePlaceholder}`}
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#18b9bb]" />
                  {settings.secondaryPhonePlaceholder}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.emailPlaceholder}`}
                  className="flex items-start gap-2 text-[13px] text-white/50 transition hover:text-[#18b9bb]"
                  aria-label="Email Arise Healthcare Solutions"
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#18b9bb]" />
                  <span className="break-all">{settings.emailPlaceholder}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-white/40">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#18b9bb]" />
                <span>Vadodara, Gujarat, India</span>
              </li>
            </ul>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="mb-5 flex gap-2">
                {socialLinks.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#18b9bb]/50 hover:text-[#18b9bb]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}

            {/* Certification badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#18b9bb]">
                <ShieldCheck className="h-3 w-3" /> MSME Registered
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Est. 2018
              </span>
            </div>
          </div>

          {/* ── Services column ── */}
          <nav aria-label="Footer services">
            <ColHeading>Services</ColHeading>
            <ul className="space-y-2.5">
              {footerServices.map(({ label, slug }) => (
                <li key={slug}>
                  <Link to="/services/$slug" params={{ slug }}>
                    <FooterLink>{label}</FooterLink>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link to="/services" className="text-[13px] font-semibold text-[#18b9bb] hover:brightness-125 transition">
                  All Services →
                </Link>
              </li>
            </ul>
          </nav>

          {/* ── Equipment column ── */}
          <nav aria-label="Footer equipment categories">
            <ColHeading>Equipment</ColHeading>
            <ul className="space-y-2.5">
              {footerEquipment.map(({ label, q }) => (
                <li key={q}>
                  <Link to="/equipments" search={{ q }}>
                    <FooterLink>{label}</FooterLink>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link to="/equipments" className="text-[13px] font-semibold text-[#18b9bb] hover:brightness-125 transition">
                  All Equipment →
                </Link>
              </li>
            </ul>
          </nav>

          {/* ── Company column ── */}
          <nav aria-label="Footer company links">
            <ColHeading>Company</ColHeading>
            <ul className="space-y-2.5">
              {footerCompany.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}>
                    <FooterLink>{label}</FooterLink>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Resources column ── */}
          <nav aria-label="Footer resources">
            <ColHeading>Resources</ColHeading>
            <ul className="space-y-2.5">
              {footerResources.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}>
                    <FooterLink>{label}</FooterLink>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── CTA column ── */}
          <div>
            <ColHeading>Get in Touch</ColHeading>
            <div className="space-y-3">
              <Link
                to="/request-repair"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18b9bb] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Get a Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappHref()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#25D366]/15"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                <span className="whitespace-nowrap">WhatsApp Us</span>
              </a>
              <Link
                to="/contact"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Contact Us
              </Link>
            </div>

            {/* Quick stats */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                { v: "8+", l: "Years" },
                { v: "10+", l: "Engineers" },
                { v: "2,000+", l: "Serviced" },
                { v: "98.8%", l: "Success Rate" },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  className="flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-white/4 px-2 py-3 text-center"
                >
                  <div className="w-full truncate text-center font-display text-base font-extrabold leading-tight text-[#18b9bb]">{v}</div>
                  <div className="mt-0.5 w-full truncate text-center text-[10px] leading-tight text-white/35">{l}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══ NEWSLETTER STRIP ════════════════════════════════ */}
      <div className="border-t border-white/8">
        <div className="container-x py-8">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
            {/* Text */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#18b9bb]/15 ring-1 ring-[#18b9bb]/25">
                <Mail className="h-5 w-5 text-[#18b9bb]" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Medical Equipment Updates &amp; Insights
                </div>
                <div className="text-[12px] text-white/40">
                  Get useful equipment, repair and maintenance updates.
                </div>
              </div>
            </div>

            {/* Form */}
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl border border-[#18b9bb]/30 bg-[#18b9bb]/10 px-5 py-3 text-sm font-semibold text-[#18b9bb]">
                <ShieldCheck className="h-4 w-4" /> Subscribed — thank you!
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex w-full max-w-md items-center gap-2"
                aria-label="Newsletter subscription"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#18b9bb]/50 focus:ring-2 focus:ring-[#18b9bb]/20 transition"
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#18b9bb] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <Send className="h-3.5 w-3.5" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ══ COPYRIGHT BAR ═══════════════════════════════════ */}
      <div className="border-t border-white/6 bg-[#051525]">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 pb-24 text-center text-[12px] text-white/28 md:flex-row md:pb-5 md:text-left">
          {/* Copyright */}
          <div>
            &copy; {new Date().getFullYear()} Arise Healthcare Solutions. All rights reserved.
          </div>

          {/* Credit */}
          <div className="hidden md:block">
            Designed &amp; Developed by{" "}
            <a
              href="https://ecliptixsolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/45 transition hover:text-[#18b9bb]"
            >
              Ecliptix Solutions
            </a>
          </div>

          {/* Legal links */}
          <nav aria-label="Legal links" className="flex flex-wrap justify-center gap-4 md:justify-end">
            {legalLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="transition hover:text-[#18b9bb]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

    </footer>
  );
}
