import { requireCandidate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPublicQuestions } from "@/lib/scoring";
import TestWizard from "./TestWizard";

export default async function TestPage() {
  const { user, profile } = await requireCandidate();
  const supabase = createClient();
  const { data: candidate } = await supabase
    .from("candidates")
    .select("status")
    .eq("id", user!.id)
    .single();

  if (!candidate) redirect("/login");
  if (candidate.status === "completed") redirect("/test/already-submitted");

  return <TestWizard candidateName={profile?.full_name ?? "candidat(e)"} questions={getPublicQuestions()} />;
}
