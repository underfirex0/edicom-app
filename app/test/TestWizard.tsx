"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SignalMeter } from "@/components/SignalMeter";
import { PrimaryButton } from "@/components/ui";
import { submitTestAction } from "./actions";

interface PublicQuestions {
  behavioral: { id: string; text: string }[];
  sjt: { id: string; theme: string; text: string; options: { id: string; text: string }[] }[];
}

type Screen = "intro" | "behav" | "sjt" | "submitting" | "error";

export default function TestWizard({
  candidateName,
  questions,
}: {
  candidateName: string;
  questions: PublicQuestions;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("intro");
  const [behavIdx, setBehavIdx] = useState(0);
  const [sjtIdx, setSjtIdx] = useState(0);
  const [behavAnswers, setBehavAnswers] = useState<{ id: string; val: number }[]>([]);
  const [sjtAnswers, setSjtAnswers] = useState<{ id: string; optionId: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const total = questions.behavioral.length + questions.sjt.length;

  const litBars = useMemo(() => {
    const done = screen === "behav" ? behavIdx : questions.behavioral.length + sjtIdx;
    return Math.max(1, Math.ceil(((done + 1) / total) * 5));
  }, [screen, behavIdx, sjtIdx, total, questions.behavioral.length]);

  async function finish(finalSjt: { id: string; optionId: string }[]) {
    setScreen("submitting");
    const res = await submitTestAction({ behavAnswers, sjtAnswers: finalSjt });
    if (res.ok) {
      router.push("/test/done");
    } else {
      setError(res.error ?? "Une erreur est survenue. Merci de réessayer.");
      setScreen("error");
    }
  }

  function selectLikert(val: number) {
    const q = questions.behavioral[behavIdx];
    const next = [...behavAnswers, { id: q.id, val }];
    setBehavAnswers(next);
    if (behavIdx + 1 < questions.behavioral.length) {
      setBehavIdx(behavIdx + 1);
    } else {
      setScreen("sjt");
    }
  }

  function selectOption(optionId: string) {
    const q = questions.sjt[sjtIdx];
    const next = [...sjtAnswers, { id: q.id, optionId }];
    setSjtAnswers(next);
    if (sjtIdx + 1 < questions.sjt.length) {
      setSjtIdx(sjtIdx + 1);
    } else {
      finish(next);
    }
  }

  if (screen === "intro") {
    return (
      <Shell>
        <div className="text-center">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-3">
            EDICOM · Télécontact.ma
          </div>
          <h1 className="font-display text-[26px] font-semibold leading-tight">
            Bonjour {candidateName.split(" ")[0]},<br />prêt(e) à commencer ?
          </h1>
          <p className="text-[14.5px] text-muted mt-4 leading-relaxed">
            Ce test comporte deux parties courtes : votre profil ({questions.behavioral.length} affirmations)
            et quelques mises en situation commerciales ({questions.sjt.length} scénarios). Répondez
            spontanément — il n&apos;y a pas de bonne ou de mauvaise réponse isolée. Comptez environ 8 minutes,
            et ne quittez pas la page avant la fin.
          </p>
          <PrimaryButton className="mt-8 w-full" onClick={() => setScreen("behav")}>
            Commencer le test
          </PrimaryButton>
        </div>
      </Shell>
    );
  }

  if (screen === "behav") {
    const q = questions.behavioral[behavIdx];
    return (
      <Shell>
        <TopLine index={behavIdx} total={total} bars={litBars} />
        <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-3">
          Partie 1 · Votre profil
        </div>
        <p className="font-display text-[19px] font-medium leading-snug mb-7">{q.text}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => selectLikert(v)}
              className="focus-ring flex-1 rounded-xl border border-line bg-white py-4 font-mono font-semibold text-[15px] text-ink/60 hover:border-copper hover:text-ink transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[11.5px] text-muted mt-2.5">
          <span>Pas du tout d&apos;accord</span>
          <span>Tout à fait d&apos;accord</span>
        </div>
      </Shell>
    );
  }

  if (screen === "sjt") {
    const q = questions.sjt[sjtIdx];
    const letters = ["A", "B", "C", "D"];
    return (
      <Shell>
        <TopLine index={questions.behavioral.length + sjtIdx} total={total} bars={litBars} />
        <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-3">
          Partie 2 · Mise en situation
        </div>
        <div className="bg-copper-soft border-l-[3px] border-copper rounded-2xl px-5 py-4 text-[15px] leading-relaxed mb-2">
          {q.text}
          <div className="font-semibold mt-2">Que faites-vous ?</div>
        </div>
        <div className="mt-4 space-y-2.5">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              onClick={() => selectOption(o.id)}
              className="focus-ring flex w-full text-left gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 hover:border-copper transition-colors"
            >
              <span className="font-mono text-copper font-semibold shrink-0">{letters[i]}</span>
              <span className="text-[14.5px] leading-snug">{o.text}</span>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  if (screen === "submitting") {
    return (
      <Shell>
        <div className="text-center py-14">
          <div className="w-9 h-9 mx-auto rounded-full border-2 border-line border-t-copper animate-spin mb-5" />
          <p className="text-[14.5px] text-muted">Enregistrement de vos réponses…</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="text-center py-10">
        <p className="text-[14.5px] text-coral">{error}</p>
        <PrimaryButton className="mt-6" onClick={() => finish(sjtAnswers)}>
          Réessayer
        </PrimaryButton>
      </div>
    </Shell>
  );
}

function TopLine({ index, total, bars }: { index: number; total: number; bars: number }) {
  return (
    <div className="flex items-center justify-between mb-7">
      <span className="font-mono text-[12px] text-muted">
        Question {index + 1} / {total}
      </span>
      <SignalMeter litBars={bars} />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-start justify-center px-6 py-14">
      <div className="w-full max-w-xl">
        <div className="bg-panel border border-line rounded-3xl shadow-panel p-8 md:p-10">{children}</div>
      </div>
    </main>
  );
}
