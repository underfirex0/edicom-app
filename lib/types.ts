export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  age: string;
  familyStatus: string;
  drivingLicense: boolean | null;
  vehicle: boolean | null;
  availability: string;
  desiredSalary: string;
  startDate: string;
}

export interface ProfessionalBackground {
  lastPosition: string;
  company: string;
  duration: string;
  leavingReason: string;
  bestSale: string;
  biggestFailure: string;
  failureLesson: string;
}

export interface Motivation {
  whyEdicom: string;
  whatMotivates: string;
}

export interface OpenResponses {
  pitch: string;
  whyHireYou: string;
}

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
