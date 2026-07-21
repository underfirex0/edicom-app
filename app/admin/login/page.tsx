"use client";

import { useFormState, useFormStatus } from "react-dom";
import { adminLoginAction, type FormState } from "./actions";
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

export default function AdminLoginPage() {
  const [state, formAction] = useFormState<FormState, FormData>(adminLoginAction, null);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-ink">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-3">
            EDICOM · Administration
          </div>
          <h1 className="font-display text-[24px] font-semibold text-white">Tableau de bord recruteur</h1>
        </div>
        <Card className="p-7">
          <form action={formAction} className="space-y-4">
            <Field label="Email">
              <TextInput type="email" name="email" placeholder="recruteur@edicom.ma" required />
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
          <Link href="/admin/setup" className="focus-ring font-mono text-[12px] text-white/40 hover:text-white/70">
            Première configuration →
          </Link>
        </div>
      </div>
    </main>
  );
}
