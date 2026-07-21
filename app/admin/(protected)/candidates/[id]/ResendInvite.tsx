"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resendInviteAction, type FormState } from "./actions";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl border border-line bg-white text-[13px] font-medium px-3.5 py-2 hover:bg-paper disabled:opacity-40"
    >
      {pending ? "Génération…" : "Renvoyer le lien d'invitation"}
    </button>
  );
}

export default function ResendInvite({ email }: { email: string }) {
  const [state, formAction] = useFormState<FormState, FormData>(resendInviteAction, null);
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="email" value={email} />
        <SubmitButton />
      </form>
      {state?.error && <p className="text-[12.5px] text-coral mt-2">{state.error}</p>}
      {state?.link && (
        <div className="mt-2.5 flex items-center gap-2 bg-paper border border-line rounded-xl px-3 py-2">
          <input readOnly value={state.link} className="flex-1 bg-transparent text-[12px] font-mono truncate" />
          <button
            onClick={() => {
              navigator.clipboard.writeText(state.link!);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="focus-ring text-[12px] font-medium text-teal shrink-0"
          >
            {copied ? "Copié ✓" : "Copier"}
          </button>
        </div>
      )}
    </div>
  );
}
