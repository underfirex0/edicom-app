"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addNoteAction, type FormState } from "./actions";
import { useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl bg-ink text-white text-[13.5px] font-medium px-4 py-2 hover:bg-black disabled:opacity-40"
    >
      {pending ? "Ajout…" : "Ajouter la note"}
    </button>
  );
}

export default function NoteForm({ candidateId }: { candidateId: string }) {
  const [state, formAction] = useFormState<FormState, FormData>(addNoteAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="space-y-2.5"
    >
      <input type="hidden" name="candidateId" value={candidateId} />
      <textarea
        name="note"
        rows={3}
        placeholder="Impressions d'entretien, points à valider, décision…"
        className="focus-ring w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] resize-none"
        required
      />
      <div className="flex items-center justify-between">
        {state?.error && <p className="text-[12.5px] text-coral">{state.error}</p>}
        {state?.success && <p className="text-[12.5px] text-teal">{state.success}</p>}
        <span />
        <SubmitButton />
      </div>
    </form>
  );
}
