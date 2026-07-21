"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { scheduleInterviewAction, type FormState } from "./actions";
import { RecoBadge, StatusPill } from "@/components/ui";
import type { Recommendation } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl bg-ink text-white text-[13px] font-medium px-4 py-2 hover:bg-black disabled:opacity-40"
    >
      {pending ? "Planification…" : "Confirmer"}
    </button>
  );
}

export default function ScheduleRow({
  candidateId,
  fullName,
  status,
  score,
  recommendation,
}: {
  candidateId: string;
  fullName: string;
  status: string;
  score: number | null;
  recommendation: Recommendation | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<FormState, FormData>(scheduleInterviewAction, null);

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-medium truncate">{fullName}</div>
          {score !== null ? (
            <div className="text-[12px] text-muted font-mono mt-0.5">score {score}/100</div>
          ) : (
            <div className="text-[12px] text-muted mt-0.5">Test pas encore complété</div>
          )}
        </div>
        {recommendation ? <RecoBadge reco={recommendation} /> : <StatusPill status={status} />}
        {!state?.success && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="focus-ring rounded-xl border border-line bg-white text-[13px] font-medium px-3.5 py-2 hover:bg-paper"
          >
            {open ? "Annuler" : "Planifier"}
          </button>
        )}
      </div>

      {state?.success && <p className="text-[12.5px] text-teal mt-3">{state.success}</p>}

      {open && !state?.success && (
        <form action={formAction} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="hidden" name="candidateId" value={candidateId} />
          <div>
            <label className="block text-[12px] font-medium text-ink/70 mb-1">Date et heure</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              required
              className="focus-ring w-full rounded-xl border border-line bg-white px-3 py-2 text-[13.5px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink/70 mb-1">Lieu</label>
            <input
              type="text"
              name="location"
              placeholder="ex. Agence EDICOM, Casablanca"
              className="focus-ring w-full rounded-xl border border-line bg-white px-3 py-2 text-[13.5px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink/70 mb-1">Reçu par</label>
            <input
              type="text"
              name="interviewer"
              placeholder="Votre nom"
              className="focus-ring w-full rounded-xl border border-line bg-white px-3 py-2 text-[13.5px]"
            />
          </div>
          {state?.error && <p className="text-[12.5px] text-coral md:col-span-3">{state.error}</p>}
          <div className="md:col-span-3">
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  );
}
