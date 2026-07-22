"use server";

import { requireCandidate } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeResults, DEFAULT_CONFIG, type ScoringConfig } from "@/lib/scoring";
import type { PersonalInfo, ProfessionalBackground, Motivation, OpenResponses } from "@/lib/types";

export interface SubmitPayload {
  personalInfo: PersonalInfo;
  background: ProfessionalBackground;
  motivation: Motivation;
  behavAnswers: { id: string; val: number }[];
  sjtAnswers: { id: string; optionId: string }[];
  openResponses: OpenResponses;
}

export async function submitTestAction(payload: SubmitPayload) {
  const { user } = await requireCandidate();
  const admin = createAdminClient();

  const { data: candidate } = await admin
    .from("candidates")
    .select("status")
    .eq("id", user!.id)
    .single();

  if (candidate?.status === "completed") {
    return { ok: true }; // idempotent — already submitted
  }

  const { data: configRow } = await admin.from("scoring_config").select("*").eq("id", 1).single();
  const config: ScoringConfig = configRow
    ? {
        behavWeight: Number(configRow.behav_weight),
        sjtWeight: Number(configRow.sjt_weight),
        thresholdGood: configRow.threshold_good,
        thresholdWatch: configRow.threshold_watch,
      }
    : DEFAULT_CONFIG;

  const results = computeResults(payload.behavAnswers, payload.sjtAnswers, config);

  const { error: insertErr } = await admin.from("test_results").insert({
    candidate_id: user!.id,
    application_info: { personalInfo: payload.personalInfo, background: payload.background, motivation: payload.motivation },
    open_responses: payload.openResponses,
    behavioral_answers: payload.behavAnswers,
    sjt_answers: payload.sjtAnswers,
    dimension_scores: results.dims,
    behav_avg: results.behavAvg,
    sjt_score: results.sjtScore,
    sjt_total: results.sjtTotal,
    global_score: results.globalScore,
    recommendation: results.recommendation,
  });
  if (insertErr) return { ok: false, error: insertErr.message };

  await admin
    .from("candidates")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", user!.id);

  return { ok: true };
}
