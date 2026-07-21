"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  cancelInterviewAction,
  completeInterviewAction,
  markNoShowAction,
  rescheduleInterviewAction,
  type FormState,
} from "./actions";
import { RecoBadge } from "@/components/ui";
import type { Recommendation } from "@/lib/types";

function CompleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl bg-ink text-white text-[13px] font-medium px-4 py-2 hover:bg-black disabled:opacity-40"
    >
      {pending ? "Enregistrement…" : "Enregistrer la décision"}
    </button>
  );
}

export default function InterviewCard({
  interviewId,
  candidateId,
  candidateName,
  score,
  recommendation,
  scheduledAt,
  location,
  interviewer,
}: {
  interviewId: string;
  candidateId: string;
  candidateName: string;
  score: number | null;
  recommendation: Recommendation | null;
  scheduledAt: string;
  location: string | null;
  interviewer: string | null;
}) {
  const [mode, setMode] = useState<"idle" | "complete" | "reschedule">("idle");
  const [newDate, setNewDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useFormState<FormState, FormData>(completeInterviewAction, null);

  const date = new Date(scheduledAt);
  const isPast = date.getTime() < Date.now();

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-medium truncate">{candidateName}</div>
          <div className="text-[12px] text-muted font-mono mt-0.5">
            {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
            {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            {location ? ` · ${location}` : ""}
            {interviewer ? ` · reçu par ${interviewer}` : ""}
            {isPast && mode === "idle" ? " · en retard" : ""}
          </div>
        </div>
        {score !== null && recommendation && <RecoBadge reco={recommendation} />}
        {mode === "idle" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMode("reschedule")}
              className="focus-ring font-mono text-[12px] text-muted hover:text-ink"
            >
              Reporter
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => markNoShowAction(interviewId, candidateId))}
              className="focus-ring font-mono text-[12px] text-muted hover:text-coral"
            >
              Absent(e)
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => cancelInterviewAction(interviewId, candidateId))}
              className="focus-ring font-mono text-[12px] text-muted hover:text-coral"
            >
              Annuler
            </button>
            <button
              onClick={() => setMode("complete")}
              className="focus-ring rounded-xl bg-ink text-white text-[13px] font-medium px-3.5 py-2 hover:bg-black"
            >
              Marquer comme terminé
            </button>
          </div>
        )}
      </div>

      {mode === "reschedule" && (
        <div className="mt-4 flex items-center gap-3">
          <input
            type="datetime-local"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="focus-ring rounded-xl border border-line bg-white px-3 py-2 text-[13.5px]"
          />
          <button
            disabled={!newDate || pending}
            onClick={() =>
              startTransition(async () => {
                await rescheduleInterviewAction(interviewId, candidateId, newDate);
                setMode("idle");
              })
            }
            className="focus-ring rounded-xl bg-ink text-white text-[13px] font-medium px-4 py-2 hover:bg-black disabled:opacity-40"
          >
            Confirmer le report
          </button>
          <button onClick={() => setMode("idle")} className="focus-ring font-mono text-[12px] text-muted hover:text-ink">
            Annuler
          </button>
        </div>
      )}

      {mode === "complete" && (
        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="interviewId" value={interviewId} />
          <input type="hidden" name="candidateId" value={candidateId} />
          <div className="flex gap-2">
            {[
              { value: "hire", label: "Recruter", color: "border-teal text-teal" },
              { value: "second_round", label: "Revoir (2e entretien)", color: "border-amber text-amber" },
              { value: "reject", label: "Ne pas retenir", color: "border-coral text-coral" },
            ].map((o) => (
              <label
                key={o.value}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium cursor-pointer ${o.color}`}
              >
                <input type="radio" name="outcome" value={o.value} className="accent-current" required />
                {o.label}
              </label>
            ))}
          </div>
          <textarea
            name="outcomeNotes"
            rows={2}
            placeholder="Notes sur la décision (optionnel)"
            className="focus-ring w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] resize-none"
          />
          {state?.error && <p className="text-[12.5px] text-coral">{state.error}</p>}
          <div className="flex items-center gap-3">
            <CompleteSubmit />
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="focus-ring font-mono text-[12px] text-muted hover:text-ink"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
