// Canonical question bank + server-side scoring.
// IMPORTANT: option/statement "scores" live only here (server side).
// Client components only ever receive text — never point values —
// so the correct answer can't be read from the page source or network tab.

import "server-only";
import type { DimensionScore, ResultsSummary, Recommendation } from "@/lib/types";

export interface BehavioralItem {
  id: string;
  dimKey: string;
  text: string;
  reverse: boolean;
}

export interface SjtOption {
  id: string;
  text: string;
  score: number; // 0-3
}

export interface SjtScenario {
  id: string;
  theme: string;
  text: string;
  options: SjtOption[];
}

export const DIMENSION_LABELS: Record<string, string> = {
  PER: "Persévérance terrain",
  RES: "Orientation résultats",
  REL: "Présence & aisance en face à face",
  ORG: "Organisation de tournée & autonomie",
  PRE: "Résistance à la pression du terrain",
};

export const FOLLOWUP_QUESTIONS: Record<string, string> = {
  PER: "Racontez-moi une tournée où vous êtes reparti(e) bredouille de plusieurs visites d'affilée. Comment avez-vous rebondi ?",
  RES: "Qu'est-ce qui vous motive le plus dans un poste terrain : la stabilité ou le potentiel de gain lié aux contrats signés ? Pourquoi ?",
  REL: "Décrivez-moi comment vous vous présentez à l'accueil d'une entreprise que vous visitez pour la première fois, sans rendez-vous.",
  ORG: "Comment organisez-vous votre tournée de la semaine pour optimiser vos déplacements et vos rendez-vous sur un secteur géographique donné ?",
  PRE: "Racontez-moi une journée de terrain particulièrement éprouvante (retards, refus en face à face, annulations). Comment avez-vous géré ça ?",
};

export const BEHAVIORAL_ITEMS: BehavioralItem[] = [
  { id: "per-1", dimKey: "PER", reverse: false, text: "Trouver porte close ou décideur absent lors d'une visite ne m'empêche pas de revenir ou de reprogrammer un rendez-vous." },
  { id: "per-2", dimKey: "PER", reverse: true, text: "Après plusieurs visites infructueuses dans la même journée, j'ai tendance à écourter ma tournée et perdre en énergie." },
  { id: "per-3", dimKey: "PER", reverse: false, text: "Un rendez-vous annulé au dernier moment est pour moi l'occasion de démarcher un autre prospect du secteur, pas un temps perdu." },
  { id: "res-1", dimKey: "RES", reverse: false, text: "Je suis stimulé(e) par l'idée que mes revenus dépendent directement des contrats que je signe sur le terrain." },
  { id: "res-2", dimKey: "RES", reverse: true, text: "Je préfère un poste avec un salaire fixe stable, même si le variable lié aux ventes est plafonné." },
  { id: "res-3", dimKey: "RES", reverse: false, text: "Signer un contrat après plusieurs visites me procure une vraie satisfaction personnelle." },
  { id: "rel-1", dimKey: "REL", reverse: false, text: "Je me sens à l'aise pour me présenter à l'accueil d'une entreprise que je visite pour la première fois, sans rendez-vous pris à l'avance." },
  { id: "rel-2", dimKey: "REL", reverse: true, text: "Je suis plus efficace pour convaincre par écrit ou par téléphone qu'en face à face." },
  { id: "rel-3", dimKey: "REL", reverse: false, text: "J'ajuste facilement mon discours selon la personne que j'ai en face de moi (gérant, standardiste, acheteur…)." },
  { id: "org-1", dimKey: "ORG", reverse: false, text: "Je planifie mon itinéraire de visites de la semaine pour optimiser mes déplacements, sans qu'on me le demande." },
  { id: "org-2", dimKey: "ORG", reverse: true, text: "Il m'arrive de partir en tournée sans avoir préparé mes dossiers ou vérifié mes rendez-vous à l'avance." },
  { id: "org-3", dimKey: "ORG", reverse: false, text: "Je tiens un compte-rendu à jour de chaque visite pour suivre mes prospects et mes relances." },
  { id: "pre-1", dimKey: "PRE", reverse: false, text: "De longues journées de déplacement avec plusieurs rendez-vous consécutifs ne m'épuisent pas mentalement." },
  { id: "pre-2", dimKey: "PRE", reverse: true, text: "Un accueil froid ou un refus en face à face m'affecte davantage qu'un refus par téléphone ou par écrit." },
  { id: "pre-3", dimKey: "PRE", reverse: false, text: "Je reste professionnel(le) et courtois(e) même après une journée de tournée difficile (retards, annulations, refus)." },
];

