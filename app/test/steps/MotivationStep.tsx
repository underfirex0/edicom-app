"use client";

import { useState } from "react";
import { TestShell, SectionEyebrow } from "@/components/TestShell";
import { FormField, FormTextarea } from "@/components/TestFormFields";
import { PrimaryButton } from "@/components/ui";
import type { Motivation } from "@/lib/types";

export default function MotivationStep({
  initial,
  onNext,
}: {
  initial: Motivation;
  onNext: (data: Motivation) => void;
}) {
  const [data, setData] = useState<Motivation>(initial);
  const requiredFilled = data.whyEdicom.trim() && data.whatMotivates.trim();

  return (
    <TestShell>
      <SectionEyebrow>Motivation</SectionEyebrow>
      <h1 className="font-display text-[22px] font-semibold mb-6">Ce qui vous anime</h1>

      <div className="space-y-5">
        <FormField label="Pourquoi souhaitez-vous rejoindre EDICOM ?">
          <FormTextarea
            rows={4}
            value={data.whyEdicom}
            onChange={(e) => setData((d) => ({ ...d, whyEdicom: e.target.value }))}
            required
          />
        </FormField>
        <FormField label="Qu'est-ce qui vous motive le plus ?">
          <FormTextarea
            rows={4}
            value={data.whatMotivates}
            onChange={(e) => setData((d) => ({ ...d, whatMotivates: e.target.value }))}
            required
          />
        </FormField>
      </div>

      <PrimaryButton className="mt-8 w-full" disabled={!requiredFilled} onClick={() => onNext(data)}>
        Continuer
      </PrimaryButton>
    </TestShell>
  );
}
