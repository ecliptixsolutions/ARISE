import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { settings, phoneHref, whatsappHref } from "@/lib/site-data";
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Send,
  FileText,
  Activity,
  Cpu,
  Monitor,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/* ─── Validation schema ──────────────────────────────────── */
const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  mobile: z.string().max(20).optional().or(z.literal("")),
  organisation: z.string().max(200).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
});

/* ─── Route ──────────────────────────────────────────────── */
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Connect with Arise Healthcare Solutions for equipment repair, servicing, technical support and healthcare equipment requirements.",
      },
      { property: "og:title", content: "Contact Us | Arise Healthcare Solutions" },
      {
        property: "og:description",
        content: "Get in touch for equipment repair, service enquiries and technical support.",
      },
    ],
  }),
  component: ContactPage,
});

/* ─── Data ───────────────────────────────────────────────── */
const contactCards = [
  {
    Icon: Phone,
    label: "Call Us",
    main: settings.phonePlaceholder,
    sub: settings.secondaryPhonePlaceholder,
    href: phoneHref(settings.phonePlaceholder),
    iconClass: "text-[#18b9bb] bg-[#18b9bb]/15 ring-1 ring-[#18b9bb]/25",
  },
  {
    Icon: Mail,
    label: "Email",
    main: settings.emailPlaceholder,
    sub: "We respond within one business day",
    href: `mailto:${settings.emailPlaceholder}`,
    iconClass: "text-blue-400 bg-blue-400/15 ring-1 ring-blue-400/25",
  },
  {
    Icon: WhatsAppIcon,
    label: "WhatsApp",
    main: "Chat Instantly",
    sub: settings.whatsappPlaceholder,
    href: whatsappHref(),
    iconClass: "text-emerald-400 bg-emerald-400/15 ring-1 ring-emerald-400/25",
  },
  {
    Icon: MapPin,
    label: "Visit Us",
    main: "Vadodara, Gujarat",
    sub: settings.address,
    href: undefined,
    iconClass: "text-amber-400 bg-amber-400/15 ring-1 ring-amber-400/25",
  },
];

const stats = [
  { value: "8+", label: "Years of Experience" },
  { value: "10+", label: "Engineers & Experts" },
  { value: "2,000+", label: "Products & Services" },
  { value: "98.8%", label: "First-Fix Success Rate" },
];

const processSteps = [
  {
    num: "01",
    Icon: MessageSquare,
    title: "Enquiry Received",
    desc: "Your enquiry is received by our team and reviewed so we can understand your requirement and route it to the right specialist.",
    badge: "Instant",
    badgeClass: "bg-[#18b9bb]/15 text-[#18b9bb] ring-1 ring-[#18b9bb]/25",
  },
  {
    num: "02",
    Icon: Phone,
    title: "Technical Review",
    desc: "Our team reviews your equipment, issue or requirement and contacts you when additional technical details are required.",
    badge: "Quick Response",
    badgeClass: "bg-blue-400/15 text-blue-300 ring-1 ring-blue-400/25",
  },
  {
    num: "03",
    Icon: FileText,
    title: "Repair Quote",
    desc: "We provide a clear quotation based on the equipment assessment and required repair or service.",
    badge: "Transparent Quote",
    badgeClass: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/25",
  },
  {
    num: "04",
    Icon: Wrench,
    title: "Repair & Delivery",
    desc: "Once approved, our team carries out the required service, testing and prepares the equipment for return.",
    badge: "Quality Checked",
    badgeClass: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25",
  },
];

const serviceCards = [
  { Icon: Activity, title: "AC Drive Repair", slug: "ac-drive-repair" },
  { Icon: Cpu, title: "PLC Repair", slug: "plc-repair" },
  { Icon: Settings, title: "Servo Drive Repair", slug: "servo-drive-repair" },
  { Icon: Monitor, title: "VFD Repair", slug: "vfd-repair" },
  { Icon: Monitor, title: "HMI Panel Repair", slug: "hmi-panel-repair" },
  { Icon: Zap, title: "Soft Starter Repair", slug: "soft-starter-repair" },
];

const subjectOptions = [
  "Equipment Repair",
  "Service Enquiry",
  "Equipment Support",
  "AMC / Maintenance",
  "Spare Parts",
  "Product Enquiry",
  "General Enquiry",
  "Other",
];

/* ─── Dark card styles (shared) ─────────────────────────── */
const darkCard = "rounded-[18px] border border-white/10 bg-[#162F42] shadow-lg";
const darkInput =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#18b9bb]/60 focus:ring-2 focus:ring-[#18b9bb]/20 transition";

