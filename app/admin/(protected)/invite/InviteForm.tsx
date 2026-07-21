"use client";

import { useFormState, useFormStatus } from "react-dom";
import { inviteCandidateAction, type FormState } from "./actions";
import { Field, TextInput } from "@/components/ui";
import { useRef, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl bg-ink text-white font-medium text-[14px] px-5 py-2.5 hover:bg-black disabled:opacity-40"
    >
      {pending ? "Création…" : "Créer et générer le lien"}
    </button>
  );
}

export default function InviteForm() {
  const [state, formAction] = useFormState<FormState, FormData>(inviteCandidateAction, null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-5">
      <form
        ref={formRef}
        action={async (fd) => {
          await formAction(fd);
        }}
        className="space-y-4"
      >
        <Field label="Nom complet du candidat">
          <TextInput name="fullName" placeholder="ex. Sara Alaoui" required />
        </Field>
        <Field label="Email">
          <TextInput type="email" name="email" placeholder="candidat@exemple.com" required />
        </Field>
        <Field label="Poste">
          <TextInput name="position" defaultValue="Commercial(e) B2B" />
        </Field>
        {state?.error && <p className="text-[13px] text-coral bg-coral-soft rounded-xl px-3.5 py-2.5">{state.error}</p>}
        {state?.success && <p className="text-[13px] text-teal bg-teal-soft rounded-xl px-3.5 py-2.5">{state.success}</p>}
        <SubmitButton />
      </form>

      {state?.link && (
        <div>
          <p className="text-[12.5px] font-medium text-ink/70 mb-2">
            Lien d&apos;invitation — partagez-le par email, WhatsApp ou SMS :
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
    </div>
  );
}