export const SJT_SCENARIOS: SjtScenario[] = [
  {
    id: "sjt-1",
    theme: "Rendez-vous manqué sur le terrain",
    text: "Vous arrivez à un rendez-vous programmé chez un prospect, mais le décideur est absent (parti en réunion imprévue).",
    options: [
      { id: "a", text: "Vous repartez et retentez de le joindre un autre jour par téléphone.", score: 1 },
      { id: "b", text: "Vous attendez plusieurs heures sur place jusqu'à son retour, quitte à annuler vos autres rendez-vous du jour.", score: 0 },
      { id: "c", text: "Vous échangez avec un autre interlocuteur disponible sur place, reprogrammez un nouveau rendez-vous avec le décideur, et poursuivez votre tournée.", score: 3 },
      { id: "d", text: "Vous laissez votre carte de visite à l'accueil et partez sans chercher à en savoir plus.", score: 1 },
    ],
  },
  {
    id: "sjt-2",
    theme: "Franchissement de l'accueil en visite spontanée",
    text: "Vous vous présentez à la réception d'une entreprise pour une prospection physique sans rendez-vous. La personne à l'accueil refuse de vous laisser rencontrer le décideur.",
    options: [
      { id: "a", text: "Vous insistez fermement pour voir le décideur immédiatement.", score: 1 },
      { id: "b", text: "Vous vous présentez brièvement, expliquez l'objet de votre visite avec courtoisie, laissez une plaquette, et demandez le meilleur moment pour être reçu.", score: 3 },
      { id: "c", text: "Vous repartez sans rien laisser ni chercher à comprendre.", score: 0 },
      { id: "d", text: "Vous demandez à l'accueil les coordonnées personnelles du décideur pour le contacter autrement.", score: 1 },
    ],
  },
  {
    id: "sjt-3",
    theme: "Argumentation face à la concurrence, en rendez-vous",
    text: "Lors d'un rendez-vous en face à face, le prospect sort le devis d'un concurrent moins cher et vous demande pourquoi choisir EDICOM.",
    options: [
      { id: "a", text: "Vous baissez immédiatement votre prix pour ne pas perdre l'affaire.", score: 1 },
      { id: "b", text: "Vous dénigrez le concurrent pour le décrédibiliser.", score: 0 },
      { id: "c", text: "Vous mettez en avant, avec des exemples concrets, la valeur différenciante de votre offre en lien avec ses besoins précis.", score: 3 },
      { id: "d", text: "Vous répondez que « le prix, c'est le prix » et attendez sa décision.", score: 1 },
    ],
  },
  {
    id: "sjt-4",
    theme: "Gestion du temps sur une tournée",
    text: "Votre rendez-vous précédent s'éternise et vous savez que vous allez être en retard pour votre prochain rendez-vous physique.",
    options: [
      { id: "a", text: "Vous écourtez brutalement l'entretien en cours sans prévenir, pour filer au rendez-vous suivant.", score: 1 },
      { id: "b", text: "Vous prévenez rapidement le prochain prospect de votre retard, tout en clôturant proprement l'entretien en cours.", score: 3 },
      { id: "c", text: "Vous annulez le rendez-vous suivant sans prévenir personne.", score: 0 },
      { id: "d", text: "Vous restez concentré sur l'entretien en cours et laissez le prochain prospect sans nouvelles jusqu'à votre arrivée.", score: 1 },
    ],
  },
  {
    id: "sjt-5",
    theme: "Traitement d'une réclamation lors d'une visite de suivi",
    text: "Lors d'une visite de suivi chez un client existant, celui-ci se plaint que les contacts fournis par votre base de données B2B ne correspondaient pas à sa cible.",
    options: [
      { id: "a", text: "Vous lui dites que la base est fiable et que le problème vient sûrement de son argumentaire.", score: 0 },
      { id: "b", text: "Vous écoutez sa réclamation sur place, creusez les critères utilisés, et proposez un ajustement du ciblage avec un suivi.", score: 3 },
      { id: "c", text: "Vous notez sa réclamation pour la transférer au service technique sans reformuler ni creuser.", score: 1 },
      { id: "d", text: "Vous lui offrez un geste commercial immédiat sans comprendre l'origine du problème.", score: 2 },
    ],
  },
  {
    id: "sjt-6",
    theme: "Redevabilité face à un objectif terrain manqué",
    text: "Vous n'avez pas atteint votre objectif mensuel de nouveaux contrats signés sur le terrain. Votre manager vous demande des explications.",
    options: [
      { id: "a", text: "Vous évoquez uniquement des facteurs externes (secteur difficile, mauvaise période).", score: 0 },
      { id: "b", text: "Vous analysez objectivement votre activité terrain (nombre de visites, taux de transformation) et proposez un plan d'action concret.", score: 3 },
      { id: "c", text: "Vous minimisez l'écart en disant que ce n'est pas si grave.", score: 0 },
      { id: "d", text: "Vous promettez de « faire plus de visites » sans détailler comment.", score: 1 },
    ],
  },
];

