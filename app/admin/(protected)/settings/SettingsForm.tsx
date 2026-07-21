"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateSettingsAction, type FormState } from "./actions";
import { Field, TextInput } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-xl bg-ink text-white font-medium text-[14px] px-5 py-2.5 hover:bg-black disabled:opacity-40"
    >
      {pending ? "Enregistrement…" : "Enregistrer les réglages"}
    </button>
  );
}

export default function SettingsForm({
  behavWeight,
  sjtWeight,
  thresholdGood,
  thresholdWatch,
}: {
  behavWeight: number;
  sjtWeight: number;
  thresholdGood: number;
  thresholdWatch: number;
}) {
  const [state, formAction] = useFormState<FormState, FormData>(updateSettingsAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Poids du profil comportemental (%)">
          <TextInput type="number" name="behavWeight" defaultValue={Math.round(behavWeight * 100)} min={0} max={100} required />
        </Field>
        <Field label="Poids des mises en situation (%)">
          <TextInput type="number" name="sjtWeight" defaultValue={Math.round(sjtWeight * 100)} min={0} max={100} required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Seuil « Profil recommandé » (score ≥)">
          <TextInput type="number" name="thresholdGood" defaultValue={thresholdGood} min={0} max={100} required />
        </Field>
        <Field label="Seuil « À creuser en entretien » (score ≥)">
          <TextInput type="number" name="thresholdWatch" defaultValue={thresholdWatch} min={0} max={100} required />
        </Field>
      </div>
      {state?.error && <p className="text-[13px] text-coral bg-coral-soft rounded-xl px-3.5 py-2.5">{state.error}</p>}
      {state?.success && <p className="text-[13px] text-teal bg-teal-soft rounded-xl px-3.5 py-2.5">{state.success}</p>}
      <SubmitButton />
    </form>
  );
}
