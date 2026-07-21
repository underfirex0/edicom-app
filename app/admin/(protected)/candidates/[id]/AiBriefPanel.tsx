"use client";

import { useState, useTransition } from "react";
import { generateAiBriefAction } from "./actions";
import type { AiBrief } from "@/lib/admin-data";

export default function AiBriefPanel({ candidateId, existing }: { candidateId: string; existing: AiBrief | null }) {
  const [brief, setBrief] = useState<AiBrief | null>(existing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const res = await generateAiBriefAction(candidateId);
      if (res?.error) {
        setError(res.error);
      } else if (res?.brief) {
        setBrief({ ...res.brief, generatedAt: new Date().toISOString() });
      }
    });
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono text-[11.5px] uppercase tracking-wide text-muted">
          Synthèse & questions personnalisées (IA)
        </h2>
        <button
          onClick={generate}
          disabled={pending}
          className="focus-ring rounded-xl border border-line bg-white text-[12.5px] font-medium px-3.5 py-1.5 hover:bg-paper disabled:opacity-40"
        >
          {pending ? "Génération…" : brief ? "Régénérer" : "Générer avec l'IA"}
        </button>
      </div>

      {error && (
        <p className="text-[13px] text-coral bg-coral-soft rounded-2xl px-4 py-3 mb-3">{error}</p>
      )}

      {brief ? (
        <div className="bg-copper-soft border border-copper/30 rounded-2xl p-5">
          <p className="text-[13.5px] leading-relaxed mb-4">{brief.synthesis}</p>
          <ul className="space-y-2">
            {brief.questions.map((q, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                <span className="font-mono text-copper shrink-0">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] font-mono text-muted mt-4">
            Généré le {new Date(brief.generatedAt).toLocaleString("fr-FR")}
          </p>
        </div>
      ) : (
        !error && (
          <p className="text-[13.5px] text-muted">
            Génère une synthèse et 5 questions d&apos;entretien sur mesure à partir des réponses exactes de ce
            candidat (pas seulement de son score).
          </p>
        )
      )}
    </div>
  );
}
