import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { phoneHref, settings } from "@/lib/site-data";

export function TopContactBar() {
  const phone = settings.phonePlaceholder;
  const email = settings.emailPlaceholder;

  return (
    <div
      data-topbar
      className="top-contact-bar relative z-40 h-[var(--topbar-h)] w-full border-b border-white/10 bg-[#04111f] text-white/90"
    >
      <div className="container-x grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1 md:flex md:justify-between md:gap-6 md:py-0">
        <div className="flex min-w-0 flex-col items-start gap-0.5 md:flex-row md:items-center md:gap-4">
          <a
            href={phoneHref(phone)}
            aria-label={`Call Arise Healthcare Solutions at ${phone}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 shrink-0 text-cyan-300/80" aria-hidden />
            {phone}
          </a>

          <span className="hidden h-3.5 w-px bg-white/15 md:block" aria-hidden />

          <a
            href={`mailto:${email}`}
            aria-label={`Email Arise Healthcare Solutions at ${email}`}
            className="inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-cyan-300/80" aria-hidden />
            <span className="min-w-0 [overflow-wrap:anywhere]">{email}</span>
          </a>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 md:flex-row md:items-center md:gap-4">
          <span
            data-status
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-white/70"
          >
            <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-400" />
            Open · 3h 58m left
          </span>

          <span className="hidden h-3.5 w-px bg-white/15 md:block" aria-hidden />

          <Link
            to="/track-repair"
            className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors hover:text-cyan-300"
          >
            Track Repair
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
