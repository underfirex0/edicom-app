"use client";

import { useEffect, useState } from "react";

interface Scene {
  eyebrow: string;
  title: string;
  body?: string;
  bullets?: string[];
  subStats?: { value: string; label: string }[];
  closing?: boolean;
}

const SCENES: Scene[] = [
  {
    eyebrow: "Bienvenue",
    title: "Bienvenue dans l'aventure Telecontact.ma",
    body: "Vous connaissez déjà la plateforme qui aide à trouver rapidement des entreprises et des professionnels fiables au Maroc.",
    subStats: [
      { value: "275 000+", label: "entreprises réunies" },
      { value: "36 ans", label: "d'expertise" },
    ],
  },
  {
    eyebrow: "Votre mission",
    title: "Votre mission de commercial",
    bullets: [
      "Vous démarrez avec une base de données qualifiée d'entreprises et de contacts.",
      "Votre rôle : prospecter, rencontrer des professionnels, et enrichir votre portefeuille sur le terrain.",
      "Chaque visite est une opportunité de créer de la valeur pour le client.",
    ],
  },
  {
    eyebrow: "Nos solutions",
    title: "Proposer la bonne solution",
    bullets: [
      "Visibilité locale, régionale, ou présence nationale — une formule pour chaque entreprise.",
      "Votre réussite : écouter, conseiller, et recommander la formule adaptée.",
      "Vendre, ce n'est pas seulement vendre — c'est accompagner le développement du client.",
    ],
  },
  {
    eyebrow: "En route",
    title: "Ensemble, faisons de chaque rendez-vous une nouvelle opportunité de croissance.",
    closing: true,
  },
];

const NEXT_HIGHLIGHT_DELAY = 2200;

export default function EdicomPresentation({ onFinish }: { onFinish: () => void }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [nextHighlighted, setNextHighlighted] = useState(false);

  const scene = SCENES[index];
  const isFirst = index === 0;
  const isLast = index === SCENES.length - 1;

  useEffect(() => {
    if (!started) return;
    setNextHighlighted(false);
    const t = setTimeout(() => setNextHighlighted(true), NEXT_HIGHLIGHT_DELAY);
    return () => clearTimeout(t);
  }, [index, started]);

  function goNext() {
    if (isLast) {
      onFinish();
    } else {
      setIndex((i) => Math.min(i + 1, SCENES.length - 1));
    }
  }
  function goBack() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  if (!started) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-paper flex items-center justify-center px-6">
        <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-teal/10 blur-3xl eqc-orb-a" />
        <div className="pointer-events-none absolute -bottom-28 -right-10 w-80 h-80 rounded-full bg-copper/15 blur-3xl eqc-orb-b" />
        <div className="relative text-center max-w-md">
          <div className="eqc-fade-up font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-4">
            EDICOM · Télécontact.ma
          </div>
          <h1 className="eqc-fade-up font-display text-[26px] font-semibold leading-tight" style={{ animationDelay: "0.1s" }}>
            Avant de finir, une petite présentation
          </h1>
          <p className="eqc-fade-up text-[14.5px] text-muted mt-4 leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Quatre écrans courts, à votre rythme — vous avancez quand vous êtes prêt(e).
          </p>
          <button
            onClick={() => setStarted(true)}
            className="focus-ring eqc-fade-up mt-8 rounded-2xl bg-ink text-white font-medium text-[15px] px-7 py-3.5 hover:bg-black transition-colors"
            style={{ animationDelay: "0.3s" }}
          >
            Commencez la présentation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper flex items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-teal/10 blur-3xl eqc-orb-a" />
      <div className="pointer-events-none absolute -bottom-28 -right-10 w-80 h-80 rounded-full bg-copper/15 blur-3xl eqc-orb-b" />

      <div className="relative w-full max-w-lg">
        <div key={index} className="text-center">
          <div className="eqc-fade-up font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-5">
            {scene.eyebrow}
          </div>

          <h1
            className={
              "eqc-fade-up font-display font-semibold leading-tight " +
              (scene.closing ? "text-[28px] md:text-[32px]" : "text-[24px] md:text-[27px]")
            }
            style={{ animationDelay: "0.1s" }}
          >
            {scene.title}
          </h1>

          {scene.body && (
            <p className="eqc-fade-up text-[15px] text-ink/70 mt-5 leading-relaxed max-w-md mx-auto" style={{ animationDelay: "0.2s" }}>
              {scene.body}
            </p>
          )}

          {scene.subStats && (
            <div className="mt-7 flex items-center justify-center gap-4">
              {scene.subStats.map((s, i) => (
                <div
                  key={i}
                  className="eqc-fade-up bg-panel border border-line rounded-2xl px-6 py-4 min-w-[140px]"
                  style={{ animationDelay: `${0.32 + i * 0.12}s` }}
                >
                  <div className="font-display text-[22px] font-semibold text-copper">{s.value}</div>
                  <div className="text-[11.5px] text-muted mt-1 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {scene.bullets && (
            <ul className="mt-7 space-y-3 text-left max-w-md mx-auto">
              {scene.bullets.map((b, i) => (
                <li
                  key={i}
                  className="eqc-fade-up flex items-start gap-3 bg-panel border border-line rounded-2xl px-4 py-3.5"
                  style={{ animationDelay: `${0.2 + i * 0.13}s` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                  <span className="text-[14.5px] leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {scene.closing && (
            <div className="eqc-fade-up mt-8" style={{ animationDelay: "0.25s" }}>
              <div className="w-10 h-10 mx-auto rounded-full bg-teal flex items-center justify-center">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12.5L9.5 18L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10">
          {SCENES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Écran ${i + 1}`}
              className="focus-ring h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === index ? "22px" : "6px",
                backgroundColor: i === index ? "#BD8A4F" : "#E7E3DA",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={goBack}
            disabled={isFirst}
            className="focus-ring rounded-xl border border-line bg-white text-[13.5px] font-medium px-4 py-2.5 text-ink/70 hover:bg-paper disabled:opacity-0 disabled:pointer-events-none transition-opacity"
          >
            ← Précédent
          </button>

          <button
            onClick={goNext}
            className={
              "focus-ring rounded-xl bg-ink text-white font-medium text-[13.5px] px-5 py-2.5 hover:bg-black transition-transform " +
              (nextHighlighted ? "eqc-cta-pulse" : "")
            }
          >
            {isLast ? "Continuer le test →" : "Suivant →"}
          </button>
        </div>
      </div>
    </main>
  );
}
