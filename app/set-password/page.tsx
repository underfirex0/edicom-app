"use client";

import { useFormState, useFormStatus } from "react-dom";
import { setPasswordAction, type FormState } from "./actions";
import { Field, TextInput, PrimaryButton, Card } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending} className="w-full">
      {pending ? "Enregistrement…" : "Continuer vers le test"}
    </PrimaryButton>
  );
}

export default function SetPasswordPage() {
  const [state, formAction] = useFormState<FormState, FormData>(setPasswordAction, null);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-3">
            EDICOM · Télécontact.ma
          </div>
          <h1 className="font-display text-[24px] font-semibold">Bienvenue</h1>
          <p className="text-[13.5px] text-muted mt-2">
            Choisissez un mot de passe pour accéder à votre évaluation.
          </p>
        </div>
        <Card className="p-7">
          <form action={formAction} className="space-y-4">
            <Field label="Nouveau mot de passe">
              <TextInput type="password" name="password" placeholder="8 caractères minimum" required minLength={8} />
            </Field>
            <Field label="Confirmer le mot de passe">
              <TextInput type="password" name="confirm" placeholder="••••••••" required minLength={8} />
            </Field>
            {state?.error && (
              <p className="text-[13px] text-coral bg-coral-soft rounded-xl px-3.5 py-2.5">{state.error}</p>
            )}
            <SubmitButton />
          </form>
        </Card>
      </div>
    </main>
  );
}
