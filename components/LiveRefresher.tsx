"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Polls the server every few seconds and soft-refreshes the current route's
// Server Components so admin pages update on their own — no manual reload
// needed to see a candidate's result land, a status change, etc.
export default function LiveRefresher({ intervalMs = 6000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
