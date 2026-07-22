"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { copyTestLinkAction, type CopyLinkState } from "@/app/admin/(protected)/_shared/actions";

function TriggerButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl border border-line bg-white text-[13px] font-medium px-3.5 py-2 hover:bg-paper disabled:opacity-40 shrink-0"
    >
      {pending ? "Génération…" : label}
    </button>
  );
}

export default function CopyTestLink({ email, label = "Lien du test" }: { email: string; label?: string }) {
  const [state, formAction] = useFormState<CopyLinkState, FormData>(copyTestLinkAction, null);
  const [copied, setCopied] = useState(false);

  if (state?.link) {
    return (
      <div className="flex items-center gap-2 bg-paper border border-line rounded-xl px-3 py-2 w-full md:w-auto">
        <input readOnly value={state.link} className="flex-1 md:w-64 bg-transparent text-[12px] font-mono truncate" />
        <button
          onClick={() => {
            navigator.clipboard.writeText(state.link!);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="focus-ring text-[12.5px] font-medium text-teal shrink-0"
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="shrink-0">
      <input type="hidden" name="email" value={email} />
      {state?.error ? (
        <span className="text-[12px] text-coral">{state.error}</span>
      ) : (
        <TriggerButton label={label} />
      )}
    </form>
  );
}