/* ─── Main page ──────────────────────────────────────────── */
function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("enquiries")
      .insert({ ...parsed.data, enquiry_type: "contact_page" });
    setBusy(false);
    if (error) {
      toast.error("Could not send your message. Please try again.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    setSubmitted(true);
    toast.success("Message sent. We will get back to you shortly.");
  }

  return (
    <Layout>

      {/* ══════════════════════════════════════
          SECTION 01 — Dark Hero / Breadcrumb
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#071C2C]">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-32 top-0 h-72 w-72 rounded-full bg-[#18b9bb]/8 blur-[100px]" />
          <div className="absolute left-0 top-1/2 h-56 w-56 rounded-full bg-blue-500/6 blur-[80px]" />
        </div>

        <div className="container-x relative py-14 md:py-20">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-1.5 text-sm text-white/40"
          >
            <Link to="/" className="transition hover:text-white/70">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/70">Contact Us</span>
          </nav>

          {/* Eyebrow */}
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
            Contact
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
            Contact Us
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl text-base text-white/52 md:text-lg">
            Connect with Arise Healthcare Solutions for equipment repair, servicing, technical
            support and healthcare equipment requirements.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 02 — Four Contact Cards
      ══════════════════════════════════════ */}
      <section className="bg-[#0B2437]">
        <div className="container-x py-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {contactCards.map(({ Icon, label, main, sub, href, iconClass }) => {
              const inner = (
                <div
                  className={`${darkCard} flex h-full flex-col items-center p-6 text-center transition-all duration-250 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl`}
                >
                  <div
                    className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                    {label}
                  </div>
                  <div className="font-display text-[15px] font-bold text-white break-all">
                    {main}
                  </div>
                  <div className="mt-1.5 text-[13px] leading-snug text-white/45 break-words">
                    {sub}
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} className="block">
                  {inner}
                </a>
              ) : (
                <div key={label}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 03 — Statistics Strip
      ══════════════════════════════════════ */}
      <section className="bg-[#061827]">
        <div className="container-x py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(({ value, label }, i) => (
              <div key={label} className="text-center">
                {/* Vertical separator except first */}
                <div
                  className={`relative ${i > 0 ? "before:absolute before:-left-4 before:top-1/2 before:h-8 before:w-px before:-translate-y-1/2 before:bg-white/10 lg:before:block before:hidden" : ""}`}
                >
                  <div className="font-display text-4xl font-extrabold text-[#18b9bb] md:text-5xl">
                    {value}
                  </div>
                  <div className="mt-1.5 text-sm font-medium text-white/45">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 04 — Form + Info Column
      ══════════════════════════════════════ */}
      <section className="bg-[#071C2C]">
        <div className="container-x py-14 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">

            {/* LEFT — Contact form */}
            <div className={`${darkCard} p-6 md:p-8`}>
              <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
                Send Us a Message
              </h2>
              <p className="mt-2 text-sm text-white/45">
                Tell us about your equipment, service requirement or enquiry and our team will get
                back to you.
              </p>

              {submitted ? (
                <div className="mt-8 flex flex-col items-center rounded-2xl bg-white/5 py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-[#18b9bb]" />
                  <h3 className="mt-4 text-lg font-bold text-white">Message Sent</h3>
                  <p className="mt-2 text-sm text-white/50">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-2xl border border-[#18b9bb]/40 px-5 py-2.5 text-sm font-semibold text-[#18b9bb] hover:bg-[#18b9bb]/10 transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                  {/* Row 1: Name + Company */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DarkField name="name" label="Full Name" required placeholder="Your Name" />
                    <DarkField name="organisation" label="Company" placeholder="Company Name" />
                  </div>
                  {/* Row 2: Phone + Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DarkField name="mobile" label="Phone" placeholder="+91 XXXXX XXXXX" type="tel" />
                    <DarkField name="email" label="Email" required placeholder="your@email.com" type="email" />
                  </div>
                  {/* Row 3: Subject */}
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-semibold text-white/80">
                      Subject <span className="text-red-400">*</span>
                    </span>
                    <select
                      name="subject"
                      required
                      className={darkInput}
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="" className="bg-[#162F42]">Select a subject</option>
                      {subjectOptions.map((o) => (
                        <option key={o} value={o} className="bg-[#162F42]">
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                  {/* Row 4: Message */}
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-semibold text-white/80">
                      Message <span className="text-red-400">*</span>
                    </span>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Describe your equipment, fault, or enquiry in detail..."
                      className={`${darkInput} resize-none`}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#18b9bb] py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {busy ? "Sending..." : <><Send className="h-4 w-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT — Map + Info cards */}
            <div className="space-y-4">

              {/* Map card */}
              <div className={`${darkCard} overflow-hidden`}>
                <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MapPin className="h-4 w-4 text-[#18b9bb]" />
                    Our Location — Vadodara, Gujarat
                  </div>
                  <a
                    href="https://maps.google.com/?q=606+Sahyog+Space+New+Alkapuri+Vadodara+Gujarat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-[#18b9bb] hover:underline"
                  >
                    Get Directions <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="h-48 w-full">
                  <iframe
                    title="Arise Healthcare Solutions location"
                    src="https://maps.google.com/maps?q=New+Alkapuri+Vadodara+Gujarat&output=embed"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    className="h-full w-full border-0"
                    aria-hidden="true"
                  />
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-white/45">{settings.address}</p>
                </div>
              </div>

              {/* Stacked info card */}
              <div className={`${darkCard} divide-y divide-white/8 overflow-hidden`}>

                {/* Phone */}
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#18b9bb]/15 text-[#18b9bb] ring-1 ring-[#18b9bb]/25">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                      Phone Numbers
                    </div>
                    <a
                      href={phoneHref(settings.phonePlaceholder)}
                      className="mt-1 block text-sm font-semibold text-white hover:text-[#18b9bb] transition"
                    >
                      {settings.phonePlaceholder}
                    </a>
                    <a
                      href={phoneHref(settings.secondaryPhonePlaceholder)}
                      className="block text-sm font-semibold text-white hover:text-[#18b9bb] transition"
                    >
                      {settings.secondaryPhonePlaceholder}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-400/15 text-blue-400 ring-1 ring-blue-400/25">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                      Email Address
                    </div>
                    <a
                      href={`mailto:${settings.emailPlaceholder}`}
                      className="mt-1 block break-all text-sm font-semibold text-white hover:text-[#18b9bb] transition"
                    >
                      {settings.emailPlaceholder}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/25">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                      Business Hours
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                      {settings.hoursPlaceholder}
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="px-5 py-4">
                  <a
                    href={whatsappHref()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Chat on WhatsApp
                    <span className="ml-auto text-xs opacity-75">Instant support</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 05 — What Happens After
      ══════════════════════════════════════ */}
      <section className="bg-[#0B2437]">
        <div className="container-x py-14 md:py-16">
          <div className="mb-10 text-center">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#18b9bb]">
              Our Process
            </div>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              What Happens After You Contact Us?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-white/45">
              A transparent, step-by-step process designed to make your service experience simple
              and efficient.
            </p>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line */}
            <div
              className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-white/8 to-transparent lg:block"
              aria-hidden
            />
            {processSteps.map(({ num, Icon, title, desc, badge, badgeClass }) => (
              <div key={num} className={`relative ${darkCard} p-6`}>
                {/* Faded number */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-2 select-none font-extrabold leading-none text-white/[0.04]"
                  style={{ fontSize: "72px" }}
                >
                  {num}
                </span>
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-[#18b9bb]/15 text-[#18b9bb] ring-1 ring-[#18b9bb]/25">
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                >
                  {badge}
                </span>
                <h3 className="mt-2 text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 06 — Not Sure What You Need
      ══════════════════════════════════════ */}
      <section className="bg-[#071C2C]">
        <div className="container-x py-14 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Not Sure What You Need?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/45">
              Browse our most popular repair services or send your requirement directly to our team.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {serviceCards.map(({ Icon, title, slug }) => (
              <Link
                key={slug}
                to="/services/$slug"
                params={{ slug }}
                className="group flex flex-col items-center rounded-2xl border border-white/8 bg-white/4 p-5 text-center transition-all duration-250 hover:-translate-y-1 hover:border-[#18b9bb]/40 hover:bg-white/8 hover:shadow-lg"
              >
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#18b9bb]/15 text-[#18b9bb] ring-1 ring-[#18b9bb]/20 transition group-hover:bg-[#18b9bb] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[13px] font-semibold leading-snug text-white/75 group-hover:text-white transition">
                  {title}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#18b9bb] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Submit an Enquiry <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappHref()}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#25D366]/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#25D366]/15"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

    </Layout>
  );
}

/* ─── Dark form field ────────────────────────────────────── */
function DarkField({
  name,
  label,
  required,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-white/80">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </span>
      <input
        name={name}
        required={required}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#18b9bb]/60 focus:ring-2 focus:ring-[#18b9bb]/20 transition"
      />
    </label>
  );
}
