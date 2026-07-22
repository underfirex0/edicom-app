"use client";

import { useEffect, useState } from "react";
import { TestShell, SectionEyebrow } from "@/components/TestShell";
import { FormTextarea } from "@/components/TestFormFields";
import { PrimaryButton } from "@/components/ui";

const DURATION = 60;

export default function PitchStep({
  initial,
  onNext,
}: {
  initial: string;
  onNext: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, secondsLeft]);

  const timeUp = running && secondsLeft <= 0;
  const canContinue = text.trim().length >= 15;

  return (
    <TestShell>
      <SectionEyebrow>Mise en situation</SectionEyebrow>
      <h1 className="font-display text-[20px] font-semibold leading-snug mb-2">
        Vous avez une minute. Présentez Télécontact.ma à un dirigeant d&apos;entreprise qui ne connaît pas nos
        services.
      </h1>
      <p className="text-[13px] text-muted mb-5">
        Le chronomètre est indicatif — prenez le temps de finir votre idée, ce n&apos;est pas bloquant.
      </p>

      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[12px] text-muted">Votre réponse</span>
        <span
          className={
            "font-mono text-[13px] font-semibold rounded-full px-3 py-1 " +
            (timeUp ? "bg-coral-soft text-coral" : "bg-copper-soft text-copper")
          }
        >
          {timeUp ? "Temps écoulé" : `0:${String(secondsLeft).padStart(2, "0")}`}
        </span>
      </div>

      <FormTextarea
        rows={7}
        value={text}
        onFocus={() => setRunning(true)}
        onChange={(e) => setText(e.target.value)}
        placeholder="Commencez à écrire ici — le chronomètre démarre au premier clic dans la zone."
      />

      <PrimaryButton className="mt-8 w-full" disabled={!canContinue} onClick={() => onNext(text)}>
        Continuer
      </PrimaryButton>
    </TestShell>
  );
}
