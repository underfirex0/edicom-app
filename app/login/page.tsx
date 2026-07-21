"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type FormState } from "./actions";
import { Field, TextInput, PrimaryButton, Card } from "@/components/ui";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending} className="w-full">
      {pending ? "Connexion…" : "Se connecter"}
    </PrimaryButton>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<FormState, FormData>(loginAction, null);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-3">
            EDICOM · Télécontact.ma
          </div>
          <h1 className="font-display text-[24px] font-semibold">Espace candidat</h1>
          <p className="text-[13.5px] text-muted mt-2">Connectez-vous avec les identifiants reçus par email.</p>
        </div>
        <Card className="p-7">
          <form action={formAction} className="space-y-4">
            <Field label="Email">
              <TextInput type="email" name="email" placeholder="vous@exemple.com" required />
            </Field>
            <Field label="Mot de passe">
              <TextInput type="password" name="password" placeholder="••••••••" required />
            </Field>
            {state?.error && (
              <p className="text-[13px] text-coral bg-coral-soft rounded-xl px-3.5 py-2.5">{state.error}</p>
            )}
            <SubmitButton />
          </form>
        </Card>
        <div className="text-center mt-6">
          <Link href="/" className="focus-ring font-mono text-[12px] text-muted hover:text-ink">
            ← Retour
          </Link>
        </div>
      </div>
    </main>
  );
}
