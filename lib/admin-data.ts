import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CandidateStatus,
  Recommendation,
  DimensionScore,
  PersonalInfo,
  ProfessionalBackground,
  Motivation,
  OpenResponses,
} from "@/lib/types";

export interface AiBrief {
  synthesis: string;
  questions: string[];
  generatedAt: string;
}

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
    isComplete: boolean;
    updatedAt: string;
    dims: DimensionScore[] | null;
    behavAvg: number | null;
    sjtScore: number | null;
    sjtTotal: number | null;
    globalScore: number | null;
    recommendation: Recommendation | null;
    behavioralAnswers: { id: string; val: number }[];
    sjtAnswers: { id: string; optionId: string }[];
    submittedAt: string | null;
    aiBrief: AiBrief | null;
    applicationInfo: {
      personalInfo: PersonalInfo | null;
      background: ProfessionalBackground | null;
      motivation: Motivation | null;
    } | null;
    openResponses: OpenResponses | null;
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
              isComplete: !!r.is_complete,
              updatedAt: r.updated_at,
              dims: (r.dimension_scores as DimensionScore[] | null) ?? null,
              behavAvg: r.behav_avg,
              sjtScore: r.sjt_score,
              sjtTotal: r.sjt_total,
              globalScore: r.global_score,
              recommendation: (r.recommendation as Recommendation | null) ?? null,
              behavioralAnswers: r.behavioral_answers ?? [],
              sjtAnswers: r.sjt_answers ?? [],
              submittedAt: r.submitted_at,
              aiBrief: (r.ai_brief as AiBrief | null) ?? null,
              applicationInfo:
                (r.application_info as {
                  personalInfo: PersonalInfo | null;
                  background: ProfessionalBackground | null;
                  motivation: Motivation | null;
                } | null) ?? null,
              openResponses: (r.open_responses as OpenResponses | null) ?? null,
            }
          : null,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export interface Analytics {
  totalCandidates: number;
  statusCounts: Record<CandidateStatus, number>;
  recommendationCounts: Record<Recommendation, number>;
  completedCount: number;
  conversionRate: number; // completed / (total - invited-not-started is excluded)
  avgGlobalScore: number;
  avgDimensions: { key: string; label: string; avgPct: number }[];
  scoreDistribution: { label: string; count: number }[];
  topCandidates: CandidateRecord[];
}

const STATUS_KEYS: CandidateStatus[] = [
  "invited",
  "in_progress",
  "completed",
  "interviewed",
  "hired",
  "rejected",
];

export async function getAnalytics(): Promise<Analytics> {
  const all = await getAllCandidates();
  const completed = all.filter((c) => c.result?.isComplete);

  const statusCounts = STATUS_KEYS.reduce((acc, s) => {
    acc[s] = all.filter((c) => c.status === s).length;
    return acc;
  }, {} as Record<CandidateStatus, number>);

  const recommendationCounts: Record<Recommendation, number> = { good: 0, watch: 0, risk: 0 };
  completed.forEach((c) => {
    recommendationCounts[c.result!.recommendation!] += 1;
  });

  const avgGlobalScore = completed.length
    ? Math.round(completed.reduce((sum, c) => sum + c.result!.globalScore!, 0) / completed.length)
    : 0;

  const dimKeys = completed[0]?.result?.dims?.map((d) => d.key) ?? [];
  const avgDimensions = dimKeys.map((key) => {
    const scores = completed.map((c) => c.result!.dims!.find((d) => d.key === key)?.pct ?? 0);
    const label = completed[0]!.result!.dims!.find((d) => d.key === key)!.label;
    return { key, label, avgPct: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) };
  });

  const bands = [
    { label: "0–39", min: 0, max: 39 },
    { label: "40–54", min: 40, max: 54 },
    { label: "55–64", min: 55, max: 64 },
    { label: "65–74", min: 65, max: 74 },
    { label: "75–84", min: 75, max: 84 },
    { label: "85–100", min: 85, max: 100 },
  ];
  const scoreDistribution = bands.map((b) => ({
    label: b.label,
    count: completed.filter((c) => c.result!.globalScore! >= b.min && c.result!.globalScore! <= b.max).length,
  }));

  const topCandidates = [...completed].sort((a, b) => b.result!.globalScore! - a.result!.globalScore!).slice(0, 5);

  const invitedTotal = all.length;
  const conversionRate = invitedTotal ? Math.round((completed.length / invitedTotal) * 100) : 0;

  return {
    totalCandidates: all.length,
    statusCounts,
    recommendationCounts,
    completedCount: completed.length,
    conversionRate,
    avgGlobalScore,
    avgDimensions,
    scoreDistribution,
    topCandidates,
  };
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

import type { InterviewStatus, InterviewOutcome } from "@/lib/types";

export interface InterviewRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateScore: number | null;
  candidateRecommendation: Recommendation | null;
  scheduledAt: string;
  location: string | null;
  interviewer: string | null;
  status: InterviewStatus;
  outcome: InterviewOutcome | null;
  outcomeNotes: string | null;
  createdAt: string;
}

export interface InterviewsBoard {
  toSchedule: CandidateRecord[];
  upcoming: InterviewRecord[];
  history: InterviewRecord[];
}

export async function getInterviewsBoard(): Promise<InterviewsBoard> {
  const admin = createAdminClient();
  const [allCandidates, { data: interviewRows }] = await Promise.all([
    getAllCandidates(),
    admin.from("interviews").select("*").order("scheduled_at", { ascending: true }),
  ]);

  const candidateMap = new Map(allCandidates.map((c) => [c.id, c]));

  const records: InterviewRecord[] = (interviewRows ?? []).map((row) => {
    const c = candidateMap.get(row.candidate_id);
    return {
      id: row.id,
      candidateId: row.candidate_id,
      candidateName: c?.fullName ?? "—",
      candidateEmail: c?.email ?? "",
      candidateScore: c?.result?.globalScore ?? null,
      candidateRecommendation: c?.result?.recommendation ?? null,
      scheduledAt: row.scheduled_at,
      location: row.location,
      interviewer: row.interviewer,
      status: row.status as InterviewStatus,
      outcome: row.outcome as InterviewOutcome | null,
      outcomeNotes: row.outcome_notes,
      createdAt: row.created_at,
    };
  });

  const activeCandidateIds = new Set(
    records.filter((r) => r.status === "scheduled").map((r) => r.candidateId)
  );

  const toSchedule = allCandidates.filter(
    (c) => !activeCandidateIds.has(c.id) && c.status !== "hired" && c.status !== "rejected"
  );

  const statusPriority: Record<string, number> = { completed: 0, in_progress: 1, invited: 2, interviewed: 3 };
  toSchedule.sort((a, b) => (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9));

  const upcoming = records
    .filter((r) => r.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const history = records
    .filter((r) => r.status !== "scheduled")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return { toSchedule, upcoming, history };
}

export async function getInterviewsForCandidate(candidateId: string): Promise<InterviewRecord[]> {
  const board = await getInterviewsBoard();
  return [...board.upcoming, ...board.history]
    .filter((r) => r.candidateId === candidateId)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}
