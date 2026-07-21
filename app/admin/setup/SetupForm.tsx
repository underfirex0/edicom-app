"use client";

import { useFormState, useFormStatus } from "react-dom";
import { bootstrapAdminAction, type FormState } from "./actions";
import { Field, TextInput, PrimaryButton } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending} className="w-full">
      {pending ? "Création…" : "Créer mon compte administrateur"}
    </PrimaryButton>
  );
}

export default function SetupForm() {
  const [state, formAction] = useFormState<FormState, FormData>(bootstrapAdminAction, null);
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Nom complet">
        <TextInput name="fullName" placeholder="Votre nom" required />
      </Field>
      <Field label="Email">
        <TextInput type="email" name="email" placeholder="vous@edicom.ma" required />
      </Field>
      <Field label="Mot de passe">
        <TextInput type="password" name="password" placeholder="8 caractères minimum" required minLength={8} />
      </Field>
      {state?.error && <p className="text-[13px] text-coral bg-coral-soft rounded-xl px-3.5 py-2.5">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
