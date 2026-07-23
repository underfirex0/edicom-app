"use client";

import { useEffect, useState } from "react";

interface Offer {
  name: string;
  tagline: string;
  audience: string;
}

interface Scene {
  eyebrow: string;
  title: string;
  bullets?: string[];
  stat?: { value: number; suffix: string; label: string };
  subStats?: { value: string; label: string }[];
  offers?: Offer[];
  body?: string;
}

const SCENES: Scene[] = [
  {
    eyebrow: "EDICOM · Télécontact.ma",
    title: "Le 1er réflexe pour la recherche professionnelle au Maroc.",
    stat: { value: 36, suffix: " ans", label: "d'expertise" },
    subStats: [
      { value: "275K+", label: "entreprises inscrites" },
      { value: "23K+", label: "recherches / jour" },
      { value: "100%", label: "couverture nationale" },
    ],
  },
  {
    eyebrow: "Ce que nous faisons",
    title: "Connecter la demande à votre expertise, au bon moment",
    bullets: [
      "Recherche ciblée — un client cherche activement un professionnel près de chez lui",
      "Visibilité maximale — l'entreprise apparaît en priorité au moment précis de la recherche",
      "Conversion — le prospect contacte directement l'entreprise : appel, message, devis",
    ],
  },
  {
    eyebrow: "Les offres que vous allez présenter",
    title: "Trois formules, une pour chaque ambition",
    offers: [
      { name: "Digital Local", tagline: "Visibilité de proximité", audience: "Commerces, artisans, professions libérales" },
      { name: "Digital Booster", tagline: "Visibilité régionale", audience: "Entreprises en croissance" },
      { name: "Digital Max", tagline: "Rayonnement multi-régions", audience: "Grandes entreprises, réseaux nationaux" },
    ],
  },
  {
    eyebrow: "Ce que veulent leurs clients",
    title: "Être trouvé au bon moment, par les bonnes personnes",
    bullets: [
      "Trouver un professionnel fiable en moins de 3 clics",
      "Une recherche locale précise, dans leur quartier",
      "Des avis clients authentiques, pour choisir en confiance",
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
    eyebrow: "Merci pour votre attention",
    title: "Encore quelques questions et ce sera terminé",
    body: "Deux dernières mises en situation vous attendent — vous y êtes presque.",
  },
];

const NEXT_HIGHLIGHT_DELAY = 2200;

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
            Avant de finir, découvrez ce que vous allez vendre
          </h1>
          <p className="eqc-fade-up text-[14.5px] text-muted mt-4 leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Qui nous sommes, ce que nous vendons, et pourquoi nos clients en ont besoin — à votre
            rythme, quelques écrans, vous avancez quand vous êtes prêt(e).
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
            className="eqc-fade-up font-display text-[24px] md:text-[28px] font-semibold leading-tight mt-1"
            style={{ animationDelay: "0.12s" }}
          >
            {scene.title}
          </h1>

          {scene.body && (
            <p className="eqc-fade-up text-[14.5px] text-muted mt-4 leading-relaxed" style={{ animationDelay: "0.22s" }}>
              {scene.body}
            </p>
          )}

          {scene.subStats && (
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {scene.subStats.map((s, i) => (
                <div
                  key={i}
                  className="eqc-fade-up bg-panel border border-line rounded-2xl px-2 py-3"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div className="font-display text-[18px] font-semibold text-copper">{s.value}</div>
                  <div className="text-[10.5px] text-muted mt-0.5 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
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

          {scene.offers && (
            <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              {scene.offers.map((o, i) => (
                <div
                  key={i}
                  className="eqc-fade-up bg-panel border border-line rounded-2xl px-4 py-4"
                  style={{ animationDelay: `${0.25 + i * 0.14}s` }}
                >
                  <div className="font-display text-[15px] font-semibold text-ink">{o.name}</div>
                  <div className="text-[12.5px] text-copper font-medium mt-0.5">{o.tagline}</div>
                  <div className="text-[12px] text-muted mt-2 leading-snug">{o.audience}</div>
                </div>
              ))}
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
