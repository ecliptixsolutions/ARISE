import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { phoneHref, settings } from "@/lib/site-data";

const BUSINESS_HOURS = {
  timeZone: "Asia/Kolkata",
  open: { hour: 9, minute: 30 },
  close: { hour: 19, minute: 0 },
  openDays: [1, 2, 3, 4, 5, 6],
} as const;

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
};

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "0";
  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    hour: Number(value("hour")),
    minute: Number(value("minute")),
    second: Number(value("second")),
    weekday: weekdayMap[value("weekday")] ?? 0,
  };
}

function localDateToUtc(
  timeZone: string,
  local: { year: number; month: number; day: number; hour: number; minute: number; second?: number },
) {
  const desired = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second ?? 0);
  let utc = desired;

  for (let i = 0; i < 3; i++) {
    const actual = getZonedParts(new Date(utc), timeZone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    );
    utc += desired - actualAsUtc;
  }

  return utc;
}

function addLocalDays(parts: Pick<ZonedParts, "year" | "month" | "day">, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMinutes = Math.ceil(totalSeconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function getBusinessStatus(now: Date) {
  const nowMs = now.getTime();
  const today = getZonedParts(now, BUSINESS_HOURS.timeZone);
  const intervals = Array.from({ length: 10 }, (_, index) => index - 1)
    .map((offset) => {
      const day = addLocalDays(today, offset);
      const dayNoon = localDateToUtc(BUSINESS_HOURS.timeZone, { ...day, hour: 12, minute: 0 });
      const weekday = getZonedParts(new Date(dayNoon), BUSINESS_HOURS.timeZone).weekday;
      if (!BUSINESS_HOURS.openDays.includes(weekday as (typeof BUSINESS_HOURS.openDays)[number])) {
        return null;
      }

      const start = localDateToUtc(BUSINESS_HOURS.timeZone, {
        ...day,
        hour: BUSINESS_HOURS.open.hour,
        minute: BUSINESS_HOURS.open.minute,
      });
      let end = localDateToUtc(BUSINESS_HOURS.timeZone, {
        ...day,
        hour: BUSINESS_HOURS.close.hour,
        minute: BUSINESS_HOURS.close.minute,
      });
      if (end <= start) {
        end = localDateToUtc(BUSINESS_HOURS.timeZone, {
          ...addLocalDays(day, 1),
          hour: BUSINESS_HOURS.close.hour,
          minute: BUSINESS_HOURS.close.minute,
        });
      }
      return { start, end };
    })
    .filter(Boolean) as Array<{ start: number; end: number }>;

  const current = intervals.find((interval) => nowMs >= interval.start && nowMs < interval.end);
  if (current) return { open: true, text: `Open · ${formatDuration(current.end - nowMs)} left` };

  const next = intervals.find((interval) => interval.start > nowMs);
  return {
    open: false,
    text: next ? `Closed · Opens in ${formatDuration(next.start - nowMs)}` : "Closed",
  };
}

function AvailabilityStatus() {
  const [now, setNow] = useState(() => new Date());
  const status = useMemo(() => getBusinessStatus(now), [now]);

  useEffect(() => {
    const update = () => setNow(new Date());
    const interval = window.setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <span
      data-status
      className="inline-flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-right leading-tight text-white/70"
    >
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${status.open ? "bg-emerald-400" : "bg-gold-accent"}`}
      />
      <span className="min-w-0" suppressHydrationWarning>
        {status.text}
      </span>
    </span>
  );
}

export function TopContactBar() {
  const phone = settings.phonePlaceholder;
  const email = settings.emailPlaceholder;

  return (
    <div
      data-topbar
      className="top-contact-bar relative z-40 h-[var(--topbar-h)] w-full border-b border-white/10 bg-[#04111f] text-white/90"
    >
      <div className="container-x grid h-full grid-cols-[minmax(0,1fr)_minmax(5.5rem,auto)] items-center gap-3 py-1 md:flex md:justify-between md:gap-6 md:py-0">
        <div className="flex min-w-0 flex-col items-start gap-0.5 overflow-hidden md:flex-row md:items-center md:gap-4 md:overflow-visible">
          <a
            href={phoneHref(phone)}
            aria-label={`Call Arise Healthcare Solutions at ${phone}`}
            className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap font-semibold transition-colors hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 shrink-0 text-cyan-300/80" aria-hidden />
            {phone}
          </a>

          <span className="hidden h-3.5 w-px bg-white/15 md:block" aria-hidden />

          <a
            href={`mailto:${email}`}
            aria-label={`Email Arise Healthcare Solutions at ${email}`}
            className="inline-flex max-w-full min-w-0 items-center gap-1.5 transition-colors hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-cyan-300/80" aria-hidden />
            <span className="min-w-0 truncate whitespace-nowrap">{email}</span>
          </a>
        </div>

        <div className="flex min-w-0 shrink-0 flex-col items-end gap-0.5 md:flex-row md:items-center md:gap-4">
          <AvailabilityStatus />

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
