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

// Saved after every section the candidate completes — so the admin sees
// answers live, without waiting for the whole test to be submitted.
export interface ProgressPayload {
  applicationInfo?: {
    personalInfo?: PersonalInfo | null;
    background?: ProfessionalBackground | null;
    motivation?: Motivation | null;
  };
  behavAnswers?: { id: string; val: number }[];
  sjtAnswers?: { id: string; optionId: string }[];
  openResponses?: Partial<OpenResponses>;
}

export async function saveProgressAction(payload: ProgressPayload) {
  const { user } = await requireCandidate();
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("test_results")
    .select("application_info, open_responses, is_complete")
    .eq("candidate_id", user!.id)
    .maybeSingle();

  if (existing?.is_complete) {
    // Test already fully submitted — never overwrite a finished record.
    return { ok: true };
  }

  const mergedApplicationInfo = payload.applicationInfo
    ? { ...(existing?.application_info ?? {}), ...payload.applicationInfo }
    : existing?.application_info;

  const mergedOpenResponses = payload.openResponses
    ? { ...(existing?.open_responses ?? {}), ...payload.openResponses }
    : existing?.open_responses;

  const row: Record<string, unknown> = {
    candidate_id: user!.id,
    updated_at: new Date().toISOString(),
  };
  if (mergedApplicationInfo !== undefined) row.application_info = mergedApplicationInfo;
  if (mergedOpenResponses !== undefined) row.open_responses = mergedOpenResponses;
  if (payload.behavAnswers) row.behavioral_answers = payload.behavAnswers;
  if (payload.sjtAnswers) row.sjt_answers = payload.sjtAnswers;

  const { error } = await admin.from("test_results").upsert(row, { onConflict: "candidate_id" });
  if (error) return { ok: false, error: error.message };

  // Reflect "in progress" on the candidate as soon as we have any live data.
  await admin
    .from("candidates")
    .update({ status: "in_progress" })
    .eq("id", user!.id)
    .eq("status", "invited");

  return { ok: true };
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

  const { error: upsertErr } = await admin.from("test_results").upsert(
    {
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
      is_complete: true,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "candidate_id" }
  );
  if (upsertErr) return { ok: false, error: upsertErr.message };

  await admin
    .from("candidates")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", user!.id);

  return { ok: true };
}