export function getPublicQuestions() {
  return {
    behavioral: BEHAVIORAL_ITEMS.map((b) => ({ id: b.id, text: b.text })),
    sjt: SJT_SCENARIOS.map((s) => ({
      id: s.id,
      theme: s.theme,
      text: s.text,
      options: s.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}

export interface ScoringConfig {
  behavWeight: number;
  sjtWeight: number;
  thresholdGood: number;
  thresholdWatch: number;
}

export const DEFAULT_CONFIG: ScoringConfig = {
  behavWeight: 0.45,
  sjtWeight: 0.55,
  thresholdGood: 75,
  thresholdWatch: 55,
};

export function computeResults(
  behavAnswers: { id: string; val: number }[],
  sjtAnswers: { id: string; optionId: string }[],
  config: ScoringConfig = DEFAULT_CONFIG
): ResultsSummary {
  const dimTotals: Record<string, { sum: number; n: number }> = {};
  for (const key of Object.keys(DIMENSION_LABELS)) dimTotals[key] = { sum: 0, n: 0 };

  for (const ans of behavAnswers) {
    const item = BEHAVIORAL_ITEMS.find((b) => b.id === ans.id);
    if (!item) continue;
    const val = item.reverse ? 6 - ans.val : ans.val;
    dimTotals[item.dimKey].sum += val;
    dimTotals[item.dimKey].n += 1;
  }

  const dims: DimensionScore[] = Object.entries(dimTotals).map(([key, v]) => ({
    key,
    label: DIMENSION_LABELS[key],
    pct: v.n ? Math.round((v.sum / (v.n * 5)) * 100) : 0,
  }));
  const behavAvg = Math.round(dims.reduce((a, d) => a + d.pct, 0) / dims.length);

  let sjtScore = 0;
  const weakScenarios: { theme: string; text: string; score: number }[] = [];
  for (const ans of sjtAnswers) {
    const scenario = SJT_SCENARIOS.find((s) => s.id === ans.id);
    if (!scenario) continue;
    const opt = scenario.options.find((o) => o.id === ans.optionId);
    if (!opt) continue;
    sjtScore += opt.score;
    if (opt.score <= 1) {
      weakScenarios.push({ theme: scenario.theme, text: opt.text, score: opt.score });
    }
  }
  const sjtTotal = SJT_SCENARIOS.length * 3;
  const sjtPct = Math.round((sjtScore / sjtTotal) * 100);

  const globalScore = Math.round(behavAvg * config.behavWeight + sjtPct * config.sjtWeight);
  let recommendation: Recommendation = "risk";
  if (globalScore >= config.thresholdGood) recommendation = "good";
  else if (globalScore >= config.thresholdWatch) recommendation = "watch";

  const weakDims = dims.filter((d) => d.pct < 50).map((d) => d.key);

  return { dims, behavAvg, sjtScore, sjtTotal, globalScore, recommendation, weakDims, weakScenarios };
}
