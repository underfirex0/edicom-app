"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Subscribes directly to this candidate's test_results row via Supabase
// Realtime, so the fiche updates the instant a new answer is saved —
// no waiting for the periodic poll. Falls back gracefully to the admin
// layout's polling refresher if Realtime isn't available for any reason.
export default function LiveCandidateWatcher({ candidateId }: { candidateId: string }) {
  const router = useRouter();
  const [pulse, setPulse] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`test-results-${candidateId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_results", filter: `candidate_id=eq.${candidateId}` },
        () => {
          router.refresh();
          setPulse(true);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setPulse(false), 1200);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [candidateId, router]);

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-teal">
      <span className={"w-1.5 h-1.5 rounded-full bg-teal" + (pulse ? " animate-ping" : " animate-pulse")} />
      EN DIRECT
    </span>
  );
}
