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
  PER: "Persévérance",
  RES: "Orientation résultats",
  REL: "Aisance relationnelle",
  ORG: "Autonomie & organisation",
  PRE: "Tolérance à la pression",
};

export const FOLLOWUP_QUESTIONS: Record<string, string> = {
  PER: "Racontez-moi une situation où vous avez essuyé plusieurs refus consécutifs. Comment avez-vous rebondi ?",
  RES: "Qu'est-ce qui vous motive le plus dans un poste commercial : la stabilité ou le potentiel de gain ? Pourquoi ?",
  REL: "Décrivez-moi comment vous engagez le contact avec une personne que vous ne connaissez pas.",
  ORG: "Comment organisez-vous une semaine chargée avec plusieurs clients à relancer en parallèle ?",
  PRE: "Racontez un moment où vous avez dû gérer un client difficile ou une forte pression. Qu'avez-vous fait ?",
};

export const BEHAVIORAL_ITEMS: BehavioralItem[] = [
  { id: "per-1", dimKey: "PER", reverse: false, text: "Un refus au téléphone ne m'empêche pas de rappeler le prospect suivant avec la même énergie." },
  { id: "per-2", dimKey: "PER", reverse: true, text: "Après plusieurs refus dans la même journée, j'ai tendance à perdre en motivation." },
  { id: "per-3", dimKey: "PER", reverse: false, text: "Je vois un objectif non atteint comme un défi à relever, plutôt que comme un échec." },
  { id: "res-1", dimKey: "RES", reverse: false, text: "Je suis stimulé(e) par l'idée que mes revenus dépendent directement de mes résultats." },
  { id: "res-2", dimKey: "RES", reverse: true, text: "Je préfère un poste avec un salaire fixe stable, même si le variable est plafonné." },
  { id: "res-3", dimKey: "RES", reverse: false, text: "Atteindre un objectif chiffré me procure une vraie satisfaction personnelle." },
  { id: "rel-1", dimKey: "REL", reverse: false, text: "J'engage facilement la conversation avec une personne que je ne connais pas." },
  { id: "rel-2", dimKey: "REL", reverse: true, text: "Je préfère communiquer par écrit plutôt que par téléphone." },
  { id: "rel-3", dimKey: "REL", reverse: false, text: "Je m'adapte facilement au style de communication de mon interlocuteur." },
  { id: "org-1", dimKey: "ORG", reverse: false, text: "Je planifie ma semaine de prospection sans attendre qu'on me le demande." },
  { id: "org-2", dimKey: "ORG", reverse: true, text: "J'ai parfois du mal à prioriser quand plusieurs clients me sollicitent en même temps." },
  { id: "org-3", dimKey: "ORG", reverse: false, text: "Je tiens un suivi rigoureux de mes contacts et de mes relances." },
  { id: "pre-1", dimKey: "PRE", reverse: false, text: "Un objectif mensuel serré me motive plus qu'il ne me stresse." },
  { id: "pre-2", dimKey: "PRE", reverse: true, text: "Je peux perdre mes moyens si un client se montre agressif au téléphone." },
  { id: "pre-3", dimKey: "PRE", reverse: false, text: "Je reste efficace même quand plusieurs dossiers urgents s'accumulent en même temps." },
];

export const SJT_SCENARIOS: SjtScenario[] = [
  {
    id: "sjt-1",
    theme: "Gestion d'une objection budget/timing",
    text: "Vous présentez vos solutions de prospection B2B à un prospect. Il vous répond qu'il n'a « ni le temps ni le budget cette année ».",
    options: [
      { id: "a", text: "Vous remerciez et raccrochez pour ne pas insister.", score: 0 },
      { id: "b", text: "Vous répétez fermement les mêmes arguments jusqu'à obtenir un rendez-vous.", score: 1 },
      { id: "c", text: "Vous posez une question ouverte pour comprendre sa contrainte réelle, puis proposez de le rappeler à un moment plus opportun.", score: 3 },
      { id: "d", text: "Vous proposez immédiatement une remise de 30% pour emporter la décision.", score: 2 },
    ],
  },
  {
    id: "sjt-2",
    theme: "Franchissement du barrage secrétariat",
    text: "Depuis trois appels, un(e) assistant(e) filtre vos appels et refuse de vous passer le décideur.",
    options: [
      { id: "a", text: "Vous rappelez sans vous présenter pour éviter d'être filtré(e).", score: 1 },
      { id: "b", text: "Vous demandez son nom, instaurez une relation avec lui/elle, et demandez le meilleur moment pour joindre le décideur.", score: 3 },
      { id: "c", text: "Vous abandonnez ce prospect pour vous concentrer sur d'autres.", score: 0 },
      { id: "d", text: "Vous demandez à votre manager d'appeler à votre place.", score: 1 },
    ],
  },
  {
    id: "sjt-3",
    theme: "Traitement d'une réclamation client",
    text: "Un client existant se plaint que les contacts fournis par votre base de données B2B ne correspondent pas à sa cible.",
    options: [
      { id: "a", text: "Vous lui dites que la base est fiable et que le problème vient sûrement de son argumentaire.", score: 0 },
      { id: "b", text: "Vous écoutez sa réclamation, creusez les critères utilisés, et proposez un ajustement du ciblage avec un suivi.", score: 3 },
      { id: "c", text: "Vous transférez sa réclamation au service technique sans reformuler.", score: 1 },
      { id: "d", text: "Vous lui offrez un geste commercial immédiat sans comprendre l'origine du problème.", score: 2 },
    ],
  },
  {
    id: "sjt-4",
    theme: "Relance d'un prospect silencieux",
    text: "Après une démonstration réussie, le prospect ne répond plus à vos emails ni appels depuis deux semaines.",
    options: [
      { id: "a", text: "Vous considérez le prospect comme perdu et arrêtez de le relancer.", score: 0 },
      { id: "b", text: "Vous l'appelez tous les jours jusqu'à obtenir une réponse.", score: 1 },
      { id: "c", text: "Vous alternez les canaux (email court, appel, message) à intervalles réfléchis, avec un contenu utile à chaque fois.", score: 3 },
      { id: "d", text: "Vous attendez qu'il vous recontacte de lui-même.", score: 0 },
    ],
  },
  {
    id: "sjt-5",
    theme: "Argumentation face à la concurrence",
    text: "Un prospect compare votre offre à celle d'un concurrent moins cher.",
    options: [
      { id: "a", text: "Vous baissez immédiatement votre prix pour ne pas perdre l'affaire.", score: 1 },
      { id: "b", text: "Vous dénigrez le concurrent pour le décrédibiliser.", score: 0 },
      { id: "c", text: "Vous mettez en avant la valeur différenciante de votre offre, en lien avec les besoins précis du prospect.", score: 3 },
      { id: "d", text: "Vous répondez que « le prix, c'est le prix » et attendez sa décision.", score: 1 },
    ],
  },
  {
    id: "sjt-6",
    theme: "Redevabilité face à un objectif manqué",
    text: "Vous n'avez pas atteint votre objectif mensuel de rendez-vous qualifiés. Votre manager vous demande des explications.",
    options: [
      { id: "a", text: "Vous évoquez uniquement des facteurs externes (mauvaise période, prospects difficiles).", score: 0 },
      { id: "b", text: "Vous analysez objectivement votre activité (appels, taux de transformation) et proposez un plan d'action concret.", score: 3 },
      { id: "c", text: "Vous minimisez l'écart en disant que ce n'est pas si grave.", score: 0 },
      { id: "d", text: "Vous promettez de « faire plus d'efforts » sans détailler comment.", score: 1 },
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
