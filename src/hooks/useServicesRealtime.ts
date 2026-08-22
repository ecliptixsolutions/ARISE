import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const REVALIDATION_INTERVAL_MS = 60_000;

export function useServicesRealtime() {
  const router = useRouter();
  const lastInvalidation = useRef(0);
  const channelName = useRef(`services-realtime-public-${crypto.randomUUID()}`);

  useEffect(() => {
    function debouncedInvalidate() {
      const now = Date.now();
      if (now - lastInvalidation.current < 2000) return;
      lastInvalidation.current = now;
      router.invalidate();
    }

    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        debouncedInvalidate,
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") router.invalidate();
      });

    const interval = window.setInterval(() => {
      router.invalidate();
    }, REVALIDATION_INTERVAL_MS);

    return () => {
      void supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [router]);
}
