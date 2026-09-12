// useServicesRealtime.ts
// Replaces Supabase realtime subscription for the services table.
// Uses polling against the change_log endpoint.
import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { apiGet } from "@/integrations/mysql/client";

const POLL_MS = 30_000;

export function useServicesRealtime() {
  const router = useRouter();
  const lastPollRef = useRef<number>(Date.now() - POLL_MS);

  useEffect(() => {
    const interval = setInterval(async () => {
      const since = new Date(lastPollRef.current).toISOString();
      lastPollRef.current = Date.now();
      const { data } = await apiGet<{ changes: unknown[] }>("/api/poll", {
        since,
        tables: "services",
      });
      if (data?.changes?.length) {
        void router.invalidate();
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [router]);
}
