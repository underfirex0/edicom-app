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
  note?: string; // shown to the recruiter when this option is chosen and scores low
}

export interface SjtScenario {
  id: string;
  theme: string;
  text: string;
  options: SjtOption[];
}

export const DIMENSION_LABELS: Record<string, string> = {
  RES: "Orientation résultats",
  ORG: "Rigueur & suivi commercial",
  PER: "Persévérance & maîtrise de soi",
  ECO: "Écoute & compréhension client",
  CONF: "Relation de confiance",
};

export const ITEM_FOLLOWUPS: Record<string, string> = {
  "res-1": "Comment vous fixez-vous vos objectifs personnels quand personne ne vous les impose ?",
  "res-2": "Qu'est-ce qui vous pousse à avancer un jour où aucun chiffre ne vous est demandé ?",
  "res-3": "Qu'est-ce qui vous fait le plus vibrer : une bonne visite ou un contrat signé ? Pourquoi ?",
  "org-1": "Montrez-moi comment vous notez une visite juste après l'avoir terminée.",
  "org-2": "Racontez une fois où vous avez perdu la trace d'un prospect faute de note. Qu'avez-vous changé depuis ?",
  "org-3": "Comment calculez-vous votre taux de transformation visite → contrat ?",
  "per-1": "Racontez un refus qui vous a particulièrement marqué. Comment avez-vous rebondi juste après ?",
  "per-2": "Après plusieurs refus d'affilée, comment retrouvez-vous votre énergie ?",
  "per-3": "Comment expliquez-vous les échecs à vous-même, sur le moment ?",
  "eco-1": "Donnez-moi un exemple de question que vous posez systématiquement avant de présenter une offre.",
  "eco-2": "Racontez une fois où vous avez présenté une offre trop vite, avant d'avoir bien compris le besoin du client.",
  "eco-3": "Comment vérifiez-vous que vous avez bien compris ce qu'un client vient de vous dire ?",
  "conf-1": "Comment gagnez-vous la confiance d'un prospect dès la première visite ?",
  "conf-2": "Racontez une situation où vous avez dû choisir entre pousser une vente et préserver la relation.",
  "conf-3": "Racontez une fois où vous avez préféré dire non ou reporter, plutôt que de faire une fausse promesse.",
};

export const FOLLOWUP_QUESTIONS: Record<string, string> = {
  RES: "Racontez-moi comment vous fixez vos objectifs personnels sur une semaine de terrain.",
  ORG: "Montrez-moi comment vous suivez vos visites et vos relances au quotidien (méthode, outil).",
  PER: "Racontez une série de refus qui vous a marqué(e). Comment avez-vous géré ça sur le moment ?",
  ECO: "Racontez-moi la dernière fois où vous avez changé votre offre après avoir vraiment écouté un client.",
  CONF: "Comment construisez-vous la confiance avec un prospect que vous rencontrez pour la première fois ?",
};

export const BEHAVIORAL_ITEMS: BehavioralItem[] = [
  { id: "res-1", dimKey: "RES", reverse: false, text: "Je me fixe des objectifs personnels précis chaque semaine, même quand mon manager ne me le demande pas." },
  { id: "res-2", dimKey: "RES", reverse: true, text: "Tant qu'aucun chiffre ne m'est imposé, je n'éprouve pas vraiment le besoin de me fixer un objectif." },
  { id: "res-3", dimKey: "RES", reverse: false, text: "Signer un contrat me motive davantage que le simple fait d'avoir fait de bonnes visites." },
  { id: "org-1", dimKey: "ORG", reverse: false, text: "Je note systématiquement chaque visite et chaque relance dans un carnet ou un outil de suivi." },
  { id: "org-2", dimKey: "ORG", reverse: true, text: "Il m'arrive de perdre la trace d'un prospect parce que je n'ai rien noté après la visite." },
  { id: "org-3", dimKey: "ORG", reverse: false, text: "Je sais dire, à la fin du mois, combien de mes rendez-vous se sont transformés en contrats." },
  { id: "per-1", dimKey: "PER", reverse: false, text: "Un refus ne m'empêche pas de rester positif(ve) pour le rendez-vous suivant." },
  { id: "per-2", dimKey: "PER", reverse: true, text: "Après plusieurs refus d'affilée, j'ai du mal à garder mon calme et mon enthousiasme." },
  { id: "per-3", dimKey: "PER", reverse: false, text: "Je considère les échecs comme une étape normale du métier, pas comme un signe que je ne suis pas fait(e) pour ça." },
  { id: "eco-1", dimKey: "ECO", reverse: false, text: "Avant de présenter une offre, je préfère poser des questions pour comprendre ce dont le client a vraiment besoin." },
  { id: "eco-2", dimKey: "ECO", reverse: true, text: "Je préfère présenter tout de suite mon offre plutôt que de poser trop de questions à un client." },
  { id: "eco-3", dimKey: "ECO", reverse: false, text: "Il m'arrive de reformuler ce qu'un client vient de dire, pour être sûr(e) d'avoir bien compris." },
  { id: "conf-1", dimKey: "CONF", reverse: false, text: "Je pense qu'un client doit d'abord me faire confiance avant même de considérer mon offre." },
  { id: "conf-2", dimKey: "CONF", reverse: true, text: "Je me concentre surtout sur mon argumentaire de vente, plus que sur la relation avec le client." },
  { id: "conf-3", dimKey: "CONF", reverse: false, text: "Je préfère perdre une vente plutôt que de promettre quelque chose que je ne suis pas sûr(e) de pouvoir tenir." },
];

