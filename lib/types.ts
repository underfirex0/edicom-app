export type Recommendation = "good" | "watch" | "risk";

export type InterviewStatus = "scheduled" | "completed" | "no_show" | "cancelled";
export type InterviewOutcome = "hire" | "second_round" | "reject";

export type CandidateStatus =
  | "invited"
  | "in_progress"
  | "completed"
  | "interviewed"
  | "hired"
  | "rejected";

export interface DimensionScore {
  key: string;
  label: string;
  pct: number;
}

export interface ResultsSummary {
  dims: DimensionScore[];
  behavAvg: number;
  sjtScore: number;
  sjtTotal: number;
  globalScore: number;
  recommendation: Recommendation;
  weakDims: string[];
  weakItems: string[];
  weakScenarios: { theme: string; text: string; score: number; note?: string }[];
}
