import "server-only";
import { BEHAVIORAL_ITEMS, SJT_SCENARIOS } from "@/lib/scoring";
import type { CandidateRecord } from "@/lib/admin-data";

export interface AiBriefResult {
  synthesis: string;
  questions: string[];
}

const LIKERT_LABELS: Record<number, string> = {
  1: "Pas du tout d'accord",
  2: "Plutôt pas d'accord",
  3: "Neutre",
  4: "Plutôt d'accord",
  5: "Tout à fait d'accord",
};

function buildPrompt(candidate: CandidateRecord): string {
  const r = candidate.result!;

  const behavLines = r.behavioralAnswers
    .map((a) => {
      const item = BEHAVIORAL_ITEMS.find((b) => b.id === a.id);
      if (!item) return null;
      return `- "${item.text}" → réponse du candidat : ${LIKERT_LABELS[a.val] ?? a.val}`;
    })
    .filter(Boolean)
    .join("\n");

  const sjtLines = r.sjtAnswers
    .map((a) => {
      const scenario = SJT_SCENARIOS.find((s) => s.id === a.id);
      const opt = scenario?.options.find((o) => o.id === a.optionId);
      if (!scenario || !opt) return null;
      return `- Situation : ${scenario.text}\n  Réponse choisie : "${opt.text}"`;
    })
    .filter(Boolean)
    .join("\n");

  const dimLines = (r.dims ?? []).map((d) => `${d.label} : ${d.pct}%`).join(", ");

  const appInfo = r.applicationInfo;
  const backgroundBlock =
    appInfo?.background && appInfo?.motivation
      ? `PARCOURS PROFESSIONNEL :
Dernier poste : ${appInfo.background.lastPosition} chez ${appInfo.background.company} (${appInfo.background.duration})
Raison de départ : ${appInfo.background.leavingReason}
Plus belle réussite commerciale : ${appInfo.background.bestSale}
Plus gros échec commercial : ${appInfo.background.biggestFailure}
Ce qu'il/elle en a appris : ${appInfo.background.failureLesson}

MOTIVATION :
Pourquoi rejoindre EDICOM : ${appInfo.motivation.whyEdicom}
Ce qui le/la motive le plus : ${appInfo.motivation.whatMotivates}
`
      : "";

  const openBlock = r.openResponses
    ? `MISE EN SITUATION ORALE (pitch de 1 minute pour présenter Télécontact.ma à un dirigeant) :
${r.openResponses.pitch}

POURQUOI IL/ELLE PENSE MÉRITER LE POSTE :
${r.openResponses.whyHireYou}
`
    : "";

  return `Tu es un expert RH spécialisé dans le recrutement de commerciaux terrain B2B (visites physiques chez le prospect, pas de vente par téléphone). Une entreprise marocaine (EDICOM / Télécontact.ma) a fait passer un test de pré-qualification à un candidat commercial. Voici ses réponses brutes :

SCORES PAR COMPÉTENCE : ${dimLines}
SCORE GLOBAL : ${r.globalScore}/100 — recommandation automatique : ${r.recommendation}

RÉPONSES AU QUESTIONNAIRE COMPORTEMENTAL (échelle 1-5) :
${behavLines}

RÉPONSES AUX MISES EN SITUATION :
${sjtLines}

${backgroundBlock}
${openBlock}
À partir de ces réponses concrètes (pas des scores seuls), rédige :
1. Une courte synthèse (3-4 phrases maximum, en français) de ce que ces réponses révèlent vraiment sur ce candidat pour un poste terrain — ton factuel, sans jargon RH creux, en citant au moins un élément concret de ses réponses.
2. Exactement 5 questions d'entretien, en français, à poser à CE candidat précis. Chaque question doit être directement motivée par une réponse spécifique qu'il/elle a donnée (mentionne le sujet concerné), pas une question générique. Formule-les comme un recruteur les poserait à l'oral.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown, au format exact :
{"synthesis": "...", "questions": ["...", "...", "...", "...", "..."]}`;
}

export async function generateAiBrief(
  candidate: CandidateRecord
): Promise<{ ok: true; brief: AiBriefResult } | { ok: false; error: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Aucune clé API Anthropic configurée. Ajoutez la variable d'environnement ANTHROPIC_API_KEY pour activer cette fonctionnalité.",
    };
  }
  if (!candidate.result?.isComplete) {
    return { ok: false, error: "Ce candidat n'a pas encore terminé son test." };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: buildPrompt(candidate) }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `Erreur API Anthropic (${response.status}) : ${text.slice(0, 200)}` };
    }

    const data = await response.json();
    const text = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();

    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.synthesis || !Array.isArray(parsed.questions)) {
      return { ok: false, error: "Réponse IA dans un format inattendu." };
    }

    return { ok: true, brief: { synthesis: String(parsed.synthesis), questions: parsed.questions.map(String) } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur inconnue lors de l'appel à l'IA." };
  }
}
