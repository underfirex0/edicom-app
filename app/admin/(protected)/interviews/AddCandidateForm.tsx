"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addAndScheduleAction, type FormState } from "./actions";
import { Field, TextInput, Card } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl bg-ink text-white font-medium text-[14px] px-5 py-2.5 hover:bg-black disabled:opacity-40"
    >
      {pending ? "Création…" : "Ajouter le candidat"}
    </button>
  );
}

export default function AddCandidateForm() {
  const [phase, setPhase] = useState<"closed" | "form" | "done">("closed");
  const [copied, setCopied] = useState(false);
  const [state, formAction] = useFormState<FormState, FormData>(addAndScheduleAction, null);

  useEffect(() => {
    if (state?.success) setPhase("done");
  }, [state]);

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[16px] font-semibold">Ajouter un candidat</h2>
          <p className="text-[13px] text-muted mt-0.5">
            Pour une personne qui vient directement à un rendez-vous, sans être passée par le test en amont.
          </p>
        </div>
        <button
          onClick={() => setPhase(phase === "closed" ? "form" : "closed")}
          className="focus-ring rounded-xl border border-line bg-white text-[13px] font-medium px-3.5 py-2 hover:bg-paper shrink-0"
        >
          {phase === "closed" ? "+ Ajouter" : "Fermer"}
        </button>
      </div>

      {phase === "form" && (
        <form action={formAction} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom complet">
              <TextInput name="fullName" placeholder="ex. Sara Alaoui" required />
            </Field>
            <Field label="Email">
              <TextInput type="email" name="email" placeholder="candidat@exemple.com" required />
            </Field>
          </div>
          <Field label="Poste">
            <TextInput name="position" defaultValue="Commercial(e) Terrain B2B" />
          </Field>
          <div className="border-t border-line pt-4">
            <p className="text-[12.5px] font-medium text-ink/70 mb-3">
              Planifier son entretien maintenant (optionnel — vous pouvez aussi le faire plus tard depuis
              « À planifier »)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Date et heure">
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  className="focus-ring w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13.5px]"
                />
              </Field>
              <Field label="Lieu">
                <TextInput name="location" placeholder="ex. Agence EDICOM, Casablanca" />
              </Field>
              <Field label="Reçu par">
                <TextInput name="interviewer" placeholder="Votre nom" />
              </Field>
            </div>
          </div>
          {state?.error && <p className="text-[13px] text-coral bg-coral-soft rounded-xl px-3.5 py-2.5">{state.error}</p>}
          <SubmitButton />
        </form>
      )}

      {phase === "done" && (
        <div className="mt-5 space-y-3">
          <p className="text-[13px] text-teal bg-teal-soft rounded-xl px-3.5 py-2.5">{state?.success}</p>
          {state?.link && (
            <div>
              <p className="text-[12.5px] font-medium text-ink/70 mb-2">
                Lien d&apos;accès — partagez-le par email, WhatsApp ou SMS :
              </p>
              <div className="flex items-center gap-2 bg-paper border border-line rounded-xl px-3.5 py-3">
                <input readOnly value={state.link} className="flex-1 bg-transparent text-[12.5px] font-mono truncate" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(state.link!);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="focus-ring text-[13px] font-medium text-teal shrink-0"
                >
                  {copied ? "Copié ✓" : "Copier"}
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <button onClick={() => setPhase("form")} className="focus-ring font-mono text-[12px] text-teal">
              + Ajouter un autre candidat
            </button>
            <button onClick={() => setPhase("closed")} className="focus-ring font-mono text-[12px] text-muted hover:text-ink">
              Fermer
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
