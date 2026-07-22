"use client";

import { useState } from "react";
import { TestShell, SectionEyebrow } from "@/components/TestShell";
import { FormTextarea } from "@/components/TestFormFields";
import { PrimaryButton } from "@/components/ui";

export default function FinalQuestionStep({
  initial,
  onSubmit,
}: {
  initial: string;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  const canSubmit = text.trim().length >= 10;

  return (
    <TestShell>
      <SectionEyebrow>Dernière question</SectionEyebrow>
      <h1 className="font-display text-[21px] font-semibold leading-snug mb-6">
        Pourquoi devrions-nous vous recruter plutôt qu&apos;un autre candidat ?
      </h1>

      <FormTextarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Votre réponse…" />

      <PrimaryButton className="mt-8 w-full" disabled={!canSubmit} onClick={() => onSubmit(text)}>
        Terminer et envoyer
      </PrimaryButton>
    </TestShell>
  );
}
