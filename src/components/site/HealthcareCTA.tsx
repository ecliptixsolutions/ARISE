import { Link } from "@tanstack/react-router";
import { Phone, ArrowRight, ShieldCheck, Zap, Star, DollarSign, Stethoscope } from "lucide-react";
import { settings, phoneHref } from "@/lib/site-data";

const benefits = [
  {
    Icon: ShieldCheck,
    title: "Expert Support",
    sub: "Experienced technical team",
    color: "text-[#18b9bb]",
    bg: "bg-[#18b9bb]/15",
  },
  {
    Icon: Zap,
    title: "Fast Service",
    sub: "Quick response & turnaround",
    color: "text-amber-400",
    bg: "bg-amber-400/15",
  },
  {
    Icon: Star,
    title: "Quality Assurance",
    sub: "Reliable service standards",
    color: "text-emerald-400",
    bg: "bg-emerald-400/15",
  },
  {
    Icon: DollarSign,
    title: "Transparent Pricing",
    sub: "Clear service estimates",
    color: "text-violet-400",
    bg: "bg-violet-400/15",
  },
  {
    Icon: Stethoscope,
    title: "Healthcare Specialists",
    sub: "Medical equipment expertise",
    color: "text-pink-400",
    bg: "bg-pink-400/15",
  },
];

export function HealthcareCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#126d8d] via-[#0e5c7a] to-[#0a4a62]">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Large faint ring top-right */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-white/6" />
        <div className="absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-white/4" />
        {/* Radial glow */}
        <div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-white/5 blur-[80px]" />
        <div className="absolute right-1/4 bottom-0 h-[250px] w-[250px] rounded-full bg-[#18b9bb]/10 blur-[60px]" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="container-x relative py-20 md:py-24">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-[#18b9bb]" />
            Trusted Healthcare Solutions
          </span>
        </div>

        {/* Heading */}
        <h2 className="font-display mx-auto max-w-3xl text-center text-[2.4rem] font-extrabold leading-tight text-white md:text-[3rem]">
          Get Your Medical Equipment
          <br />
          <span className="text-white/90">Back in Action — Fast</span>
        </h2>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-2xl text-center text-[16px] leading-relaxed text-white/62 md:text-[18px]">
          From equipment repair and servicing to technical support, Arise Healthcare Solutions
          helps healthcare facilities keep critical medical equipment reliable and ready for use.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/request-repair"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[#0e5c7a] shadow-lg transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Request Service <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={phoneHref(settings.phonePlaceholder)}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-transparent px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            aria-label={`Call Arise Healthcare Solutions at ${settings.phonePlaceholder}`}
          >
            <Phone className="h-4 w-4" />
            Call Us Now
          </a>
        </div>

        {/* Benefits row */}
        <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {benefits.map(({ Icon, title, sub, color, bg }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-5 text-center backdrop-blur-sm"
            >
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="text-[14px] font-bold text-white">{title}</div>
              <div className="text-[12px] leading-snug text-white/45">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
