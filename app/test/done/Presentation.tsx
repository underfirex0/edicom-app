"use client";

import { useEffect, useState } from "react";

interface Scene {
  eyebrow: string;
  title: string;
  bullets?: string[];
  stat?: { value: number; suffix: string; label: string };
  body?: string;
  final?: boolean;
}

const SCENES: Scene[] = [
  {
    eyebrow: "EDICOM · Télécontact.ma",
    title: "36 ans à faire grandir les entreprises marocaines.",
    stat: { value: 36, suffix: " ans", label: "d'expertise B2B" },
  },
  {
    eyebrow: "Qui sommes-nous",
    title: "La référence marocaine de la donnée B2B",
    bullets: [
      "Télécontact.ma — prospection et prise de rendez-vous",
      "Kompass Maroc — bases de données B2B qualifiées",
      "Des solutions pensées pour les commerciaux terrain",
    ],
  },
  {
    eyebrow: "Votre rôle",
    title: "Vous serez sur le terrain, pas derrière un bureau",
    bullets: [
      "Un portefeuille de prospects qualifiés fournis",
      "Des outils performants pensés pour vendre",
      "Une vraie autonomie sur votre secteur",
    ],
  },
  {
    eyebrow: "Pourquoi nous rejoindre",
    title: "Grandir avec nous, concrètement",
    bullets: [
      "Salaire fixe + commissions attractives et déplafonnées",
      "Une formation dès votre arrivée",
      "De réelles perspectives vers des postes de management",
    ],
  },
  {
    eyebrow: "Merci",
    title: "Le recruteur arrive dans un instant",
    body: "Installez-vous confortablement — votre entretien va bientôt commencer.",
    final: true,
  },
];

const SCENE_DURATION = 6500;

function AnimatedCounter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const start = performance.now();
    const duration = 1100;
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setN(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

export default function Presentation({ onDone }: { onDone?: () => void }) {
  const [index, setIndex] = useState(0);
  const isFinal = SCENES[index].final;

  useEffect(() => {
    if (isFinal) return;
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, SCENES.length - 1)), SCENE_DURATION);
    return () => clearTimeout(t);
  }, [index, isFinal]);

  const scene = SCENES[index];

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper flex items-center justify-center px-6">
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-teal/10 blur-3xl eqc-orb-a" />
      <div className="pointer-events-none absolute -bottom-28 -right-10 w-80 h-80 rounded-full bg-copper/15 blur-3xl eqc-orb-b" />

      <div className="relative w-full max-w-xl">
        <div key={index} className="text-center">
          <div className="eqc-fade-up font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-4">
            {scene.eyebrow}
          </div>

          {scene.stat && (
            <div className="eqc-fade-up mb-3" style={{ animationDelay: "0.08s" }}>
              <div className="font-display text-[64px] font-semibold leading-none text-ink">
                <AnimatedCounter value={scene.stat.value} />
                {scene.stat.suffix}
              </div>
              <div className="text-[13px] text-muted mt-2">{scene.stat.label}</div>
            </div>
          )}

          <h1
            className="eqc-fade-up font-display text-[26px] md:text-[30px] font-semibold leading-tight mt-1"
            style={{ animationDelay: "0.12s" }}
          >
            {scene.title}
          </h1>

          {scene.body && (
            <p className="eqc-fade-up text-[14.5px] text-muted mt-4 leading-relaxed" style={{ animationDelay: "0.22s" }}>
              {scene.body}
            </p>
          )}

          {scene.bullets && (
            <ul className="mt-7 space-y-3 text-left max-w-md mx-auto">
              {scene.bullets.map((b, i) => (
                <li
                  key={i}
                  className="eqc-fade-up flex items-start gap-3 bg-panel border border-line rounded-2xl px-4 py-3"
                  style={{ animationDelay: `${0.25 + i * 0.14}s` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                  <span className="text-[14px] leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {isFinal && (
            <div className="eqc-fade-up w-9 h-9 mx-auto rounded-full bg-teal flex items-center justify-center mt-8" style={{ animationDelay: "0.3s" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12.5L9.5 18L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-10">
          {SCENES.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === index ? "22px" : "6px",
                backgroundColor: i === index ? "#BD8A4F" : "#E7E3DA",
              }}
            />
          ))}
        </div>

        {!isFinal && (
          <button
            onClick={() => setIndex(SCENES.length - 1)}
            className="focus-ring absolute -bottom-14 right-0 font-mono text-[11.5px] text-muted hover:text-ink"
          >
            Passer →
          </button>
        )}
      </div>
    </main>
  );
}