export const SJT_SCENARIOS: SjtScenario[] = [
  {
    id: "sjt-1",
    theme: "Documentation après une tournée",
    text: "Vous rentrez d'une journée de tournée avec cinq nouvelles visites effectuées. Il est tard et vous êtes fatigué(e).",
    options: [
      { id: "a", text: "Vous rentrez vous reposer et comptez ressaisir vos notes de mémoire le lendemain.", score: 1, note: "Reporter la prise de notes fait perdre des détails utiles pour la relance." },
      { id: "b", text: "Vous prenez dix minutes avant de rentrer pour noter chaque visite (contact, besoin, prochaine étape) pendant que c'est encore frais.", score: 3 },
      { id: "c", text: "Vous notez juste les noms des entreprises visitées, sans autre détail.", score: 1, note: "Une note minimaliste ne permet pas une relance méthodique par la suite." },
      { id: "d", text: "Vous ne notez rien, vous vous souvenez toujours de l'essentiel.", score: 0, note: "Aucune trace écrite — risque réel d'oubli et de relance mal préparée." },
    ],
  },
  {
    id: "sjt-2",
    theme: "Suivi de son objectif en cours de mois",
    text: "On est à la moitié du mois et vous constatez que vous êtes en retard sur votre objectif de nouveaux contrats.",
    options: [
      { id: "a", text: "Vous attendez la fin du mois pour voir où vous en êtes réellement.", score: 0, note: "Attendre la fin du mois ne laisse plus le temps de corriger le tir." },
      { id: "b", text: "Vous analysez ce qui a fonctionné ou non cette quinzaine, et ajustez votre plan pour la suite du mois.", score: 3 },
      { id: "c", text: "Vous décidez de travailler plus d'heures, sans changer votre approche.", score: 1, note: "Plus d'heures sans ajuster la méthode traite le symptôme, pas la cause." },
      { id: "d", text: "Vous vous dites que le mois prochain sera meilleur.", score: 0, note: "Aucune action corrective — signal faible d'orientation résultat." },
    ],
  },
  {
    id: "sjt-3",
    theme: "Une série de refus dans la même matinée",
    text: "Vous essuyez quatre refus consécutifs en une matinée de prospection terrain.",
    options: [
      { id: "a", text: "Vous continuez votre tournée avec la même énergie pour le prospect suivant.", score: 3 },
      { id: "b", text: "Vous faites une pause plus longue que prévu pour « décompresser » avant de continuer.", score: 2 },
      { id: "c", text: "Vous écourtez votre tournée de l'après-midi, découragé(e).", score: 0, note: "Laisser la déception raccourcir sa tournée réduit directement ses chances du jour." },
      { id: "d", text: "Vous changez de secteur en pensant que le problème vient de la zone, pas de votre approche.", score: 1, note: "Change de terrain sans remettre en question sa propre approche." },
    ],
  },
  {
    id: "sjt-4",
    theme: "Un prospect pressé demande l'offre tout de suite",
    text: "Un prospect vous reçoit et vous dit d'emblée : « Présentez-moi vite votre meilleure offre, je n'ai que cinq minutes. »",
    options: [
      { id: "a", text: "Vous lui présentez immédiatement votre offre la plus chère, pour ne pas perdre de temps.", score: 1, note: "Pousse une offre sans avoir vérifié qu'elle correspond au besoin réel." },
      { id: "b", text: "Vous prenez une minute pour comprendre son activité et son besoin réel, puis vous adaptez votre offre en conséquence.", score: 3 },
      { id: "c", text: "Vous récitez votre argumentaire standard, sans l'adapter à la situation.", score: 1, note: "Argumentaire non adapté — l'écoute du besoin réel passe après le discours préparé." },
      { id: "d", text: "Vous proposez de revenir un autre jour où il aura plus de temps.", score: 0, note: "Repousse l'échange au lieu de s'adapter à la contrainte du client — occasion perdue." },
    ],
  },
  {
    id: "sjt-5",
    theme: "La tentation de la promesse facile",
    text: "Pour convaincre un prospect hésitant, vous pourriez lui promettre un délai de mise en ligne plus rapide que ce que votre entreprise garantit habituellement.",
    options: [
      { id: "a", text: "Vous le faites : l'important est de signer, vous verrez ensuite.", score: 0, note: "Promesse non tenable — la confiance du client sera rompue à la livraison." },
      { id: "b", text: "Vous restez honnête sur les délais réels, quitte à perdre la vente ce jour-là.", score: 3 },
      { id: "c", text: "Vous restez vague sur les délais pour ne pas fermer la porte.", score: 1, note: "Le flou entretient un malentendu qui abîmera la relation plus tard." },
      { id: "d", text: "Vous promettez le délai rapide, mais prévenez votre manager après coup.", score: 1, note: "La promesse est faite avant même d'avoir vérifié qu'elle est tenable." },
    ],
  },
  {
    id: "sjt-6",
    theme: "Redevabilité face à un objectif terrain manqué",
    text: "Vous n'avez pas atteint votre objectif mensuel de nouveaux contrats signés sur le terrain. Votre manager vous demande des explications.",
    options: [
      { id: "a", text: "Vous évoquez uniquement des facteurs externes (secteur difficile, mauvaise période).", score: 0, note: "Externalise entièrement la responsabilité — aucune analyse de sa propre activité ni plan d'action proposé." },
      { id: "b", text: "Vous analysez objectivement votre activité terrain (nombre de visites, taux de transformation) et proposez un plan d'action concret.", score: 3 },
      { id: "c", text: "Vous minimisez l'écart en disant que ce n'est pas si grave.", score: 0, note: "Minimise l'objectif manqué au lieu d'en tirer des enseignements — signal faible de redevabilité." },
      { id: "d", text: "Vous promettez de « faire plus de visites » sans détailler comment.", score: 1, note: "Bonne intention affichée mais sans plan concret ni indicateurs — à challenger en entretien." },
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

  const weakItems: string[] = [];
  for (const ans of behavAnswers) {
    const item = BEHAVIORAL_ITEMS.find((b) => b.id === ans.id);
    if (!item) continue;
    const val = item.reverse ? 6 - ans.val : ans.val;
    dimTotals[item.dimKey].sum += val;
    dimTotals[item.dimKey].n += 1;
    if (val <= 2) weakItems.push(item.id);
  }

  const dims: DimensionScore[] = Object.entries(dimTotals).map(([key, v]) => ({
    key,
    label: DIMENSION_LABELS[key],
    pct: v.n ? Math.round((v.sum / (v.n * 5)) * 100) : 0,
  }));
  const behavAvg = Math.round(dims.reduce((a, d) => a + d.pct, 0) / dims.length);

  let sjtScore = 0;
  const weakScenarios: { theme: string; text: string; score: number; note?: string }[] = [];
  for (const ans of sjtAnswers) {
    const scenario = SJT_SCENARIOS.find((s) => s.id === ans.id);
    if (!scenario) continue;
    const opt = scenario.options.find((o) => o.id === ans.optionId);
    if (!opt) continue;
    sjtScore += opt.score;
    if (opt.score <= 1) {
      weakScenarios.push({ theme: scenario.theme, text: opt.text, score: opt.score, note: opt.note });
    }
  }
  const sjtTotal = SJT_SCENARIOS.length * 3;
  const sjtPct = Math.round((sjtScore / sjtTotal) * 100);

  const globalScore = Math.round(behavAvg * config.behavWeight + sjtPct * config.sjtWeight);
  let recommendation: Recommendation = "risk";
  if (globalScore >= config.thresholdGood) recommendation = "good";
  else if (globalScore >= config.thresholdWatch) recommendation = "watch";

  const weakDims = dims.filter((d) => d.pct < 50).map((d) => d.key);

  return { dims, behavAvg, sjtScore, sjtTotal, globalScore, recommendation, weakDims, weakItems, weakScenarios };
}
