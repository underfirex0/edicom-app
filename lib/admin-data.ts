import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CandidateStatus, Recommendation, DimensionScore } from "@/lib/types";

export interface CandidateRecord {
  id: string;
  fullName: string;
  email: string;
  position: string;
  status: CandidateStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  result: {
    dims: DimensionScore[];
    behavAvg: number;
    sjtScore: number;
    sjtTotal: number;
    globalScore: number;
    recommendation: Recommendation;
    behavioralAnswers: { id: string; val: number }[];
    sjtAnswers: { id: string; optionId: string }[];
    submittedAt: string;
  } | null;
}

export async function getAllCandidates(): Promise<CandidateRecord[]> {
  const admin = createAdminClient();
  const [{ data: profiles }, { data: candidates }, { data: results }] = await Promise.all([
    admin.from("profiles").select("id, full_name, email").eq("role", "candidate"),
    admin.from("candidates").select("*"),
    admin.from("test_results").select("*"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const resultMap = new Map((results ?? []).map((r) => [r.candidate_id, r]));

  return (candidates ?? [])
    .map((c) => {
      const p = profileMap.get(c.id);
      const r = resultMap.get(c.id);
      return {
        id: c.id,
        fullName: p?.full_name ?? "—",
        email: p?.email ?? "",
        position: c.position,
        status: c.status as CandidateStatus,
        createdAt: c.created_at,
        startedAt: c.started_at,
        completedAt: c.completed_at,
        result: r
          ? {
              dims: r.dimension_scores,
              behavAvg: r.behav_avg,
              sjtScore: r.sjt_score,
              sjtTotal: r.sjt_total,
              globalScore: r.global_score,
              recommendation: r.recommendation as Recommendation,
              behavioralAnswers: r.behavioral_answers,
              sjtAnswers: r.sjt_answers,
              submittedAt: r.submitted_at,
            }
          : null,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCandidateById(id: string): Promise<CandidateRecord | null> {
  const all = await getAllCandidates();
  return all.find((c) => c.id === id) ?? null;
}

export interface NoteRecord {
  id: string;
  note: string;
  createdAt: string;
  authorName: string;
}

export async function getNotesForCandidate(candidateId: string): Promise<NoteRecord[]> {
  const admin = createAdminClient();
  const { data: notes } = await admin
    .from("candidate_notes")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (!notes || !notes.length) return [];

  const adminIds = Array.from(new Set(notes.map((n) => n.admin_id).filter(Boolean)));
  const { data: admins } = await admin.from("profiles").select("id, full_name").in("id", adminIds);
  const adminMap = new Map((admins ?? []).map((a) => [a.id, a.full_name]));

  return notes.map((n) => ({
    id: n.id,
    note: n.note,
    createdAt: n.created_at,
    authorName: adminMap.get(n.admin_id) ?? "Administrateur",
  }));
}
