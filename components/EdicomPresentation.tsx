"use client";

import { useEffect, useState } from "react";
import { NetworkIllustration, RadarIllustration, JourneyIllustration, solutionIcon, IconHome, IconMap, IconGlobe } from "./PresentationIcons";

type Layout = "intro" | "solutions" | "welcome" | "journey" | "closing";

interface Slide {
  layout: Layout;
  eyebrow: string;
  title: string;
  stat?: { value: number; suffix: string; label: string };
  bullets?: string[];
  solutions?: string[];
  tiers?: { label: string; icon: "home" | "map" | "globe" }[];
  signature?: string;
  closing?: string;
  dark: boolean;
}

const SLIDES: Slide[] = [
  {
    layout: "intro",
    dark: true,
    eyebrow: "Présentation",
    title: "Telecontact.ma",
    stat: { value: 36, suffix: " ans", label: "d'expertise et de collecte d'informations professionnelles" },
    bullets: [
      "275 000 entreprises marocaines actives réunies sur une seule plateforme.",
      "Un accès rapide pour toute personne qui recherche un professionnel ou un service, dans une ville ou partout au Maroc.",
      "Des informations fiables, grâce à une mise à jour régulière.",
    ],
    signature: "Telecontact.ma, le point de départ de toute entreprise qui veut se rendre visible et capter des opportunités d'affaires.",
  },
  {
    layout: "intro",
    dark: true,
    eyebrow: "Présentation",
    title: "Telecontact.ma",
    stat: { value: 20000, suffix: "+", label: "recherches par jour dans Telecontact.ma" },
    bullets: [
      "Un outil conçu pour accélérer la crédibilité et le développement commercial des entreprises.",
      "Afficher les professionnels au bon moment, quand un utilisateur cherche celui qui répond à son besoin.",
    ],
    signature: "Telecontact.ma, le point de départ de toute entreprise qui veut se rendre visible et capter des opportunités d'affaires.",
  },
  {
    layout: "solutions",
    dark: false,
    eyebrow: "Nos solutions",
    title: "Bien plus qu'un annuaire : un accélérateur de croissance",
    solutions: [
      "Recherche multicritère (national, ville, secteur d'activité, mot-clé, service, marque, produit, téléphone, ICE)",
      "Identification des décideurs, chiffre d'affaires, effectif…",
      "Génération de prospects ou fournisseurs qualifiés",
      "Prise de rendez-vous commerciaux",
      "CRM et solutions de pilotage commercial",
    ],
    closing: "Avec Telecontact.ma, les données deviennent des opportunités commerciales concrètes.",
  },
  {
    layout: "welcome",
    dark: false,
    eyebrow: "Bienvenue",
    title: "Bienvenue dans l'aventure Telecontact.ma",
    bullets: [
      "Vous connaissez déjà la plateforme qui aide à trouver rapidement des entreprises et des professionnels fiables.",
      "Aujourd'hui, votre mission est de porter cette plateforme auprès des entreprises marocaines.",
      "Votre objectif : aider chaque professionnel à se rendre plus visible, attirer de nouveaux clients, et développer son activité grâce à nos services.",
    ],
    closing: "Avec Telecontact.ma, les données deviennent des opportunités commerciales concrètes.",
  },
  {
    layout: "journey",
    dark: false,
    eyebrow: "Votre mission",
    title: "Votre mission de conseiller digital",
    bullets: [
      "Votre rôle est de prospecter, rencontrer des professionnels, enrichir votre portefeuille avec votre réseau et vos découvertes sur le terrain.",
      "Comprendre les besoins, et présenter les solutions Telecontact.ma adaptées.",
      "Chaque visite est une opportunité de créer de la valeur pour le client.",
    ],
    closing: "Avec Telecontact.ma, les données deviennent des opportunités commerciales concrètes.",
  },
  {
    layout: "closing",
    dark: true,
    eyebrow: "Votre réussite",
    title: "Proposer la bonne solution",
    bullets: [
      "Votre réussite repose sur votre capacité à écouter, conseiller et recommander la formule qui permettra au client de développer son chiffre d'affaires.",
      "Votre mission n'est pas seulement de vendre, mais d'accompagner les entreprises dans leur développement.",
    ],
    tiers: [
      { label: "Visibilité locale", icon: "home" },
      { label: "Couverture régionale ou multirégionale", icon: "map" },
      { label: "Présence nationale", icon: "globe" },
    ],
    closing: "Ensemble, faisons de chaque rendez-vous une nouvelle opportunité de croissance.",
  },
];

