import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/integrations/mysql/client";

export type OfficeAvailabilityStatus = "open" | "closed" | "temporarily_closed";

export type OfficeAvailability = {
  id: string;
  status: OfficeAvailabilityStatus;
  starts_at: string;
  ends_at: string | null;
  reason: string | null;
  reopening_at: string | null;
  created_at: string;
  updated_at: string;
};

const BUSINESS_HOURS = {
  timeZone: "Asia/Kolkata",
  open: { hour: 9, minute: 30 },
  close: { hour: 19, minute: 0 },
  openDays: [1, 2, 3, 4, 5, 6],
} as const;

type ZonedParts = {
  year: number; month: number; day: number;
  hour: number; minute: number; second: number; weekday: number;
};

const weekdayMap: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short", hour12: false,
  }).formatToParts(date);
  const value = (type: string) => parts.find(p => p.type === type)?.value ?? "0";
  return {
    year: Number(value("year")), month: Number(value("month")), day: Number(value("day")),
    hour: Number(value("hour")), minute: Number(value("minute")), second: Number(value("second")),
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
    const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    utc += desired - actualAsUtc;
  }
  return utc;
}

function addLocalDays(parts: Pick<ZonedParts, "year" | "month" | "day">, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: BUSINESS_HOURS.timeZone, hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

export function getBusinessStatus(now: Date) {
  const nowMs = now.getTime();
  const today = getZonedParts(now, BUSINESS_HOURS.timeZone);
  const intervals = Array.from({ length: 10 }, (_, i) => i - 1)
    .map(offset => {
      const day = addLocalDays(today, offset);
      const dayNoon = localDateToUtc(BUSINESS_HOURS.timeZone, { ...day, hour: 12, minute: 0 });
      const weekday = getZonedParts(new Date(dayNoon), BUSINESS_HOURS.timeZone).weekday;
      if (!BUSINESS_HOURS.openDays.includes(weekday as (typeof BUSINESS_HOURS.openDays)[number])) return null;
      const start = localDateToUtc(BUSINESS_HOURS.timeZone, { ...day, ...BUSINESS_HOURS.open });
      const end = localDateToUtc(BUSINESS_HOURS.timeZone, { ...day, ...BUSINESS_HOURS.close });
      return { start, end };
    })
    .filter(Boolean) as Array<{ start: number; end: number }>;

  const current = intervals.find(i => nowMs >= i.start && nowMs < i.end);
  if (current) return { open: true, text: `Open · ${formatDuration(current.end - nowMs)} left` };
  const next = intervals.find(i => i.start > nowMs);
  return { open: false, text: next ? `Closed · Opens in ${formatDuration(next.start - nowMs)}` : "Closed" };
}

export function getOfficeStatus(entries: OfficeAvailability[], now: Date) {
  const nowMs = now.getTime();
  const active = entries
    .filter(entry => {
      const start = new Date(entry.starts_at).getTime();
      const end = entry.ends_at ? new Date(entry.ends_at).getTime() : Infinity;
      return start <= nowMs && nowMs < end;
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  if (!active) return getBusinessStatus(now);
  if (active.status === "open") return { open: true, text: active.reason?.trim() || "Open" };
  const label = active.status === "temporarily_closed" ? "Temporarily Closed" : "Closed";
  const opens = active.reopening_at ? ` · Opens at ${formatTime(active.reopening_at)}` : "";
  return { open: false, text: `${active.reason?.trim() || label}${opens}` };
}

const POLL_INTERVAL_MS = 30_000;

export function useOfficeAvailability() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["office-availability"],
    queryFn: async () => {
      const { data, error } = await apiGet<OfficeAvailability[]>("/api/office-availability");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: POLL_INTERVAL_MS,
  });

  // Polling replaces Supabase realtime for office availability
  const lastPollRef = useRef<number>(Date.now() - POLL_INTERVAL_MS);
  useEffect(() => {
    const interval = setInterval(async () => {
      const since = new Date(lastPollRef.current).toISOString();
      lastPollRef.current = Date.now();
      const { data } = await apiGet<{ changes: unknown[] }>("/api/poll", {
        since,
        tables: "office_availability",
      });
      if (data?.changes?.length) {
        void qc.invalidateQueries({ queryKey: ["office-availability"] });
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [qc]);

  return query;
}

export function useCurrentOfficeStatus() {
  const [now, setNow] = useState(() => new Date());
  const availability = useOfficeAvailability();

  useEffect(() => {
    const update = () => setNow(new Date());
    const interval = window.setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const status = useMemo(
    () => getOfficeStatus(availability.data ?? [], now),
    [availability.data, now],
  );
  return { ...status, loading: availability.isLoading, error: availability.error };
}
