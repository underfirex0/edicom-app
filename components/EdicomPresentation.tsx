"use client";

import { useEffect, useState } from "react";

interface Slide {
  eyebrow: string;
  title: string;
  body?: string;
  intro?: string;
  bullets?: string[];
  signature?: string;
  closing?: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Présentation",
    title: "Telecontact.ma",
    body: "275 000 entreprises marocaines actives réunies sur une seule plateforme. Plus de 36 ans d'expertise en information professionnelle. Un accès rapide aux informations essentielles pour identifier clients, partenaires et fournisseurs. Un outil conçu pour accélérer le développement commercial des entreprises.",
    signature: "Telecontact.ma, le point de départ de vos opportunités d'affaires.",
  },
  {
    eyebrow: "Nos solutions",
    title: "Bien plus qu'un annuaire : un accélérateur de croissance",
    intro: "Des solutions pour développer votre activité :",
    bullets: [
      "Recherche multicritère (secteur, ville, taille, chiffre d'affaires, effectif, export)",
      "Identification des décideurs",
      "Génération de prospects qualifiés",
      "Prise de rendez-vous commerciaux",
      "CRM et solutions de pilotage commercial",
    ],
    closing: "Avec Telecontact.ma, les données deviennent des opportunités commerciales concrètes.",
  },
  {
    eyebrow: "Bienvenue",
    title: "Bienvenue dans l'aventure Telecontact.ma",
    body: "Vous connaissez déjà la plateforme qui aide à trouver rapidement des entreprises et des professionnels fiables. Aujourd'hui, votre mission est de porter cette plateforme auprès des entreprises marocaines. Votre objectif : aider chaque professionnel à se rendre plus visible, attirer de nouveaux clients, et développer son activité.",
  },
  {
    eyebrow: "Votre mission",
    title: "Votre mission de commercial",
    body: "Vous démarrez avec une base de données qualifiée d'entreprises, de contacts et de coordonnées. Votre rôle est de prospecter, rencontrer des professionnels, enrichir votre portefeuille avec votre réseau et vos découvertes sur le terrain, comprendre les besoins, et présenter les solutions Telecontact.ma adaptées. Chaque visite est une opportunité de créer de la valeur pour le client.",
  },
  {
    eyebrow: "Votre réussite",
    title: "Proposer la bonne solution",
    body: "Telecontact.ma offre des solutions adaptées à chaque entreprise : visibilité locale, couverture régionale ou multirégionale, présence nationale. Votre réussite repose sur votre capacité à écouter, conseiller et recommander la formule qui permettra au client de développer son chiffre d'affaires. Votre mission n'est pas seulement de vendre, mais d'accompagner les entreprises dans leur développement.",
    closing: "Ensemble, faisons de chaque rendez-vous une nouvelle opportunité de croissance.",
  },
];

const NEXT_HIGHLIGHT_DELAY = 2200;

export default function EdicomPresentation({ onFinish }: { onFinish: () => void }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [nextHighlighted, setNextHighlighted] = useState(false);

  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    if (!started) return;
    setNextHighlighted(false);
    const t = setTimeout(() => setNextHighlighted(true), NEXT_HIGHLIGHT_DELAY);
    return () => clearTimeout(t);
  }, [index, started]);

  function goNext() {
    if (isLast) onFinish();
    else setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  }
  function goBack() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-4">
            EDICOM · Télécontact.ma
          </div>
          <h1 className="font-display text-[26px] font-semibold leading-tight text-white">
            Avant de finir, une petite présentation
          </h1>
          <p className="text-[14.5px] text-white/55 mt-4 leading-relaxed">
            5 diapositives courtes, à votre rythme — vous avancez quand vous êtes prêt(e).
          </p>
          <button
            onClick={() => setStarted(true)}
            className="focus-ring mt-8 rounded-xl bg-white text-ink font-medium text-[15px] px-7 py-3.5 hover:bg-white/90 transition-colors"
          >
            Commencez la présentation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-8 md:px-10">
      {/* Slide canvas — deliberately styled like an actual presentation slide, not an app screen */}
      <div
        key={index}
        className="w-full max-w-4xl aspect-video bg-white rounded-lg border border-black/10 shadow-2xl flex flex-col px-8 py-8 md:px-16 md:py-12 overflow-y-auto"
      >
        <div className="flex items-center justify-between shrink-0">
          <div className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-copper">
            EDICOM · Télécontact.ma
          </div>
          <div className="font-mono text-[10px] md:text-[11px] text-ink/35">
            {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="eqc-fade-up font-mono text-[11px] md:text-[12px] tracking-[0.1em] uppercase text-copper mb-3">
            {slide.eyebrow}
          </div>
          <h1
            className="eqc-fade-up font-display font-semibold leading-[1.15] text-ink text-[22px] md:text-[32px]"
            style={{ animationDelay: "0.08s" }}
          >
            {slide.title}
          </h1>

          {slide.body && (
            <p
              className="eqc-fade-up text-ink/75 leading-relaxed mt-5 text-[13.5px] md:text-[16px] max-w-2xl"
              style={{ animationDelay: "0.16s" }}
            >
              {slide.body}
            </p>
          )}

          {slide.intro && (
            <p
              className="eqc-fade-up text-ink/75 leading-relaxed mt-5 text-[13.5px] md:text-[16px]"
              style={{ animationDelay: "0.16s" }}
            >
              {slide.intro}
            </p>
          )}

          {slide.bullets && (
            <ul className="mt-3 space-y-2 md:space-y-2.5">
              {slide.bullets.map((b, i) => (
                <li
                  key={i}
                  className="eqc-fade-up flex items-start gap-2.5 text-[13px] md:text-[15px] text-ink/80 leading-snug"
                  style={{ animationDelay: `${0.22 + i * 0.09}s` }}
                >
                  <span className="w-1 h-1 rounded-full bg-copper mt-2 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {slide.signature && (
            <p
              className="eqc-fade-up text-copper font-display italic text-[14px] md:text-[17px] mt-6 border-l-2 border-copper pl-4"
              style={{ animationDelay: "0.4s" }}
            >
              {slide.signature}
            </p>
          )}

          {slide.closing && (
            <p
              className="eqc-fade-up font-display font-medium text-ink text-[15px] md:text-[19px] leading-snug mt-6 border-l-2 border-teal pl-4"
              style={{ animationDelay: "0.5s" }}
            >
              {slide.closing}
            </p>
          )}
        </div>
      </div>

      {/* Presenter controls — live below the slide, not on it */}
      <div className="w-full max-w-4xl flex items-center justify-center gap-2 mt-6">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Diapositive ${i + 1}`}
            className="focus-ring h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === index ? "22px" : "6px",
              backgroundColor: i === index ? "#BD8A4F" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-4xl flex items-center justify-between mt-5">
        <button
          onClick={goBack}
          disabled={isFirst}
          className="focus-ring rounded-xl border border-white/15 bg-white/5 text-[13.5px] font-medium px-4 py-2.5 text-white/70 hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition-opacity"
        >
          ← Précédent
        </button>

        <button
          onClick={goNext}
          className={
            "focus-ring rounded-xl bg-white text-ink font-medium text-[13.5px] px-5 py-2.5 hover:bg-white/90 transition-transform " +
            (nextHighlighted ? "eqc-cta-pulse" : "")
          }
        >
          {isLast ? "Continuer le test →" : "Suivant →"}
        </button>
      </div>
    </main>
  );
}