const NEXT_HIGHLIGHT_DELAY = 2200;

function AnimatedCounter({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const start = performance.now();
    const duration = 1200;
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
  return <>{n.toLocaleString("fr-FR")}</>;
}

const TIER_ICONS = { home: IconHome, map: IconMap, globe: IconGlobe };

export default function EdicomPresentation({ onFinish }: { onFinish: () => void }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
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
    if (isLast) { onFinish(); return; }
    setDirection(1);
    setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  }
  function goBack() {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  }
  function jump(i: number) {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  }

  const animClass = direction === 1 ? "eqc-slide-in-right" : "eqc-slide-in-left";
  const titleColor = slide.dark ? "text-white" : "text-ink";
  const bodyColor = slide.dark ? "text-white/70" : "text-ink/75";

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
            6 diapositives courtes, à votre rythme — vous avancez quand vous êtes prêt(e).
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
      <div
        key={index}
        className={
          "w-full max-w-5xl aspect-video rounded-lg border shadow-2xl flex flex-col px-8 py-7 md:px-14 md:py-10 overflow-y-auto relative " +
          (slide.dark ? "bg-ink border-white/10" : "bg-white border-black/10")
        }
      >
        <div className="flex items-center justify-between shrink-0 relative z-10">
          <div className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-copper">
            EDICOM · Télécontact.ma
          </div>
          <div className={"font-mono text-[10px] md:text-[11px] " + (slide.dark ? "text-white/35" : "text-ink/35")}>
            {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </div>
        </div>

        {/* ---------- INTRO layout (slides 1-2): split text + illustration ---------- */}
        {slide.layout === "intro" && (
          <div className={"flex-1 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-center " + animClass}>
            <div>
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-2">{slide.eyebrow}</div>
              <h1 className={"font-display font-semibold leading-[1.1] text-[24px] md:text-[32px] " + titleColor}>
                {slide.title}
              </h1>
              {slide.stat && (
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display font-semibold text-copper text-[42px] md:text-[52px] leading-none">
                    <AnimatedCounter value={slide.stat.value} />
                    {slide.stat.suffix}
                  </span>
                </div>
              )}
              {slide.stat && <p className={"text-[12px] md:text-[13px] mt-1 " + bodyColor}>{slide.stat.label}</p>}
              <ul className="mt-4 space-y-2">
                {slide.bullets?.map((b, i) => (
                  <li key={i} className={"flex items-start gap-2.5 text-[13px] md:text-[14.5px] leading-snug " + bodyColor}>
                    <span className="w-1 h-1 rounded-full bg-copper mt-2 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              {slide.signature && (
                <p className="text-copper font-display italic text-[13px] md:text-[15.5px] mt-5 border-l-2 border-copper pl-3.5 leading-snug">
                  {slide.signature}
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center justify-center eqc-float">
              <div className="w-full max-w-[240px]">
                {index === 0 ? <NetworkIllustration /> : <RadarIllustration />}
              </div>
            </div>
          </div>
        )}

        {/* ---------- SOLUTIONS layout (slide 3) ---------- */}
        {slide.layout === "solutions" && (
          <div className={"flex-1 flex flex-col " + animClass}>
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-2">{slide.eyebrow}</div>
            <h1 className="font-display font-semibold leading-[1.15] text-ink text-[20px] md:text-[27px]">{slide.title}</h1>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {slide.solutions?.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 eqc-fade-up"
                  style={{ animationDelay: `${0.15 + i * 0.1}s` }}
                >
                  <span className="w-9 h-9 rounded-full bg-copper flex items-center justify-center shrink-0">
                    {solutionIcon(i, "#FFFFFF")}
                  </span>
                  <span className="text-[13px] md:text-[14.5px] text-ink/80 leading-snug pt-1.5">{s}</span>
                </div>
              ))}
            </div>
            {slide.closing && (
              <p className="font-display italic font-semibold text-teal text-[14px] md:text-[17px] mt-auto pt-4">
                {slide.closing}
              </p>
            )}
          </div>
        )}

        {/* ---------- WELCOME layout (slide 4): centered flowing text ---------- */}
        {slide.layout === "welcome" && (
          <div className={"flex-1 flex flex-col justify-center max-w-2xl mx-auto text-center " + animClass}>
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-3">{slide.eyebrow}</div>
            <h1 className="font-display font-semibold leading-[1.15] text-ink text-[22px] md:text-[30px]">{slide.title}</h1>
            <div className="mt-5 space-y-3">
              {slide.bullets?.map((b, i) => (
                <p key={i} className="text-ink/75 text-[13.5px] md:text-[16px] leading-relaxed">
                  {b}
                </p>
              ))}
            </div>
            {slide.closing && (
              <p className="font-display italic font-semibold text-teal text-[14px] md:text-[16.5px] mt-6">{slide.closing}</p>
            )}
          </div>
        )}

        {/* ---------- JOURNEY layout (slide 5): split text + animated path ---------- */}
        {slide.layout === "journey" && (
          <div className={"flex-1 grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-6 items-center " + animClass}>
            <div>
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-2">{slide.eyebrow}</div>
              <h1 className="font-display font-semibold leading-[1.15] text-ink text-[22px] md:text-[28px]">{slide.title}</h1>
              <ul className="mt-4 space-y-2.5">
                {slide.bullets?.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] md:text-[14.5px] leading-snug text-ink/75">
                    <span className="w-1 h-1 rounded-full bg-teal mt-2 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              {slide.closing && (
                <p className="font-display italic font-semibold text-teal text-[13px] md:text-[15px] mt-4">{slide.closing}</p>
              )}
            </div>
            <div className="hidden md:block">
              <JourneyIllustration />
            </div>
          </div>
        )}

        {/* ---------- CLOSING layout (slide 6) ---------- */}
        {slide.layout === "closing" && (
          <div className={"flex-1 flex flex-col " + animClass}>
            <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-copper mb-2">{slide.eyebrow}</div>
            <h1 className="font-display font-semibold leading-[1.15] text-white text-[22px] md:text-[29px]">{slide.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              {slide.tiers?.map((t, i) => {
                const Icon = TIER_ICONS[t.icon];
                return (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 eqc-fade-up"
                    style={{ animationDelay: `${0.15 + i * 0.1}s` }}
                  >
                    <span className="w-9 h-9 rounded-full bg-copper flex items-center justify-center mb-2.5">
                      <Icon color="#211E1A" />
                    </span>
                    <div className="text-white text-[12.5px] md:text-[13.5px] font-medium leading-snug">{t.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2">
              {slide.bullets?.map((b, i) => (
                <p key={i} className="text-white/65 text-[12.5px] md:text-[14px] leading-relaxed">
                  {b}
                </p>
              ))}
            </div>

            {slide.closing && (
              <p className="font-display font-semibold italic text-white text-[16px] md:text-[20px] leading-snug mt-auto pt-4 border-l-2 border-teal pl-4">
                {slide.closing}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl flex items-center justify-center gap-2 mt-6">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => jump(i)}
            aria-label={`Diapositive ${i + 1}`}
            className="focus-ring h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === index ? "22px" : "6px",
              backgroundColor: i === index ? "#BD8A4F" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-5xl flex items-center justify-between mt-5">
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
