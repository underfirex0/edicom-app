"use client";

import { useState } from "react";
import { TestShell, SectionEyebrow } from "@/components/TestShell";
import { FormField, FormInput, FormTextarea } from "@/components/TestFormFields";
import { PrimaryButton } from "@/components/ui";
import type { ProfessionalBackground } from "@/lib/types";

export default function BackgroundStep({
  initial,
  onNext,
}: {
  initial: ProfessionalBackground;
  onNext: (data: ProfessionalBackground) => void;
}) {
  const [data, setData] = useState<ProfessionalBackground>(initial);

  const requiredFilled =
    data.lastPosition.trim() &&
    data.company.trim() &&
    data.duration.trim() &&
    data.leavingReason.trim() &&
    data.bestSale.trim() &&
    data.biggestFailure.trim() &&
    data.failureLesson.trim();

  function set<K extends keyof ProfessionalBackground>(key: K, value: ProfessionalBackground[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  return (
    <TestShell wide>
      <SectionEyebrow>Parcours professionnel</SectionEyebrow>
      <h1 className="font-display text-[22px] font-semibold mb-6">Votre expérience</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormField label="Dernier poste occupé">
          <FormInput value={data.lastPosition} onChange={(e) => set("lastPosition", e.target.value)} required />
        </FormField>
        <FormField label="Entreprise">
          <FormInput value={data.company} onChange={(e) => set("company", e.target.value)} required />
        </FormField>
        <FormField label="Durée" span2>
          <FormInput
            value={data.duration}
            onChange={(e) => set("duration", e.target.value)}
            placeholder="ex. 2 ans"
            required
          />
        </FormField>
      </div>

      <div className="space-y-4">
        <FormField label="Pourquoi avez-vous quitté cette entreprise ?">
          <FormTextarea rows={2} value={data.leavingReason} onChange={(e) => set("leavingReason", e.target.value)} required />
        </FormField>
        <FormField label="Quelle est votre plus belle réussite commerciale ?">
          <FormTextarea rows={3} value={data.bestSale} onChange={(e) => set("bestSale", e.target.value)} required />
        </FormField>
        <FormField label="Quel est votre plus gros échec commercial ?">
          <FormTextarea rows={3} value={data.biggestFailure} onChange={(e) => set("biggestFailure", e.target.value)} required />
        </FormField>
        <FormField label="Qu'en avez-vous appris ?">
          <FormTextarea rows={2} value={data.failureLesson} onChange={(e) => set("failureLesson", e.target.value)} required />
        </FormField>
      </div>

      <PrimaryButton className="mt-8 w-full" disabled={!requiredFilled} onClick={() => onNext(data)}>
        Continuer
      </PrimaryButton>
    </TestShell>
  );
}
